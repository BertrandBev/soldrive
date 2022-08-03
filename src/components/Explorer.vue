<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi } from "../api/chain-api";
import { useUserStore } from "../store/userStore";

import { ref, watchEffect, onMounted, computed } from "vue";
import Loader from "./utils/Loader.vue";

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
      <div v-for="folder in folders">{{ folder.account }}</div>
      <!-- File -->
      <div
        v-for="file in files"
        class="card card-bordered border-2 w-[128px] h-[128px]"
      >
        <div>{{ file.account.name }}</div>
      </div>
    </div>
  </div>
</template>
