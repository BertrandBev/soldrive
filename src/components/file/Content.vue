<script setup lang="ts">
import { ref, watch, watchEffect, computed, onMounted } from "vue";
import { File } from "../../api/wrappedApi";
import { useUserStore } from "../../store/userStore";
import { useToast } from "vue-toastification";
import Dropzone from "../file/Dropzone.vue";
import { useFileStore, spaceString } from "../../store/fileStore";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import DepositModal from "../widgets/DepositModal.vue";
import Loader from "../utils/Loader.vue";
import { useAsyncState } from "@vueuse/core";
import { XIcon } from "@heroicons/vue/outline";

const { user, fetchUser, encrypt, decrypt } = useUserStore();
const {
  mbCostArweave,
  mbCostSolana,
  getBalance,
  getCost,
  uploadFile,
  downloadFile,
} = useFileStore();
const toast = useToast();

const props = defineProps<{
  originalFile: File;
  file: File;
  isNew: boolean;
  onFile: (name: string) => void;
}>();

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// const isNote = computed(() => props.fileExt == "txt");
const isSolana = computed(() => props.file.backend == "solana");
const isEncrypted = computed(() => props.file.access == "private");
const isNote = ref(true);

const dropzone = ref<null | InstanceType<typeof Dropzone>>(null);
const depositModal = ref<null | InstanceType<typeof DepositModal>>(null);
const emptyContent = ref(false);
const note = ref("");
const noteBuf = ref(new ArrayBuffer(0));

const wordCountStr = computed(() => {
  return `${note.value.length} characters`;
});

// Data downloader
const {
  state: downloadedData,
  execute: download,
  isLoading: downloading,
  error: downloadError,
} = useAsyncState(
  async (forceDownload = false) => {
    // Force download for notes
    forceDownload = forceDownload || props.originalFile.fileExt == "txt";
    const buf = await downloadFile(props.originalFile, forceDownload);
    // Unpack note
    if (isNote.value && buf) {
      note.value = decoder.decode(buf);
    }
    // Return buffer
    return buf;
  },
  null,
  {
    immediate: false,
    onError: (e) => {
      console.error(e);
    },
    throwError: true,
  }
);

const noteUpdated = computed(() => {
  if (!isNote.value) return false;
  if (!downloadedData.value) return false;
  return note.value != decoder.decode(downloadedData.value);
});

// watch file to trigger
let originalFilePrev: File | null;
watch(
  [props],
  async () => {
    if (originalFilePrev != props.originalFile) {
      originalFilePrev = props.originalFile;
      isNote.value = props.file.fileExt == "" || props.file.fileExt == "txt";
      await download();
    }
  },
  { immediate: true }
);

// Uniform data accessors
const data = computed(() => {
  let buffer: ArrayBuffer | null = null;
  if (isNote.value && noteBuf.value) buffer = noteBuf.value;
  else if (dropzone.value?.data) buffer = dropzone.value.data;
  else if (downloadedData.value) buffer = downloadedData.value;
  return buffer || new ArrayBuffer(0);
});

const fileSize = computed(() => {
  return data.value.byteLength;
});

const fileExt = computed(() => {
  if (isNote.value) {
    return "txt";
  } else {
    return dropzone.value?.fileMeta?.ext || "";
  }
});

const fileSizeStr = computed(() => {
  return spaceString(dropzone.value?.data?.byteLength || 0);
});

// Rent cost
const noteRentCostStr = computed(() => {
  const mbCost = isSolana.value ? mbCostSolana : mbCostArweave;
  const bufLength = fileSize.value;
  const solVal = mbCost.value
    .dividedBy(1e6) // byte cost
    .dividedBy(LAMPORTS_PER_SOL) // in sol
    .multipliedBy(bufLength)
    .toNumber();
  if (solVal == 0) return "";
  else if (solVal < 1e-3) return `Cost < ${(1e-3).toFixed(3)} SOL`;
  else return `Cost ${solVal.toFixed(3)} SOL`;
});

watch([note], async () => {
  emptyContent.value = note.value.length == 0;
  const msg = note.value;
  noteBuf.value = encoder.encode(msg);
});

