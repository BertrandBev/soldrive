<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useWrappedApi, Folder } from "../../api/wrappedApi";
import { useAsyncState } from "@vueuse/core";
import * as anchor from "@project-serum/anchor";
import { useToast } from "vue-toastification";
import web3 = anchor.web3;
import { useUserStore } from "../../store/userStore";
import { useClipbardStore } from "../../store/clipboardStore";
import { useEscapeClose } from "../utils/utils";

const api = useWrappedApi();
const toast = useToast();
const { user, fetchUser, encrypt } = useUserStore();
const { updateFolder } = useClipbardStore();
const input = ref<HTMLElement | null>(null);

//
const props = defineProps<{
  onFolderUpdated?: () => void;
}>();

// Folder data
const data = ref({
  originalFolder: null as Folder | null,
  folder: { id: -1, name: "", parent: 0 } as Folder,
});

const folder = computed(() => data.value.folder);

const isNew = computed(() => {
  return data.value.originalFolder == null;
});

// Check data
const emptyName = ref(false);
const nameTooLong = ref(false);
watch(
  [folder],
  async () => {
    emptyName.value = folder.value.name.length == 0;
    const enc = new TextEncoder();
    const buf = enc.encode(folder.value.name);
    const encryptedName = await encrypt(buf, true);
    nameTooLong.value = encryptedName.length > 64;
  },
  { deep: true }
);

const modalOpen = ref(false);
useEscapeClose(modalOpen);
const title = computed(() => {
  return isNew.value ? "Create a new folder" : "Edit folder";
});

// Focus modal automatically
watch(
  [modalOpen],
  () => {
    if (modalOpen.value) {
      setTimeout(() => {
        input.value!.focus();
      }, 50);
    }
  },
  { immediate: true }
);

const { isLoading: folderSaving, execute: saveFolder } = useAsyncState(
  async () => {
    // Fetch user
    if (!user.value) {
      // Must be logged in
      toast.error("Must be logged in");
      return;
    }
    // Check data
    if (emptyName.value) {
      toast.error("A valid folder name must be provided");
      return;
    }
    if (nameTooLong.value) {
      toast.error("The provided name is too long");
      return;
    }
    if (isNew.value) {
      // Create folder
      const id = user.value.folderId + 1;
      await api.value?.createFolder({ ...folder.value, id });
      // Bump id
      await fetchUser.execute();
    } else {
      // Update folder
      await api.value?.updateFolder(folder.value);
      // Update clipboard
      updateFolder(data.value.originalFolder!, folder.value);
    }
    // Close modal & callback
    modalOpen.value = false;
    if (props.onFolderUpdated) props.onFolderUpdated();
  },
  null,
  {
    onError: (e) => {
      toast.error((e as Error).message);
    },
    immediate: false,
  }
);

async function open(parent: number, folder: Folder | null = null) {
  if (folder) {
    data.value.originalFolder = folder;
    data.value.folder = folder;
  } else {
    data.value.originalFolder = null;
    data.value.folder.id = -1;
    data.value.folder.name = "";
    data.value.folder.parent = parent;
  }
  modalOpen.value = true;
}

defineExpose({ open });
</script>

<template>
  <!-- Encryption modal modal -->
  <div class="modal" :class="{ 'modal-open': modalOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ title }}</h3>
      <!-- TODO: share with editFile -->
      <input
        ref="input"
        v-model="folder.name"
        autofocus
        class="input input-info input-bordered w-full mt-3"
        :class="{
          'input-info': !emptyName && !nameTooLong,
          'input-error': emptyName || nameTooLong,
        }"
        type="text"
        placeholder="Name"
      />
      <div class="modal-action">
        <div class="btn" @click="modalOpen = false">Cancel</div>
        <div
          class="btn"
          :class="{ loading: folderSaving }"
          @click="() => saveFolder()"
        >
          Save
        </div>
      </div>
    </div>
  </div>
</template>
