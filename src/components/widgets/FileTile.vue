<script setup lang="ts">
import { File } from "../../api/wrappedApi";

import { ref, computed } from "vue";
import ContextMenu from "../utils/ContextMenu.vue";
import { useRouter, useRoute } from "vue-router";
import { fileIcon as _fileIcon } from "../../store/fileTypes";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/vue/solid";
import { useClipbardStore } from "../../store/clipboardStore";

const router = useRouter();
const route = useRoute();
const { pushFile, hasFile } = useClipbardStore();

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

function contextHandler(clickData: MouseEvent) {
  if (menu.value) {
    menu.value.open(clickData);
  }
}

function onClick() {
  const path = route.path;
  router.push({ path, query: { file: props.file.id } });
}

const isArweave = computed(() => {
  return props.file.backend == "arweave";
});

const isEncrypted = computed(() => {
  return props.file.access == "private";
});

const isMoving = computed(() => {
  return hasFile(props.file);
});

function move() {
  pushFile(props.file);
}

function onDragStart(ev: any) {
  ev.dataTransfer.setData("file", props.file.id);
}
</script>

<template>
  <div>
    <!-- File -->
    <div
      class="card card-bordered btn btn-ghost shadow-xl border-slate-500 w-full h-[196px] p-0 relative overflow-visible"
      :class="{ 'opacity-50': isMoving }"
      @contextmenu.prevent.stop="(ev) => contextHandler(ev)"
      style="text-transform: initial"
      @click="onClick()"
      draggable="true"
      :ondragstart="onDragStart"
    >
      <!-- Icon -->
      <div class="absolute-center">
        <img
          :src="fileIcon"
          class="w-[72px] h-[72px] object-contain"
          draggable="false"
        />
      </div>
      <!-- Tooltips -->
      <div
        class="absolute left-0 top-0 p-2 tooltip"
        :data-tip="isArweave ? 'on Arweave' : 'on Solana'"
      >
        <img
          v-if="isArweave"
          class="w-[16px] h-[16px]"
          src="../../assets/arweave-logo.png"
        />
        <img
          v-else
          class="w-[16px] h-[16px]"
          src="../../assets/solana-logo.png"
        />
      </div>
      <div
        class="absolute right-0 top-0 p-2 tooltip"
        :data-tip="isEncrypted ? 'encrypted' : 'unencrypted'"
      >
        <LockClosedIcon
          v-if="isEncrypted"
          class="w-[16px] h-[16px] text-green-400"
        ></LockClosedIcon>
        <LockOpenIcon
          v-else
          class="w-[16px] h-[16px] text-orange-400"
        ></LockOpenIcon>
      </div>
      <!-- Row -->
      <div class="absolute bottom-0 left-0 p-3">
        <!-- Name -->
        <p class="text-2-lines text-left">
          {{ props.file.name }}
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

<style></style>
