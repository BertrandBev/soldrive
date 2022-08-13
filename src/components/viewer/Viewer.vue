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
import { watch } from "vue";
import ImageViewer from "./ImageViewer.vue";
import VideoViewer from "./VideoViewer.vue";
const { left, right } = useMagicKeys();

watch([left], () => left.value && leftPressed());
watch([right], () => right.value && rightPressed());

function leftPressed() {
  console.log("left");
}

function rightPressed() {
  console.log("right");
}
</script>

<template>
  <div
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
    <!-- <ImageViewer></ImageViewer> -->
    <!-- Audio/Video -->
    <VideoViewer></VideoViewer>
  </div>
</template>
