<script setup lang="ts">
import { ref, computed } from "vue";
import {
  PlusIcon,
  FolderAddIcon,
  DocumentAddIcon,
  FilterIcon,
} from "@heroicons/vue/outline";
import { useRoute, useRouter } from "vue-router";
import { folderId } from "../router";
import Explorer from "./Explorer.vue";

const router = useRouter();
const explorer = ref<null | InstanceType<typeof Explorer>>(null);

const props = defineProps<{
  path: string | string[];
  file?: string;
}>();
const path = computed(() => (Array.isArray(props.path) ? props.path : []));

function newFile() {
  const folder = folderId(path.value);
  router.push({ path: "/file", query: { folder } });
}
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <!-- Toolbar -->
    <div class="w-full flex mt-2 mb-2">
      <!-- Filter -->
      <button class="btn btn-ghost gap-2">
        Filter
        <FilterIcon class="w-5 h-5"></FilterIcon>
      </button>
      <!-- Spacer -->
      <div class="w-full"></div>
      <!-- Add button -->
      <button class="btn btn-ghost gap-2" @click="explorer?.editFolder()">
        New folder
        <FolderAddIcon class="w-5 h-5"></FolderAddIcon>
      </button>
      <!-- New folder -->
      <button class="btn btn-ghost gap-2" @click="newFile">
        New file
        <DocumentAddIcon class="w-5 h-5"></DocumentAddIcon>
      </button>
    </div>
    <!-- Explorer -->
    <Explorer ref="explorer" :path="path" :file="file"></Explorer>
  </div>
</template>
