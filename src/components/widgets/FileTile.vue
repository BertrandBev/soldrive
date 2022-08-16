<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import { useChainApi, File } from "../../api/chain-api";
import { useUserStore } from "../../store/userStore";

import { ref, watchEffect, onMounted, computed } from "vue";
import Loader from "../utils/Loader.vue";
import ContextMenu from "../utils/ContextMenu.vue";
import { useRouter, useRoute } from "vue-router";
import { fileIcon as _fileIcon } from "../../store/fileTypes";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/vue/solid";

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

const isArweave = computed(() => {
  return props.file.backend == "arweave";
});

const isEncrypted = computed(() => {
  return props.file.access == "private";
});
</script>

<template>
  <div>
    <!-- File -->
    <div
      class="card card-bordered btn btn-ghost shadow-xl border-slate-500 w-full h-[180px] items-start p-0 relative overflow-visible"
      @contextmenu.prevent="(ev) => handler(ev)"
      style="text-transform: initial"
      @click="onClick()"
    >
      <!-- Icon -->
      <div class="flex-1 flex self-center items-center">
        <img :src="fileIcon" class="w-[72px] h-[72px]" />
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
      <div class="absolute right-0 top-0 p-2 tooltip" data-tip="encrypted">
        <LockClosedIcon
          v-if="isEncrypted"
          class="w-[16px] h-[16px]"
        ></LockClosedIcon>
        <LockOpenIcon v-else class="w-[16px] h-[16px]"></LockOpenIcon>
      </div>
      <!-- Row -->
      <div class="flex text-left p-3">
        <!-- Name -->
        <p class="text">
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
        <a href="#" @click.prevent="props.onRemove">Delete</a>
      </li>
    </ContextMenu>
  </div>
</template>

<style scoped>
.text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
