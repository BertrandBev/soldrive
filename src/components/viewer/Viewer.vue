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
import { ref, watch, computed, Ref } from "vue";
import { useAsyncState } from "@vueuse/core";
import ImageViewer from "./ImageViewer.vue";
import VideoViewer from "./VideoViewer.vue";
import { File } from "../../api/chain-api";
import { useFileStore } from "../../store/fileStore";
import {
  fileIcon as _fileIcon,
  fileType as _fileType,
  FileType,
} from "../../store/fileTypes";
import Loader from "../utils/Loader.vue";
const { left, right } = useMagicKeys();
const { downloadFile, arrayBufferToBase64, clientDownload } = useFileStore();

// type Loader = ReturnType<typeof useAsyncState<string | null, true>>;
const props = defineProps<{
  files: File[];
  fileId?: string;
}>();

const opened = ref(false);
const fileIdx = ref(0);
const file = computed(() => {
  return fileIdx.value < props.files.length ? props.files[fileIdx.value] : null;
});

const fileType = computed(() => {
  return _fileType(file.value?.fileExt);
});

const fileIcon = computed(() => {
  return _fileIcon(file.value?.fileExt);
});

const fileName = computed(() => {
  return file.value?.name || "";
});

const cached = ref({} as { [key: number]: string });

watch([left], () => left.value && leftPressed());
watch([right], () => right.value && rightPressed());

const { isLoading, error, execute, state } = useAsyncState(
  async () => {
    if (!file.value) return;
    if (!cached.value[file.value.id]) {
      const buf = await downloadFile(file.value, true);
      const url = await arrayBufferToBase64(file.value.fileExt, buf);
      cached.value[file.value.id] = url;
    }
    return cached.value[file.value.id];
  },
  null,
  { immediate: false }
);

watch(
  [file],
  () => {
    console.log("executing...");
    execute();
  },
  { immediate: true }
);

function leftPressed() {
  fileIdx.value = fileIdx.value - 1;
  if (fileIdx.value < 0) fileIdx.value = props.files.length - 1;
}

function rightPressed() {
  fileIdx.value = fileIdx.value + 1;
  if (fileIdx.value >= props.files.length) fileIdx.value = 0;
}

watch(
  [props],
  (current, old) => {
    // Open viewer
    opened.value = !!props.fileId;
    if (!props.fileId) return;
    // Parse file id
    const id = parseInt(props.fileId);
    fileIdx.value = 0;
    for (let k = 0; k < props.files.length; k++) {
      if (props.files[k].id == id) {
        fileIdx.value = k;
        break;
      }
    }
    // Clear cache if needed
    if (!old[0] || current[0].files != old[0].files) {
      cached.value = {};
    }
  },
  { immediate: true }
);

function download() {
  if (!file.value || !state.value) return; // toast
  console.log("downlaod!");
  clientDownload(file.value?.name + "." + file.value?.fileExt, state.value!);
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
      <!-- File icon -->
      <img :src="fileIcon" class="w-[48px] h-[48px] object-contain" />
      <!-- File title -->
      <div class="normal-case text-xl font-bold px-4">{{ fileName }}</div>
      <!-- Spacer -->
      <div class="flex-1"></div>
      <!-- Navigation -->
      <button class="btn btn-circle btn-ghost" @click="leftPressed">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <div class="text-md font-mono">
        {{ fileIdx + 1 }}/{{ props.files.length }}
      </div>
      <button class="btn btn-circle btn-ghost" @click="rightPressed">
        <ArrowRightIcon class="w-5 h-5" />
      </button>
      <!-- Download -->
      <button class="btn btn-circle btn-ghost" @click="download">
        <DownloadIcon class="w-5 h-5" />
      </button>
      <!-- Menu -->
      <button class="btn btn-circle btn-ghost" @click="">
        <DotsVerticalIcon class="w-5 h-5" />
      </button>
    </div>
    <!-- Loader -->
    <div
      v-if="isLoading || error"
      class="w-full h-full flex items-center justify-center"
    >
      <Loader v-if="isLoading"></Loader>
      <div v-else>File loading error</div>
    </div>
    <!-- Viewers -->
    <template v-else>
      <ImageViewer v-if="fileType == 'image'" :dataUri="state"></ImageViewer>
      <PdfViewer v-if="fileType == 'pdf'" :dataUri="state"></PdfViewer>
      <VideoViewer
        v-if="fileType == 'video' || fileType == 'audio'"
        :file="file"
        :dataUri="state"
      ></VideoViewer>
    </template>
  </div>
</template>
