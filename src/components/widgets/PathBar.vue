<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi, Folder } from "../../api/chain-api";
import { useUserStore } from "../../store/userStore";
import { useRoute, useRouter } from "vue-router";
import { computed, watchEffect, watch } from "vue";
import Loader from "../utils/Loader.vue";

const route = useRoute();
const router = useRouter();

// File icons
const { api, wallet } = useChainApi();
const { isLoggedIn } = useUserStore();

const props = defineProps<{
  path: string[];
}>();

// Parse path
const parsed = computed(() => {
  return (props.path || [])
    .map((str) => parseInt(str))
    .filter((id) => !isNaN(id));
});

const {
  state: path,
  isLoading: pathLoading,
  execute: loadPath,
} = useAsyncState(
  async () => {
    if (!api.value || parsed.value == undefined) return [];
    let rtn = await api.value.fetchFolders(parsed.value);
    const folders = rtn.map((folder) => folder.account);
    const root = { id: 0, name: "Root" } as Folder;
    return [root, ...folders];
  },
  [],
  {
    immediate: false,
    onError: (e) => {
      console.error(e);
    },
  }
);

// Fetch path
watch([parsed], () => loadPath(), { immediate: true });

// Nav
function onClick(idx: number) {
  const path = props.path.slice(0, idx).join("/");
  router.push({ path: `/explorer/${path}` });
}

// route.
</script>

<template>
  <div class="flex items-center">
    <!-- <Loader v-if="pathLoading" class="w-5 h-5"></Loader> -->
    <div v-if="pathLoading"></div>
    <template v-else v-for="(folder, idx) in path">
      <!-- :class="{ 'btn-disabled': idx >= path.length - 1 }" -->
      <div class="btn btn-ghost" @click="() => onClick(idx)">
        {{ folder.name }}
      </div>
      <div v-if="idx < path.length - 1" class="px-2">></div>
    </template>
  </div>
</template>
