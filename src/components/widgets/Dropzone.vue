<script setup lang="ts">
import { useDropzone } from "vue3-dropzone";
import { FileWithPath } from "file-selector";

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

function onDrop(acceptFiles: InputFile[], rejectReasons: FileRejectReason[]) {
  console.log(acceptFiles);
  console.log(rejectReasons);
}

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
</script>

<template>
  <div>
    <div v-bind="getRootProps()">
      <input v-bind="getInputProps()" />
      <div
        :class="{
          'drop-zone-active': isDragActive,
          'drop-zone-inactive': !isDragActive,
        }"
      >
        <p v-if="isDragActive">Drop the file now!</p>
        <p v-else>Drop a file here, or click to select a file</p>
      </div>
    </div>
  </div>
</template>

<style>
.drop-zone-active {
  border: 2px dashed #555;
  border-radius: 16px;
  padding: 50px;
  text-align: center;
  background-color: #5eed80;
  color: #555;
}

.drop-zone-inactive {
  border: 2px dashed #bbb;
  border-radius: 16px;
  padding: 50px;
  text-align: center;
}
</style>
