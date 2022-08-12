<script setup lang="ts">
import { ref, watch, watchEffect, computed, onMounted } from "vue";
import { useChainApi, Access, Backend, File } from "../../api/chain-api";
import { useUserStore } from "../../store/userStore";
import { useToast } from "vue-toastification";
import Dropzone from "../file/Dropzone.vue";
import { useFileStore, spaceString } from "../../store/fileStore";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import DepositModal from "../widgets/DepositModal.vue";
import Loader from "../utils/Loader.vue";
import { useAsyncState } from "@vueuse/core";

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
  file: File;
  isNew: boolean;
  setFileName: (name: string) => void;
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
const encryptedNote = ref<Buffer | null>();

const wordCountStr = computed(() => {
  return `${note.value.length} characters`;
});

// Uniform data accessors
const data = computed(() => {
  return (
    (isNote.value ? encryptedNote.value : dropzone.value?.data) ||
    Buffer.alloc(0)
  );
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

watch([note, isEncrypted], async () => {
  emptyContent.value = note.value.length == 0;
  const msg = note.value;
  try {
    const encoded = encoder.encode(msg);
    const buf = await encrypt(encoded, isEncrypted.value);
    const decrypted = await decrypt(buf, isEncrypted.value);
    const decoded = decoder.decode(decrypted);
    if (decoded != msg) throw new Error("Encryption error");
    encryptedNote.value = buf;
    // props.setContent(buf);
  } catch (e) {
    console.error("Encryption error:", (e as Error).message);
    toast.error((e as Error).message);
  }
});

async function upload() {
  // Validate
  if (fileSize.value == 0) {
    throw new Error(isNote.value ? "Empty note" : "Select a valid file");
  }
  // TODO: cache meta
  let content: Buffer;
  // Upload file content if needed
  if (!isSolana.value) {
    // Arweave backend, get balance
    const balance = await getBalance();
    const cost = await getCost(fileSize.value);
    if (balance.comparedTo(cost) <= 0)
      await depositModal.value?.open(fileSize.value);
    // Upload file
    const id = await uploadFile(data.value);
    // Pack file metadata
    const contentStr = [id].join("\n");
    const contentBuf = encoder.encode(contentStr);
    content = await encrypt(contentBuf, isEncrypted.value);
  } else {
    // Solana backend
    content = data.value;
  }
  // Return content
  return {
    content,
    fileSize: fileSize.value,
    fileExt: fileExt.value,
  };
}

const {
  execute: download,
  isLoading: downloading,
  error: downloadError,
} = useAsyncState(
  async (content: ArrayBuffer) => {
    // Exit for empty content
    if (content.byteLength == 0) return;
    // Decrypt content
    const contentBuf = await decrypt(content, isEncrypted.value);
    // Download file if needed
    let data: ArrayBuffer;
    if (isSolana.value) {
      // Solana backend
      data = contentBuf;
    } else {
      // Arweave backend, unpack
      const contentStr = decoder.decode(contentBuf);
      // Unpack metadata
      const meta = contentStr.split("\n");
      const id = meta[0];
      // Download note
      if (isNote.value) {
        // Unpack note
        const buffer = await downloadFile(id);
        data = await decrypt(buffer, isEncrypted.value);
      }
    }
    // Unpack note
    if (isNote.value) {
      note.value = decoder.decode(data!);
    }
  },
  null,
  {
    immediate: false,
    onError: (e) => {
      // throw new Error(e);
    },
  }
);

let content: ArrayBuffer;
watch(
  [props],
  () => {
    if (content != props.file.content) {
      // Download content if needed
      content = props.file.content;
      isNote.value = props.file.fileExt == "" || props.file.fileExt == "txt";
      download(0, content);
    }
  },
  { immediate: true }
);

const fileMeta = computed(() => ({
  name: props.file.name,
  ext: props.file.fileExt,
  size: props.file.fileSize.toNumber(),
}));

defineExpose({ upload });
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
      v-if="downloading || downloadError"
      class="h-[168px] w-full flex justify-center items-center"
    >
      <div v-if="downloadError">File loading error</div>
      <Loader v-else></Loader>
    </div>
    <!-- File dropzone -->
    <Dropzone
      v-else-if="!isNote"
      :file-meta="fileMeta"
      class="mt-4"
      ref="dropzone"
    ></Dropzone>
    <!-- Note area -->
    <textarea
      v-else
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
      <label v-if="isNote" class="whitespace-nowrap">{{ wordCountStr }}</label>
      <label v-else class="whitespace-nowrap">{{ fileSizeStr }}</label>
      <!-- Word count -->
      <div class="w-full"></div>
      <!-- Rent cost -->
      <label class="whitespace-nowrap"> {{ noteRentCostStr }}</label>
    </div>
    <!-- Deposit modal -->
    <DepositModal ref="depositModal"></DepositModal>
  </div>
</template>
