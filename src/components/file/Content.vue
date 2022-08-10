<script setup lang="ts">
import { ref, watch, watchEffect, computed, onMounted } from "vue";
import { useChainApi, FileType, Access, Backend } from "../../api/chain-api";
import { useUserStore } from "../../store/userStore";
import { useToast } from "vue-toastification";
import Dropzone from "../file/Dropzone.vue";
import { useFileStore, spaceString } from "../../store/fileStore";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const { user, fetchUser, encrypt, decrypt } = useUserStore();
const { mbCostArweave, mbCostSolana, getBalance, getCost } = useFileStore();
const toast = useToast();

const props = defineProps<{
  encrypt: boolean;
  isNew: boolean;
  content: Buffer;
  fileType: FileType;
  backend: Backend;
  setContent: (buf: Buffer) => void;
  setFileType: (type: FileType) => void;
}>();

const isFile = computed(() => props.fileType == "file");
const isSolana = computed(() => props.backend == "solana");

const dropzone = ref<null | InstanceType<typeof Dropzone>>(null);
const emptyContent = ref(false);
const note = ref("");

const wordCountStr = computed(() => {
  return `${note.value.length} characters`;
});

const fileSizeStr = computed(() => {
  return spaceString(dropzone.value?.data?.byteLength || 0);
});

// Rent cost
const noteRentCostStr = computed(() => {
  const mbCost = isSolana.value ? mbCostSolana : mbCostArweave;
  const bufLength =
    props.fileType == "file"
      ? dropzone.value?.data?.byteLength
      : props.content.byteLength;
  const solVal = mbCost.value
    .dividedBy(LAMPORTS_PER_SOL)
    .multipliedBy(bufLength || 0)
    .toNumber();
  if (solVal == 0) return "";
  else if (solVal < 1e-3) return `Cost < ${solVal.toFixed(3)} SOL`;
  else return `Cost ${solVal.toFixed(3)} SOL`;
});

watch([note], () => {
  emptyContent.value = note.value.length == 0;
});

watch([props.content], async () => {});

watch([note], async () => {
  const msg = note.value;
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const encoded = encoder.encode(msg);
    const buf = await encrypt(encoded, props.encrypt);
    const decrypted = await decrypt(buf, props.encrypt);
    const decoded = decoder.decode(decrypted);
    if (decoded != msg) throw new Error("Encryption error");
    props.setContent(buf);
  } catch (e) {
    console.error("Encryption error:", (e as Error).message);
    toast.error((e as Error).message);
  }
});

function validate(): boolean {
  if (isFile.value) {
    if (!dropzone.value?.data?.byteLength) {
      toast.error("Select a valid file");
      return false;
    }
  } else {
    if (!note.value.length) {
      toast.error("Empty note");
      return false;
    }
  }
  // Valid data
  return true;
}

async function upload() {
  if (isSolana.value) return;
  await dropzone.value!.upload();
}

defineExpose({ validate, upload });
</script>

<template>
  <div class="flex flex-col">
    <!-- File type -->
    <div class="mt-4 flex items-center" v-if="isNew">
      <span class="opacity-50">File type</span>
      <div class="tabs tabs-boxed ml-3">
        <a
          v-for="fileType in (['note', 'file'] as FileType[])"
          class="tab"
          :class="{ 'tab-active': props.fileType == fileType }"
          @click="() => props.setFileType(fileType)"
          >{{ fileType }}</a
        >
      </div>
    </div>
    <!-- File dropzone -->
    <Dropzone
      v-if="props.fileType == 'file'"
      class="mt-4"
      ref="dropzone"
    ></Dropzone>
    <!-- Note area -->
    <textarea
      v-if="props.fileType == 'note'"
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
      <label v-if="!isFile" class="whitespace-nowrap">{{ wordCountStr }}</label>
      <label v-else class="whitespace-nowrap">{{ fileSizeStr }}</label>
      <!-- Word count -->
      <div class="w-full"></div>
      <!-- Rent cost -->
      <label class="whitespace-nowrap"> {{ noteRentCostStr }}</label>
    </div>
  </div>
</template>
