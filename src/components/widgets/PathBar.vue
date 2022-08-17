<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useWrappedApi, Folder } from "../../api/wrappedApi";
import { useUserStore } from "../../store/userStore";
import { useRoute, useRouter } from "vue-router";
import { computed, watchEffect, watch } from "vue";
import Loader from "../utils/Loader.vue";

const route = useRoute();
const router = useRouter();

// File icons
const api = useWrappedApi();
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
    let folders = await api.value.fetchFolders(parsed.value);
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
  <div class="text-md breadcrumbs px-4">
    <!-- <Loader v-if="pathLoading" class="w-5 h-5"></Loader> -->
    <!-- <div v-if="pathLoading"></div> -->
    <ul v-if="!pathLoading">
      <li v-for="(folder, idx) in path">
        <a @click="() => onClick(idx)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="w-5 h-5 mr-2 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            ></path>
          </svg>
          {{ folder.name }}
        </a>
      </li>
    </ul>
  </div>
</template>

<style>
.breadcrumbs > ul > li + *:before {
  opacity: 100;
}
</style>
