<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi, Folder } from "../../api/chain-api";
import { useUserStore } from "../../store/userStore";

import { ref, watchEffect, onMounted, computed } from "vue";
import Loader from "../utils/Loader.vue";
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
  <div>
    <!-- Card -->
    <div
      class="card card-bordered border-slate-500 w-[180px] h-[180px] items-center overflow-visible btn"
      @contextmenu.prevent="(ev) => handler(ev)"
    >
      <!-- Icon -->
      <div class="flex-1 flex items-center">
        <img src="../../assets/files/folder.png" class="w-[96px] h-[96px]" />
      </div>
      <!-- Name -->
      <div class="flex p-2 items-center">
        <div>{{ folder.name }}</div>
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

<style scoped>
/* .btn {
  display: inline-flex;
  flex-shrink: 0;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  border-color: transparent;
  border-color: hsl(var(--n) / var(--tw-border-opacity));
  text-align: center;
  transition-property: color, background-color, border-color, fill, stroke,
    opacity, box-shadow, transform, filter, -webkit-text-decoration-color,
    -webkit-backdrop-filter;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter, -webkit-text-decoration-color, -webkit-backdrop-filter;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--rounded-btn, 0.5rem);
  height: 3rem;
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  line-height: 1em;
  min-height: 3rem;
  font-weight: 600;
  text-transform: uppercase;
  text-transform: var(--btn-text-case, uppercase);
  -webkit-text-decoration-line: none;
  text-decoration-line: none;
  border-width: var(--border-btn, 1px);
  -webkit-animation: button-pop var(--animation-btn, 0.25s) ease-out;
  animation: button-pop var(--animation-btn, 0.25s) ease-out;
  --tw-border-opacity: 1;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--n) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--nc) / var(--tw-text-opacity));
} */
</style>
