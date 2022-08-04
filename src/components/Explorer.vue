<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi, File } from "../api/chain-api";
import { useUserStore } from "../store/userStore";

import { ref, watchEffect, onMounted, computed } from "vue";
import Loader from "./utils/Loader.vue";

// File icons
import textLogo from "../assets/files/text.png";

const { api, wallet } = useChainApi();
const { isLoggedIn } = useUserStore();

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

function fileIcon(file: File) {
  return textLogo;
}

function handler() {
  console.log('handler');
}
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
      <div
        v-for="folder in folders"
        class="card card-bordered border-slate-500 w-[180px] h-[180px] items-center"
        @contextmenu.prevent="handler"
      >
        <!-- Icon -->
        <div class="flex-1 flex items-center">
          <img src="../assets/files/folder.png" class="w-[96px] h-[96px]" />
        </div>
        <!-- Name -->
        <div class="flex p-2 items-center">
          <div>{{ folder.account.name }}</div>
        </div>
      </div>
      <!-- File -->
      <div
        v-for="file in files"
        class="card card-bordered border-slate-500 w-[180px] h-[180px] items-center"
      >
        <!-- Icon -->
        <div class="flex-1 flex items-center">
          <img :src="fileIcon(file.account)" class="w-[96px] h-[96px]" />
        </div>
        <!-- Name -->
        <div class="flex p-2 items-center">
          <div>{{ file.account.name }}</div>
        </div>
      </div>
    </div>
    <!-- Edit folder modal -->
    <EditFolderModal></EditFolderModal>
  </div>
</template>
