<script setup lang="ts">
import { ref, computed } from "vue";
import { useWrappedApi, Folder, File } from "../../api/wrappedApi";
import { useAsyncState } from "@vueuse/core";
import * as anchor from "@project-serum/anchor";
import { useToast } from "vue-toastification";
import { useClipbardStore } from "../../store/clipboardStore";
import web3 = anchor.web3;
import { useEscapeClose } from "../utils/utils";

const api = useWrappedApi();
const toast = useToast();
const { popFile, popFolder } = useClipbardStore();

const props = defineProps<{
  onRemoved: () => void;
}>();

const folder = ref<Folder | null>();
const file = ref<File | null>();
const isFile = computed(() => !!file.value);

const modalOpen = ref(false);
useEscapeClose(modalOpen);

const content = computed(() => {
  return isFile.value
    ? `Do you want to remove the file "${file.value?.name}"`
    : `Do you want to remove the folder "${folder.value?.name}"`;
});

const { isLoading, execute } = useAsyncState(
  async () => {
    if (isFile.value) {
      await api.value!.removeFile(file.value!.id);
    } else {
      // Makes sure that the folder is not empty
      const children = await api.value!.fetchChildren(folder.value!.id, false);
      if (children.files.length + children.folders.length > 0) {
        modalOpen.value = false;
        throw new Error("The folder is not empty. Remove its content first");
      }
      await api.value!.removeFolder(folder.value!.id);
    }
    // Pop clipboard
    if (isFile.value) {
      popFile(file.value!);
    } else {
      popFolder(folder.value!);
    }
    // Fetch user
    await api.value!.fetchUser();
    modalOpen.value = false;
    props.onRemoved();
  },
  null,
  {
    onError: (e) => {
      toast.error((e as Error).message);
    },
    immediate: false,
  }
);

async function openForFile(_file: File) {
  console.log("open for file");
  folder.value = null;
  file.value = _file;
  modalOpen.value = true;
}

async function openForFolder(_folder: Folder) {
  console.log("open for _folder");
  file.value = null;
  folder.value = _folder;
  modalOpen.value = true;
}

defineExpose({ openForFile, openForFolder });
</script>

<template>
  <!-- Encryption modal modal -->
  <div class="modal" :class="{ 'modal-open': modalOpen }">
    <div class="modal-box">
      <p class="py-2">{{ content }}</p>
      <div class="modal-action">
        <div class="btn" @click="modalOpen = false">Cancel</div>
        <div
          class="btn"
          :class="{ loading: isLoading }"
          @click="() => execute()"
        >
          Yes
        </div>
      </div>
    </div>
  </div>
</template>
