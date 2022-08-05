<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi, Folder } from "../api/chain-api";
import { useUserStore } from "../store/userStore";

import { ref, watchEffect, onMounted, computed } from "vue";
import Loader from "./utils/Loader.vue";
import { folderId } from "../router";

// File icons
import FileTile from "./widgets/FileTile.vue";
import FolderTile from "./widgets/FolderTile.vue";
import EditFolderModal from "./EditFolderModal.vue";
import PathBar from "./widgets/PathBar.vue";

const { api, wallet } = useChainApi();
const { isLoggedIn } = useUserStore();
const editFolderModal = ref<null | InstanceType<typeof EditFolderModal>>(null);

const props = defineProps<{
  path: string[];
}>();

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
  // Confirmation modal!
}

function onFolderUpdated() {
  console.log("on folder updated!");
  fetchChildren.execute();
}

defineExpose({ editFolder, removeFolder });
</script>

<template>
  <div class="flex flex-col">
    <!-- PathBar -->
    <PathBar :path="props.path"></PathBar>
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
    <div v-else class="flex flex-wrap gap-3">
      <!-- Folder -->
      <FolderTile
        v-for="folder in folders"
        :path="props.path"
        :folder="folder.account"
        :onEdit="() => editFolder(folder.account)"
        :onRemove="() => removeFolder(folder.account)"
      >
      </FolderTile>
      <!-- File -->
      <FileTile v-for="file in files" :file="file.account"> </FileTile>
    </div>
    <!-- Edit folder modal -->
    <EditFolderModal
      ref="editFolderModal"
      :onFolderUpdated="onFolderUpdated"
    ></EditFolderModal>
    <!-- Remove folder modal -->
  </div>
</template>
