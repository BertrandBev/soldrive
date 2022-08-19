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
import { File } from "../../api/wrappedApi";
import { useFileStore } from "../../store/fileStore";
import {
  fileIcon as _fileIcon,
  fileType as _fileType,
  FileType,
} from "../../store/fileTypes";
import Loader from "../utils/Loader.vue";
import { useToast } from "vue-toastification";
import TextViewer from "./TextViewer.vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { left, right, escape } = useMagicKeys();
const { downloadFile, arrayBufferToBase64, clientDownload } = useFileStore();

// type Loader = ReturnType<typeof useAsyncState<string | null, true>>;
const props = defineProps<{
  files: File[];
  fileId?: string;
  onEdit: (file: File) => void;
  onRemove: (file: File) => void;
}>();

const opened = ref(false);
const fileIdx = ref<number | null>(null);
const file = computed(() => {
  if (fileIdx.value == null) return null;
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
watch([escape], () => navBack());

const { isLoading, error, execute } = useAsyncState(
  async () => {
    if (!file.value) return;
    if (!cached.value[file.value.id]) {
      const buf = await downloadFile(file.value, true);
      const url = await arrayBufferToBase64(file.value.fileExt, buf);
      cached.value[file.value.id] = url;
    }
  },
  null,
  { immediate: false }
);

const state = computed(() => {
  return file.value ? cached.value[file.value.id] : null;
});

watch(
  [file],
  () => {
    execute();
  },
  { immediate: true }
);

function navToFileId(fileId: number) {
  const path = route.path;
  router.replace({ path, query: { file: fileId } });
}

function leftPressed() {
  if (!opened.value) return;
  let idx = fileIdx.value! - 1;
  if (idx < 0) idx = props.files.length - 1;
  navToFileId(props.files[idx].id);
}

function rightPressed() {
  if (!opened.value) return;
  let idx = fileIdx.value! + 1;
  if (idx >= props.files.length) idx = 0;
  navToFileId(props.files[idx].id);
}

function navBack() {
  // Strip out query
  router.replace({ path: route.path });
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
  },
  { immediate: true }
);

function download() {
  if (!file.value) return toast.error("No file");
  if (!state.value) return toast.error("The file hasn't been loaded yet");
  clientDownload(file.value.name + "." + file.value.fileExt, state.value);
}

function clearCache() {
  cached.value = {};
}

defineExpose({ clearCache });
</script>

<template>
  <div
    v-if="opened"
    class="w-screen h-screen bg-[#000000dd] fixed top-0 left-0 z-[100] flex flex-col"
    @click="navBack"
  >
    <!-- Toolbar -->
    <div class="w-full flex items-center p-2">
      <!-- Back button -->
      <button class="btn btn-circle btn-ghost" @click.stop="navBack">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <!-- File icon -->
      <img :src="fileIcon" class="w-[42px] h-[42px] object-contain" />
      <!-- File title -->
      <div class="normal-case text-xl font-bold px-4">{{ fileName }}</div>
      <!-- Spacer -->
      <div class="flex-1"></div>
      <!-- Navigation -->
      <button class="btn btn-circle btn-ghost" @click.stop="leftPressed">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <div class="text-md font-mono">
        {{ (fileIdx || 0) + 1 }}/{{ props.files.length }}
      </div>
      <button class="btn btn-circle btn-ghost" @click.stop="rightPressed">
        <ArrowRightIcon class="w-5 h-5" />
      </button>
      <!-- Download -->
      <button class="btn btn-circle btn-ghost" @click.stop="download">
        <DownloadIcon class="w-5 h-5" />
      </button>
      <!-- Menu -->
      <div class="dropdown dropdown-end">
        <!-- <label tabindex="0" class="btn m-1">Click</label> -->
        <button class="btn btn-circle btn-ghost">
          <DotsVerticalIcon class="w-5 h-5" />
        </button>
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li><a @click.prevent="() => onEdit(file!)">Edit</a></li>
          <li><a @click.prevent="() => onRemove(file!)">Delete</a></li>
        </ul>
      </div>
    </div>
    <!-- Loader -->
    <div v-if="isLoading || error" class="full-center">
      <Loader v-if="isLoading"></Loader>
      <div v-else>File loading error</div>
    </div>
    <!-- Viewers -->
    <template v-else>
      <ImageViewer v-if="fileType == 'image'" :dataUri="state"></ImageViewer>
      <PdfViewer v-else-if="fileType == 'pdf'" :dataUri="state"></PdfViewer>
      <VideoViewer
        v-else-if="fileType == 'video' || fileType == 'audio'"
        :file="file"
        :dataUri="state"
      ></VideoViewer>
      <TextViewer v-else-if="fileType == 'text'" :dataUri="state"> </TextViewer>
      <!-- Downloader -->
      <div v-else class="full-center">
        <div class="btn btn-ghost gap-4" @click.stop="download">
          Download
          <DownloadIcon class="h-8 w-8"></DownloadIcon>
        </div>
      </div>
    </template>
  </div>
</template>
