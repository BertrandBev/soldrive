<script setup lang="ts">
import { ref, watch, watchEffect, computed, onMounted, nextTick } from "vue";
import { Access, Backend } from "../../api/chainApi";
import { useWrappedApi, File } from "../../api/wrappedApi";
import { useAsyncState, useThrottleFn } from "@vueuse/core";
import { useRouter } from "vue-router";
import * as anchor from "@project-serum/anchor";
import { useToast } from "vue-toastification";
import web3 = anchor.web3;
import { useUserStore } from "../../store/userStore";
import Loader from "../utils/Loader.vue";
import Content from "./Content.vue";
import { useClipbardStore } from "../../store/clipboardStore";

import BackendSelect from "./BackendSelect.vue";
import AccessSelect from "./AccessSelect.vue";

const api = useWrappedApi();
const toast = useToast();
const { user, fetchUser, isLoggedIn, encrypt } = useUserStore();
const router = useRouter();
const { updateFile } = useClipbardStore();

const props = defineProps<{
  id?: string;
  folder: string;
}>();

const input = ref<HTMLElement | null>(null);
const content = ref<null | InstanceType<typeof Content>>(null);

onMounted(() => {
  input.value!.focus();
});

const fileId = computed(() => {
  return props.id ? parseInt(props.id) : undefined;
});

const isNew = computed(() => {
  return fileId.value == undefined;
});

function genFile() {
  return {
    name: "",
    parent: 0,
    access: "private" as Access,
    fileExt: "",
    fileSize: new anchor.BN(0),
    backend: "solana" as Backend,
    content: new ArrayBuffer(0),
  } as File;
}

// File data
const data = ref({
  loaded: false,
  file: genFile(),
  originalFile: genFile(),
});

// Shortcut
const file = computed(() => data.value.file);

// Get file
const {
  execute: loadFile,
  isLoading: fileLoading,
  error: fileLoadingError,
} = useAsyncState(
  async () => {
    if (!isNew.value) {
      // Existing file
      const res = await api.value?.fetchFile(fileId.value!, true);
      if (!res) throw new Error(`Note ${fileId.value} not found`);
      // Populate fields
      data.value.loaded = true;
      data.value.originalFile = { ...res };
      data.value.file = res;
    }
  },
  null,
  {
    immediate: false,
    onError: (e) => {
      console.error(e);
    },
  }
);

// Load file
watch([fileId], () => loadFile(), { immediate: true });

//
const emptyName = ref(false);
const nameTooLong = ref(false);
watch(
  [file],
  async () => {
    emptyName.value = file.value.name.length == 0;
    const enc = new TextEncoder();
    const buf = enc.encode(file.value.name);
    const encryptedName = await encrypt(buf, true);
    nameTooLong.value = encryptedName.length > 64;
  },
  { deep: true }
);

const { execute: saveFile, isLoading: fileSaving } = useAsyncState(
  async () => {
    // Fetch user
    if (!user.value) {
      // Must be logged in
      toast.error("Must be logged in");
      return;
    }
    // Verify info
    if (emptyName.value) {
      toast.error("A valid file name must be provided");
      return;
    }
    // Name too long
    if (nameTooLong.value) {
      toast.error("The provided name is too long");
      return;
    }

    // Set parent
    if (isNew.value) file.value.parent = parseInt(props.folder) || 0;

    // Retrieve content
    // Don't repace file.content in here to prevent reactive download from Content
    const payload = await content.value!.upload();
    if (payload) {
      file.value.fileExt = payload.fileExt;
      file.value.fileSize = new anchor.BN(payload.fileSize);
    }
    if (isNew.value) {
      // Create file
      const id = user.value.fileId + 1;
      await api.value?.createFile({
        ...file.value,
        id,
        content: payload!.content,
      } as File);
    } else {
      //
      if (!data.value.loaded) throw new Error("File not loaded");
      // Update file
      const id = await api.value!.updateFile(
        file.value,
        payload?.content,
        data.value.originalFile
      );
      file.value.id = id;
    }
    // Update clipboard
    updateFile(data.value.originalFile, file.value);
    // Bump id
    await fetchUser.execute();
    // Nav back (prevent going forward if id got bumped)
    router.go(-1);
  },
  null,
  {
    onError: (e: any) => {
      toast.error((e.value ? (e.value as Error) : (e as Error)).message);
    },
    immediate: false,
  }
);

function onFile(name: string) {
  if (isNew.value) file.value.backend = "arweave";
  if (!file.value.name) file.value.name = name;
}

function navBack() {
  // Warning dialog
  router.go(-1);
}

const updated = computed(() => {
  return (
    content.value?.updated ||
    data.value.originalFile.name != data.value.file.name
  );
});
</script>

<template>
  <div class="w-full flex flex-col items-center p-5">
    <!--  -->
    <div v-if="!isLoggedIn">Please login</div>
    <!-- Loader -->
    <Loader v-else-if="fileLoading"></Loader>
    <div v-else-if="fileLoadingError">File loading error</div>
    <!-- Card -->
    <div
      v-else
      class="card w-full border border-info flex-col p-6 bg-[#00000033]"
    >
      <div class="flex items-center">
        <!-- Name -->
        <!-- TODO: share with editFolderModal -->
        <div class="flex flex-col w-full">
          <input
            ref="input"
            v-model="file.name"
            class="input input-info input-bordered w-full"
            :class="{
              'input-info': !emptyName && !nameTooLong,
              'input-error': emptyName || nameTooLong,
            }"
            type="text"
            placeholder="Name"
          />
        </div>
      </div>
      <!--  -->
      <AccessSelect class="mt-4" v-model="file.access"></AccessSelect>
      <!--  -->
      <BackendSelect class="mt-4" v-model="file.backend"></BackendSelect>
      <!--  -->
      <Content
        ref="content"
        :file="data.file"
        :originalFile="data.originalFile"
        :isNew="isNew"
        :onFile="onFile"
      ></Content>
      <!-- <label class="label mt-4"> Website </label> -->

      <!-- Save bar -->
      <div class="flex justify-end mt-6">
        <!-- Save btn -->
        <div class="btn btn-ghost" @click="navBack">Cancel</div>
        <!-- Save btn -->
        <div
          class="btn btn-ghost"
          :class="{ loading: fileSaving, 'btn-disabled': !updated }"
          @click="() => saveFile()"
        >
          Save
        </div>
      </div>
      <!--  -->
    </div>
  </div>
</template>

<style>
.btn-disabled {
  background-color: transparent;
}
</style>