const updated = computed(() => {
  return (
    props.originalFile.access != props.file.access ||
    props.originalFile.backend != props.file.backend ||
    (!isNote.value && dropzone.value?.data != null) ||
    (isNote.value && noteUpdated.value)
  );
});

const {
  execute: upload,
  isLoading: uploading,
  error: uploadError,
} = useAsyncState(
  async () => {
    let content: ArrayBuffer | null = null;

    // Conditions for content update
    const updateContent = updated.value || props.isNew;
    if (!updateContent) {
      // No need to do anything here
      return null;
    }

    // Download content if needed
    // Supposed to have been downloaded for notes
    if (!data.value.byteLength && !isNote.value) {
      await download(0, true);
    }

    // Validate
    if (fileSize.value == 0) {
      throw new Error(isNote.value ? "Empty note" : "Select a valid file");
    }

    // Set content
    const size = data.value.byteLength;
    if (!isSolana.value) {
      // Arweave backend, get balance
      const balance = await getBalance();
      const cost = await getCost(size);
      if (balance.comparedTo(cost) <= 0)
        await depositModal.value?.open(size / 1e6);
      // Upload file
      const encrypted = await encrypt(data.value, isEncrypted.value);
      const id = await uploadFile(encrypted);
      // Pack file metadata
      const contentStr = [id].join("\n");
      content = encoder.encode(contentStr);
    } else {
      // Solana backend
      content = data.value;
      // Validate
      if (content.byteLength > 1000) {
        throw new Error(
          "Max data size is 1KB on Solana. Consider switching to Arweave"
        );
      }
    }

    // Return content
    return {
      content,
      fileSize: size,
      fileExt: fileExt.value,
    };
  },
  null,
  {
    immediate: false,
    onError: (e) => {
      console.error(e);
    },
    throwError: true,
  }
);

const fileMeta = computed(() => ({
  name: props.file.name,
  ext: props.file.fileExt,
  size: props.file.fileSize.toNumber(),
}));

function onFile(name: string) {
  props.onFile(name);
}

const infoBanner = computed(() => {
  return downloading.value || downloadError.value || uploading.value;
});

defineExpose({ upload, updated });
</script>

<template>
  <div class="flex flex-col">
    <!-- File type -->
    <div class="mt-4 flex items-center" v-if="isNew">
      <span class="opacity-50">File type</span>
      <div class="tabs tabs-boxed ml-3">
        <a
          class="tab"
          :class="{ 'tab-active': isNote }"
          @click="() => (isNote = true)"
          >Note</a
        >
        <a
          class="tab"
          :class="{ 'tab-active': !isNote }"
          @click="() => (isNote = false)"
          >File</a
        >
      </div>
    </div>
    <!-- Loader -->
    <div
      v-if="infoBanner"
      class="h-[168px] w-full flex justify-center items-center"
    >
      <div
        v-if="downloadError"
        class="btn btn-ghost text-red-300 gap-2"
        @click="downloadError = null"
      >
        File loading error
        <XIcon class="w-5 h-5"></XIcon>
      </div>
      <template v-else>
        <Loader></Loader>
        <div class="ml-4">
          {{ uploading ? "uploading data" : "downloading data" }}
        </div>
      </template>
    </div>

    <!-- File dropzone -->
    <Dropzone
      v-show="!infoBanner && !isNote"
      :file-meta="fileMeta"
      :on-file="onFile"
      class="mt-4"
      ref="dropzone"
    ></Dropzone>
    <!-- Note area -->
    <textarea
      v-show="!infoBanner && isNote"
      v-model="note"
      class="textarea mt-4 min-h-[10rem]"
      :class="{
        'textarea-info': !emptyContent,
        'textarea-error': emptyContent,
      }"
      placeholder="Note"
    ></textarea>

    <!-- Info line -->
    <div class="flex mt-2">
      <!-- Word count || file size -->
      <label v-if="isNote" class="whitespace-nowrap">{{ wordCountStr }}</label>
      <label v-else class="whitespace-nowrap">{{ fileSizeStr }}</label>
      <div class="w-full"></div>
      <!-- Rent cost -->
      <label class="whitespace-nowrap"> {{ noteRentCostStr }}</label>
    </div>
    <!-- Deposit modal -->
    <DepositModal ref="depositModal"></DepositModal>
  </div>
</template>
