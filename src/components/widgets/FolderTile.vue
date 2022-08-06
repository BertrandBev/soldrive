<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi, Folder } from "../../api/chain-api";
import { useUserStore } from "../../store/userStore";
import { useRouter, useRoute } from "vue-router";

import { ref, watchEffect, onMounted, computed } from "vue";
import Loader from "../utils/Loader.vue";
import ContextMenu from "../utils/ContextMenu.vue";

// File icons
const { api, wallet } = useChainApi();
const { isLoggedIn } = useUserStore();
const router = useRouter();

const props = defineProps<{
  path: string[];
  folder: Folder;
  onEdit: () => void;
  onRemove: () => void;
}>();

const menu = ref<null | InstanceType<typeof ContextMenu>>(null);

function handler(clickData: MouseEvent) {
  if (menu.value) {
    menu.value.open(clickData);
  }
}

function onClick() {
  const path = [...props.path, props.folder.id].join("/");
  router.push({ path: `/explorer/${path}` });
}
</script>

<template>
  <div>
    <!-- Card -->
    <div
      class="card card-bordered btn btn-ghost border-slate-500 w-[180px] h-[180px] items-center overflow-visible"
      @contextmenu.prevent="(ev) => handler(ev)"
      @click="onClick()"
    >
      <!-- Icon -->
      <div class="flex-1 flex items-center">
        <img src="../../assets/files/folder.png" class="w-[96px] h-[96px]" />
      </div>
      <!-- Name -->
      <div class="flex p-2 items-center">
        {{ folder.name }}
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
