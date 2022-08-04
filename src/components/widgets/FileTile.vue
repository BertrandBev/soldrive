<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi, File } from "../../api/chain-api";
import { useUserStore } from "../../store/userStore";

import { ref, watchEffect, onMounted, computed } from "vue";
import Loader from "../utils/Loader.vue";

// File icons
import textLogo from "../../assets/files/text.png";

const { api, wallet } = useChainApi();
const { isLoggedIn } = useUserStore();

const props = defineProps<{
  file: File;
}>();

function fileIcon() {
  return textLogo;
}

function handler() {
  console.log("handler");
}
</script>

<template>
  <!-- File -->
  <div
    class="card card-bordered border-slate-500 w-[180px] h-[180px] items-center"
  >
    <!-- Icon -->
    <div class="flex-1 flex items-center">
      <img :src="fileIcon()" class="w-[96px] h-[96px]" />
    </div>
    <!-- Name -->
    <div class="flex p-2 items-center">
      <div>{{ props.file.name }}</div>
    </div>
  </div>
</template>
