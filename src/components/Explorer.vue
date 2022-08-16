<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi, Folder, File } from "../api/chain-api";
import { useUserStore } from "../store/userStore";

import { ref, watch, watchEffect, onMounted, computed } from "vue";
import Loader from "./utils/Loader.vue";
import { folderId } from "../router";
import { useRouter } from "vue-router";

// File icons
import FileTile from "./widgets/FileTile.vue";
import FolderTile from "./widgets/FolderTile.vue";
import EditFolderModal from "./widgets/EditFolderModal.vue";
import PathBar from "./widgets/PathBar.vue";
import RemoveModal from "./widgets/RemoveModal.vue";
import Viewer from "./viewer/Viewer.vue";

const { api, wallet } = useChainApi();
const { isLoggedIn } = useUserStore();
const router = useRouter();
const editFolderModal = ref<null | InstanceType<typeof EditFolderModal>>(null);
const removeModal = ref<null | InstanceType<typeof RemoveModal>>(null);

const props = defineProps<{
  path: string[];
  file?: string;
}>();

watch([props], () => {});

// Fetch
const fetchChildren = useAsyncState(
  async () => {
    if (!api.value) return;
    const folder = folderId(props.path);
    return await api.value.fetchChildren(folder, true);
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

function onFolderUpdated() {
  fetchChildren.execute();
}

function onRemoved() {
  fetchChildren.execute();
}

defineExpose({ editFolder, removeFolder });
</script>

<template>
  <div class="flex flex-col">
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
    <div v-else class="grid grid-cols-2 gap-3 p-3">
      <!-- Folder -->
      <FolderTile
        v-for="folder in folders"
        :path="path"
        :folder="folder.account"
        :onEdit="() => editFolder(folder.account)"
        :onRemove="() => removeFolder(folder.account)"
      >
      </FolderTile>
      <!-- File -->
      <FileTile
        v-for="file in files"
        :file="file.account"
        :onEdit="() => editFile(file.account)"
        :onRemove="() => removeFile(file.account)"
      >
      </FileTile>
    </div>
    <!-- Edit folder modal -->
    <EditFolderModal
      ref="editFolderModal"
      :onFolderUpdated="onFolderUpdated"
    ></EditFolderModal>
    <!-- Remove file & folder modal -->
    <RemoveModal ref="removeModal" :onRemoved="onRemoved"></RemoveModal>
    <!-- File viewer -->
    <Viewer
      v-if="files"
      :onEdit="editFile"
      :onRemove="removeFile"
      :files="files.map((f) => f.account)"
      :fileId="props.file"
    ></Viewer>
  </div>
</template>
