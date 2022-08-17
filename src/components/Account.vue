<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  PlusIcon,
  FolderAddIcon,
  DocumentAddIcon,
  FilterIcon,
} from "@heroicons/vue/outline";
import { useRoute, useRouter } from "vue-router";
import { folderId } from "../router";
import Explorer from "./Explorer.vue";
import { useFileStore } from "../store/fileStore";
import Stats from "./widgets/Stats.vue";
import FileStorage from "./widgets/FileStorage.vue";

const router = useRouter();
const {} = useFileStore();
</script>

<template>
  <div class="w-full h-full flex flex-col items-start p-8">
    <!-- Header -->
    <div class="flex items-center p-6 self-center">
      <img src="../assets/logo.png" width="64" height="64" />
      <div class="ml-4 text-xl font-bold">Account</div>
    </div>
    <!-- Stats -->
    <div class="text-xl font-bold mt-8">On-chain</div>
    <Stats class="mt-2"></Stats>
    <!-- File storage -->
    <div class="text-xl font-bold mt-8">File storage</div>
    <FileStorage class="mt-2"></FileStorage>
  </div>
</template>
