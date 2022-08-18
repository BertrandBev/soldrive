<script setup lang="ts">
import { useDropzone } from "vue3-dropzone";
import { FileWithPath } from "file-selector";
import { computed, watch, ref } from "vue";
import { spaceString, useFileStore } from "../../store/fileStore";
import { useUserStore } from "../../store/userStore";
import DepositModal from "../widgets/DepositModal.vue";

const { user, fetchUser, encrypt, decrypt } = useUserStore();
const { mbCostArweave, mbCostSolana, getBalance, getCost, uploadFile } =
  useFileStore();

const depositModal = ref<null | InstanceType<typeof DepositModal>>(null);

const MAX_SIZE = 300e6;

// Unexported types
type FileAccept = string | string[];
type FileHandler = (evt: Event) => void;
type FileErrorCode =
  | "file-invalid-type"
  | "file-too-large"
  | "file-too-small"
  | "too-many-files"
  | string;
type FileRejectionError =
  | {
      code: FileErrorCode;
      message: string;
    }
  | null
  | boolean;
type InputFile = (FileWithPath | DataTransferItem) & {
  size?: number;
};
type FileRejectReason = {
  file: InputFile;
  errors: FileRejectionError[];
};
type AcceptedFile = {
  readonly path?: string | undefined;
  readonly lastModified: number;
  readonly name: string;
  readonly size: number;
  readonly type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
  slice: (
    start?: number | undefined,
    end?: number | undefined,
    contentType?: string | undefined
  ) => Blob;
  stream: () => ReadableStream<any>;
  text: () => Promise<string>;
};

// let cachedFile: AcceptedFile | null = null;
// function onDrop(files: AcceptedFile[]) {
//   cachedFile = files.length > 0 ? files[0] : null;
// }

const {
  getRootProps,
  getInputProps,
  isDragActive,
  acceptedFiles,
  fileRejections,
} = useDropzone({ maxFiles: 1, maxSize: MAX_SIZE, multiple: false });

const props = defineProps<{
  fileMeta: { name: string; ext: string; size: number } | null;
  onFile: (name: string) => void;
}>();

const file = computed(() => {
  if (acceptedFiles.value.length == 0) return null;
  return acceptedFiles.value[0] as AcceptedFile;
});

const progress = ref(0);
const processingError = ref(false);
// File
const data = ref<ArrayBuffer | null>();
const fileMeta = computed(() => {
  if (file.value) {
    const filename = file.value.name || "";
    // Populate file value
    const parts = filename.split(".").reverse();
    const ext = parts.length > 0 ? parts[0] : "";
    const name = parts.slice(1).reverse().join(".");
    return {
      name,
      ext,
      size: file.value?.size || 0,
    };
  } else {
    return props.fileMeta;
  }
});

const fileName = computed(() => {
  return fileMeta?.value?.ext
    ? `${fileMeta?.value.name}.${fileMeta?.value.ext}`
    : fileMeta.value?.name || "";
});

function processFile() {
  if (file.value) {
    // Read file if needed
    data.value = null;
    const reader = new FileReader();
    progress.value = 0;
    processingError.value = false;
    reader.onload = async function (e: any) {
      const arrayBuffer = e.target.result as ArrayBuffer;
      data.value = arrayBuffer;
      progress.value = 0;
      props.onFile(fileMeta.value?.name || "");
    };
    reader.onerror = function (e: any) {
      console.error("File loading error", e);
      processingError.value = true;
      progress.value = 0;
    };
    reader.onprogress = function (ev) {
      progress.value = Math.ceil((ev.loaded / ev.total) * 100);
    };
    reader.readAsArrayBuffer(file.value as File);
  }
}

const errMsg = computed(() => {
  if (processingError.value) return "File processing error";
  if (fileRejections.value.length == 0) return null;
  const rejection = fileRejections.value[0];
  const error = rejection.errors[0] as any;
  const code = error instanceof Object && error.code ? error.code : "";
  const max = spaceString(MAX_SIZE, 0);
  switch (code as FileErrorCode) {
    case "file-too-large":
      return `The file size must be smaller than ${max}`;
    case "too-many-files":
      return "Please drop a single file";
    default:
      return "File error";
  }
});

defineExpose({ data, fileMeta });

watch([file], () => processFile());
</script>

<template>
  <div>
    <div v-bind="(getRootProps() as any)">
      <input v-bind="(getInputProps() as any)" />
      <div
        class="drop-zone"
        :class="{
          'drop-zone-active': isDragActive,
          'drop-zone-inactive': !isDragActive,
        }"
      >
        <p v-if="errMsg" class="text-red-300">{{ errMsg }}</p>
        <p v-else-if="isDragActive">Drop the file now!</p>
        <p v-else-if="fileMeta?.name" class="text-green-300">
          {{ fileName }} ({{ spaceString(fileMeta.size) }})
        </p>
        <p v-else>Drop a file here, or click to select a file</p>
        <progress
          v-if="progress"
          class="progress progress-info w-56 mt-3 shrink-0"
          :value="progress"
          :max="100"
        ></progress>
      </div>
    </div>
  </div>
</template>

<style>
.drop-zone {
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 160px;
  padding: 32px;
}
.drop-zone-active {
  border: 2px dashed #555;
  background-color: #5eed80;
  color: #555;
}
.drop-zone-inactive {
  border: 2px dashed #bbb;
}
</style>
