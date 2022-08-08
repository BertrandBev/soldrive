<script setup lang="ts">
import { useDropzone } from "vue3-dropzone";
import { FileWithPath } from "file-selector";
import { computed, watch, ref } from "vue";
import { spaceString } from "../../store/fileStore";

const MAX_SIZE = 100e9;

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

const {
  getRootProps,
  getInputProps,
  isDragActive,
  isDragAccept,
  acceptedFiles,
  fileRejections,
} = useDropzone({ maxFiles: 1, maxSize: MAX_SIZE, multiple: false });

const file = computed(() => {
  if (acceptedFiles.value.length == 0) return null;
  return acceptedFiles.value[0] as AcceptedFile;
});

const progress = ref(0);
const processingError = ref(false);

function processFile() {
  if (!file.value) return;
  const reader = new FileReader();
  progress.value = 0;
  console.log("processing...");
  processingError.value = false;
  reader.onload = function (e: any) {
    const data = e.target.result;
    console.log("file loaded!", data);
    progress.value = 0;
  };
  reader.onerror = function (e: any) {
    console.error("File loading error", e);
    processingError.value = true;
    progress.value = 0;
  };
  reader.onprogress = function (ev) {
    progress.value = Math.ceil((ev.loaded / ev.total) * 100);
    console.log("progress", progress.value);
  };
  console.log("file", file.value);
  reader.readAsArrayBuffer(file.value as File);
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

watch([file], () => processFile());
</script>

<template>
  <div>
    <div v-bind="getRootProps()">
      <input v-bind="getInputProps()" />
      <div
        class="drop-zone"
        :class="{
          'drop-zone-active': isDragActive,
          'drop-zone-inactive': !isDragActive,
        }"
      >
        <p v-if="errMsg" class="text-red-300">{{ errMsg }}</p>
        <p v-else-if="isDragActive">Drop the file now!</p>
        <p v-else-if="file" class="text-green-300">{{ file.name }}</p>
        <p v-else>Drop a file here, or click to select a file</p>
        <progress
          v-if="progress"
          class="progress progress-info w-56 mt-3"
          :value="progress"
          max="100"
        ></progress>
        {{ progress }}
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
  height: 128px;
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
