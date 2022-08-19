<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useWrappedApi, Folder, File } from "../api/wrappedApi";
import { useUserStore } from "../store/userStore";

import { ref, watch, watchEffect, onMounted, computed } from "vue";
import Loader from "./utils/Loader.vue";
import { folderId } from "../router";
import { useRouter } from "vue-router";
import { useClipbardStore } from "../store/clipboardStore";

// Components
import ContextMenu from "./utils/ContextMenu.vue";
import FileTile from "./widgets/FileTile.vue";
import FolderTile from "./widgets/FolderTile.vue";
import EditFolderModal from "./widgets/EditFolderModal.vue";
import PathBar from "./widgets/PathBar.vue";
import RemoveModal from "./widgets/RemoveModal.vue";
import Viewer from "./viewer/Viewer.vue";

const api = useWrappedApi();
const { isLoggedIn } = useUserStore();
const router = useRouter();
const { isEmpty: clipboardEmpty } = useClipbardStore();
const editFolderModal = ref<null | InstanceType<typeof EditFolderModal>>(null);
const removeModal = ref<null | InstanceType<typeof RemoveModal>>(null);
const viewer = ref<null | InstanceType<typeof Viewer>>(null);
const menu = ref<null | InstanceType<typeof ContextMenu>>(null);

function contextHandler(clickData: MouseEvent) {
  if (menu.value) {
    menu.value.open(clickData);
  }
}

const props = defineProps<{
  path: string[];
  file?: string;
  onNewFile: () => void;
  onMove: () => void;
}>();

watch([props], () => {});

// Fetch
const fetchChildren = useAsyncState(
  async () => {
    if (!api.value) return;
    const folder = folderId(props.path);
    const children = await api.value.fetchChildren(folder, true);
    viewer.value?.clearCache();
    return children;
  },
  null,
  {
    immediate: false,
    onError: (e) => {
      console.error(e);
    },
  }
);

watchEffect(async () => {
  if (isLoggedIn.value) {
    await fetchChildren.execute();
  }
});

const files = computed(() => {
  return fetchChildren.state.value?.files || [];
});

const folders = computed(() => {
  return fetchChildren.state.value?.folders || [];
});

const isEmpty = computed(() => {
  return (
    !fetchChildren.isLoading.value &&
    !files.value.length &&
    !folders.value.length
  );
});

function editFolder(folder?: Folder) {
  const parent = folderId(props.path);
  editFolderModal.value?.open(parent, folder);
}

function removeFolder(folder: Folder) {
  removeModal.value?.openForFolder(folder);
}

function editFile(file?: File) {
  const folder = folderId(props.path || []);
  router.push({ path: "/file", query: { folder, id: file?.id } });
}

function removeFile(file: File) {
  removeModal.value?.openForFile(file);
}

function loadChildren() {
  fetchChildren.execute();
}

defineExpose({ editFolder, removeFolder, loadChildren });
</script>

<template>
  <div
    class="flex flex-col"
    @contextmenu.prevent.stop="(ev) => contextHandler(ev)"
  >
    <!-- PathBar -->
    <PathBar :path="path"></PathBar>
    <!-- Loader -->
    <div
      v-if="fetchChildren.isLoading.value || isEmpty"
      class="w-full h-[256px] flex items-center justify-center"
    >
      <Loader v-if="fetchChildren.isLoading.value" class="w-5 h-5"></Loader>
      <div v-else-if="fetchChildren.error.value">File loading error</div>
      <div v-else-if="isEmpty">The directory is empty</div>
    </div>
    <!-- Files -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 p-5"
    >
      <!-- Folder -->
      <FolderTile
        v-for="folder in folders"
        :path="path"
        :folder="folder"
        :onEdit="() => editFolder(folder)"
        :onRemove="() => removeFolder(folder)"
      >
      </FolderTile>
      <!-- File -->
      <FileTile
        v-for="file in files"
        :file="file"
        :onEdit="() => editFile(file)"
        :onRemove="() => removeFile(file)"
      >
      </FileTile>
    </div>
    <!-- Edit folder modal -->
    <EditFolderModal
      ref="editFolderModal"
      :onFolderUpdated="loadChildren"
    ></EditFolderModal>
    <!-- Remove file & folder modal -->
    <RemoveModal ref="removeModal" :onRemoved="loadChildren"></RemoveModal>
    <!-- File viewer -->
    <Viewer
      ref="viewer"
      v-if="files"
      :onEdit="editFile"
      :onRemove="removeFile"
      :files="files.map((f) => f)"
      :fileId="props.file"
    ></Viewer>
    <!-- Context -->
    <ContextMenu ref="menu">
      <li>
        <a href="#" @click.prevent="() => editFolder()">New folder</a>
      </li>
      <li>
        <a href="#" @click.prevent="props.onNewFile">New file</a>
      </li>
      <li v-if="!clipboardEmpty">
        <a href="#" @click.prevent="props.onMove">Paste content</a>
      </li>
    </ContextMenu>
  </div>
</template>
