<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi, File } from "../../api/chain-api";
import { useUserStore } from "../../store/userStore";

import { ref, watchEffect, onMounted, computed } from "vue";
import Loader from "../utils/Loader.vue";
import ContextMenu from "../utils/ContextMenu.vue";
import { useRouter, useRoute } from "vue-router";
import { fileIcon as _fileIcon } from "../../store/fileTypes";

const { api, wallet } = useChainApi();
const { isLoggedIn } = useUserStore();
const router = useRouter();
const route = useRoute();

const props = defineProps<{
  file: File;
  onEdit: () => void;
  onRemove: () => void;
}>();

const menu = ref<null | InstanceType<typeof ContextMenu>>(null);

const fileIcon = computed(() => {
  const fileExt = props.file.fileExt;
  return _fileIcon(fileExt);
});

function handler(clickData: MouseEvent) {
  if (menu.value) {
    menu.value.open(clickData);
  }
}

function onClick() {
  const path = route.path;
  router.push({ path, query: { file: props.file.id } });
}
</script>

<template>
  <div>
    <!-- File -->
    <div
      class="card card-bordered btn btn-ghost shadow-xl border-slate-500 w-[180px] h-[180px] items-center"
      @contextmenu.prevent="(ev) => handler(ev)"
      @click="onClick()"
    >
      <!-- Icon -->
      <div class="flex-1 flex items-center">
        <img :src="fileIcon" class="w-[72px] h-[72px]" />
      </div>
      <!-- Name -->
      <div class="flex p-2 items-center">
        <div>{{ props.file.name }}</div>
      </div>
    </div>
    <!-- Context -->
    <ContextMenu ref="menu">
      <li>
        <a href="#" @click.prevent="props.onEdit">Edit</a>
      </li>
      <li>
        <a href="#" @click.prevent="props.onRemove">Delete</a>
      </li>
    </ContextMenu>
  </div>
</template>
