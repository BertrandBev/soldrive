<script setup lang="ts">
import PdfViewer from "./PdfViewer.vue";
import {
  MenuIcon,
  ChevronLeftIcon,
  LoginIcon,
  DotsVerticalIcon,
  ArrowLeftIcon,
  DownloadIcon,
  ArrowRightIcon,
} from "@heroicons/vue/outline";
import { useMagicKeys } from "@vueuse/core";
import { ref, watch, computed } from "vue";
import { useAsyncState } from "@vueuse/core";
import ImageViewer from "./ImageViewer.vue";
import VideoViewer from "./VideoViewer.vue";
import { File } from "../../api/chain-api";
import { useFileStore } from "../../store/fileStore";
const { left, right } = useMagicKeys();
const { downloadFile, blobToBase64 } = useFileStore();

const opened = ref(false);
const currentFileIdx = ref(0);
const files = ref<File[]>([]);
const file = computed(() => {
  return currentFileIdx.value < files.value.length
    ? files.value[currentFileIdx.value]
    : null;
});
const loaders = ref([] as {}[]);

watch([left], () => left.value && leftPressed());
watch([right], () => right.value && rightPressed());

function leftPressed() {
  currentFileIdx.value = currentFileIdx.value - 1;
  if (currentFileIdx.value < 0) currentFileIdx.value = files.value.length - 1;
}

function rightPressed() {
  currentFileIdx.value = currentFileIdx.value + 1;
  if (currentFileIdx.value >= files.value.length) currentFileIdx.value = 0;
}

function open(_files: File[], currentFile: File) {
  files.value = _files;
  // Instanciate loaders
  loaders.value = _files.map((file) => {
    return useAsyncState(
      async () => {
        const buf = await downloadFile(file, true);
      },
      null,
      { immediate: false }
    );
  });
  //
  currentFileIdx.value = 0;
  for (let k = 0; k < _files.length; k++) {
    if (_files[k] == currentFile) {
      currentFileIdx.value = k;
      break;
    }
  }
}
</script>

<template>
  <div
    v-if="opened"
    class="w-screen h-screen bg-[#000000cc] fixed top-0 left-0 z-[100] flex flex-col"
  >
    <!-- Toolbar -->
    <div class="w-full flex items-center p-2">
      <!-- Back button -->
      <button class="btn btn-circle btn-ghost" @click="() => $router.back()">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <!-- File title -->
      <div class="normal-case text-xl font-bold px-4">A cool image</div>
      <!-- Spacer -->
      <div class="flex-1"></div>
      <!-- Navigation -->
      <button class="btn btn-circle btn-ghost" @click="() => leftPressed()">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <button class="btn btn-circle btn-ghost" @click="() => rightPressed()">
        <ArrowRightIcon class="w-5 h-5" />
      </button>
      <!-- Download -->
      <button class="btn btn-circle btn-ghost" @click="() => leftPressed()">
        <DownloadIcon class="w-5 h-5" />
      </button>
      <!-- Menu -->
      <button class="btn btn-circle btn-ghost" @click="">
        <DotsVerticalIcon class="w-5 h-5" />
      </button>
    </div>
    <!-- PDF -->
    <!-- <PdfViewer></PdfViewer> -->
    <!-- Image -->
    <ImageViewer></ImageViewer>
    <!-- Audio/Video -->
    <!-- <VideoViewer></VideoViewer> -->
  </div>
</template>
