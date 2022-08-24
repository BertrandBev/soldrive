<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { Folder, useWrappedApi } from "../../api/wrappedApi";
import { useUserStore } from "../../store/userStore";
import { useRouter, useRoute } from "vue-router";

import { ref, watchEffect, onMounted, computed } from "vue";
import Loader from "../utils/Loader.vue";
import ContextMenu from "../utils/ContextMenu.vue";
import { useClipbardStore } from "../../store/clipboardStore";

// File icons
const router = useRouter();
const { pushFile, pushFolder, hasFolder } = useClipbardStore();
const api = useWrappedApi();

const props = defineProps<{
  path: string[];
  folder: Folder;
  onEdit: () => void;
  onRemove: () => void;
}>();

const menu = ref<null | InstanceType<typeof ContextMenu>>(null);
const dragHighlight = ref(false);

function contextHandler(clickData: MouseEvent) {
  if (menu.value) {
    menu.value.open(clickData);
  }
}

function onClick() {
  const path = [...props.path, props.folder.id].join("/");
  router.push({ path: `/explorer/${path}` });
}

const isMoving = computed(() => {
  return hasFolder(props.folder);
});

function move() {
  pushFolder(props.folder);
}

function onDragStart(ev: any) {
  ev.dataTransfer.setData("folder", props.folder.id);
}

function onDragLeave(ev: any) {
  ev.preventDefault();
  dragHighlight.value = false;
}

function onDragOver(ev: any) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
  dragHighlight.value = true;
}

async function onDrop(ev: any) {
  ev.preventDefault();
  dragHighlight.value = false;
  if (ev.dataTransfer.getData("file")) {
    const fileId = parseInt(ev.dataTransfer.getData("file"));
    const file = await api.value!.fetchFile(fileId, true);
    pushFile(file);
  } else if (ev.dataTransfer.getData("folder")) {
    const folderId = parseInt(ev.dataTransfer.getData("folder"));
    if (folderId == props.folder.id) return;
    const folder = await api.value!.fetchFolder(folderId);
    pushFolder(folder);
  }
  // Nav to self
  onClick();
}
</script>

<template>
  <div>
    <!-- Folder -->
    <div
      class="card card-bordered btn btn-ghost border-slate-500 w-full h-[196px] p-0 overflow-visible"
      :class="{ 'opacity-50': isMoving, 'bg-green-700': dragHighlight }"
      @contextmenu.prevent.stop="(ev) => contextHandler(ev)"
      style="text-transform: initial"
      @click="onClick()"
      draggable="true"
      :ondragstart="onDragStart"
      :ondragover="onDragOver"
      :ondragleave="onDragLeave"
      :ondrop="onDrop"
    >
      <!-- Icon -->
      <div class="absolute-center">
        <img
          src="../../assets/files/folder.png"
          class="w-[96px] h-[96px] object-contain"
          draggable="false"
        />
      </div>
      <!-- Name -->
      <div class="absolute bottom-0 left-0 p-3">
        <p class="text-2-lines text-left">
          {{ folder.name }}
        </p>
      </div>
    </div>
    <!-- Context -->
    <ContextMenu ref="menu">
      <li>
        <a href="#" @click.prevent="props.onEdit">Edit</a>
      </li>
      <li>
        <a href="#" @click.prevent="move">Move</a>
      </li>
      <li>
        <a href="#" @click.prevent="props.onRemove">Delete</a>
      </li>
    </ContextMenu>
  </div>
</template>
