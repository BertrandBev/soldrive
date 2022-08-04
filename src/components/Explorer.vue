<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi, Folder } from "../api/chain-api";
import { useUserStore } from "../store/userStore";

import { ref, watchEffect, onMounted, computed } from "vue";
import Loader from "./utils/Loader.vue";

// File icons
import textLogo from "../assets/files/text.png";
import FileTile from "./widgets/FileTile.vue";
import FolderTile from "./widgets/FolderTile.vue";
import EditFolderModal from "./EditFolderModal.vue";

const { api, wallet } = useChainApi();
const { isLoggedIn } = useUserStore();
const editFolderModal = ref<null | InstanceType<typeof EditFolderModal>>(null);

const id = 0;

// Fetch
const fetchChildren = useAsyncState(
  async () => {
    if (!api.value) return;
    return await api.value.fetchChildren(id, true);
  },
  null,
  { immediate: false }
);

watchEffect(async () => {
  if (isLoggedIn.value) {
    console.log("FETCH CHILDREN!");
    await fetchChildren.execute();
    console.log("RES: ", fetchChildren.state.value);
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
  console.log("edit folder", folder);
  editFolderModal.value?.open(folder);
}

function removeFolder(folder: Folder) {
  // Confirmation modal!
}

function onFolderUpdated() {
  console.log('on folder updated!');
  fetchChildren.execute();
}

defineExpose({ editFolder, removeFolder });
</script>

<template>
  <div>
    <!-- Loader -->
    <div
      v-if="fetchChildren.isLoading.value || isEmpty"
      class="w-full h-[256px] flex items-center justify-center"
    >
      <Loader v-if="fetchChildren.isLoading" class="w-5 h-5"></Loader>
      <div v-else-if="isEmpty">The directory is empty</div>
    </div>
    <!-- Files -->
    <div v-else class="flex flex-wrap gap-3">
      <!-- Folder -->
      <FolderTile
        v-for="folder in folders"
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
