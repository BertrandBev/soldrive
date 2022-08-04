<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi, Folder } from "../../api/chain-api";
import { useUserStore } from "../../store/userStore";
//@ts-ignore
import { ref, watchEffect, onMounted, computed } from "vue";
import Loader from "../utils/Loader.vue";
//@ts-ignore
import ContextMenu from "../utils/ContextMenu.vue";

// File icons
const { api, wallet } = useChainApi();
const { isLoggedIn } = useUserStore();

const props = defineProps<{
  folder: Folder;
  onEdit: () => void;
  onRemove: () => void;
}>();

const menu = ref(null as any);

function handler(clickData: MouseEvent) {
  if (menu.value) {
    console.log("nadler", clickData);
    menu.value.open(clickData);
  }
}

function onClick() {
  console.log("click!");
}
</script>

<template>
  <div
    class="card card-bordered border-slate-500 w-[180px] h-[180px] items-center overflow-visible"
    @contextmenu.prevent="(ev) => handler(ev)"
  >
    <!-- Context -->
    <ContextMenu ref="menu">
      <li>
        <a href="#" @click.prevent="props.onEdit">Edit</a>
      </li>
      <li>
        <a href="#" @click.prevent="props.onRemove">Delete</a>
      </li>
    </ContextMenu>
    <!-- Icon -->
    <div class="flex-1 flex items-center">
      <img src="../../assets/files/folder.png" class="w-[96px] h-[96px]" />
    </div>
    <!-- Name -->
    <div class="flex p-2 items-center">
      <div>{{ folder.name }}</div>
    </div>
  </div>
</template>
