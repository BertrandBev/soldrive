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
import { useClipbardStore } from "../store/clipboardStore";
import ClipboardBar from "./widgets/ClipboardBar.vue";

const router = useRouter();
const { isEmpty } = useClipbardStore();
const explorer = ref<null | InstanceType<typeof Explorer>>(null);

const props = defineProps<{
  path: string | string[];
  file?: string;
}>();

const folder = computed(() => folderId(path.value));
const path = computed(() => (Array.isArray(props.path) ? props.path : []));

function newFile() {
  router.push({ path: "/file", query: { folder: folder.value } });
}

function onMoved() {
  explorer.value!.loadChildren();
}
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <!-- Toolbar -->
    <div v-if="isEmpty" class="w-full flex mt-2 mb-2">
      <!-- Filter -->
      <div class="tooltip tooltip-right" data-tip="feature coming soon">
        <button class="btn btn-ghost gap-2">
          Filter
          <FilterIcon class="w-5 h-5"></FilterIcon>
        </button>
      </div>
      <!-- Spacer -->
      <div class="flex-1"></div>
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
    <!-- Clipboard -->
    <ClipboardBar v-else :folder="folder" :onMoved="onMoved"></ClipboardBar>
    <!-- Explorer -->
    <Explorer ref="explorer" :path="path" :file="file"></Explorer>
  </div>
</template>
