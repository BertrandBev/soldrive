<script setup lang="ts">
import { ref, watch, watchEffect, computed, onMounted, nextTick } from "vue";
import { useChainApi, Access, Backend, File } from "../../api/chain-api";
import { useAsyncState, useThrottleFn } from "@vueuse/core";
import { useRouter } from "vue-router";
import * as anchor from "@project-serum/anchor";
import { useToast } from "vue-toastification";
import web3 = anchor.web3;
import { useUserStore } from "../../store/userStore";
import Loader from "../utils/Loader.vue";
import Content from "./Content.vue";

import BackendSelect from "./BackendSelect.vue";
import AccessSelect from "./AccessSelect.vue";

const { api, wallet, connection } = useChainApi();
const toast = useToast();
const { user, fetchUser, isLoggedIn } = useUserStore();
const router = useRouter();

const props = defineProps<{
  id?: string;
  folder: string;
}>();

const content = ref<null | InstanceType<typeof Content>>(null);

const fileId = computed(() => {
  return props.id ? parseInt(props.id) : undefined;
});

const isNew = computed(() => {
  return fileId.value == undefined;
});

// File data
const data = ref({
  loaded: false,
  file: {
    name: "",
    parent: 0,
    // // Default
    access: "private" as Access,
    fileExt: "",
    fileSize: new anchor.BN(0),
    backend: "solana" as Backend,
    content: new ArrayBuffer(0),
  } as File,
});

// Shortcut
const file = computed(() => data.value.file);

// Get file
const { isLoading: fileLoading, error: fileLoadingError } = useAsyncState(
  async () => {
    if (isNew.value) {
      // New file
      file.value.parent = parseInt(props.folder) || 0;
    } else {
      // Existing file
      const res = await api.value?.fetchFile(fileId.value!, true);
      if (!res) {
        toast.error(`Note ${fileId.value} not found`);
      } else {
        // Populate fields
        data.value.loaded = true;
        data.value.file = res;
        console.log("file", res);
      }
    }
  },
  null,
  {
    onError: (e) => {
      console.error(e);
    },
  }
);

//
const emptyName = ref(false);
watch(
  [file],
  () => {
    emptyName.value = file.value.name.length == 0;
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
    // Retrieve content
    // Don't repace file.content in here to prevent reactive download from Content
    const payload = await content.value!.upload();
    file.value.fileExt = payload.fileExt;
    file.value.fileSize = new anchor.BN(payload.fileSize);

    if (isNew.value) {
      // Create file
      const id = user.value.fileId + 1;
      await api.value?.createFile(id, payload.content.byteLength, {
        ...file.value,
        content: payload.content,
      } as File);
      toast.success("File successfully created!");
    } else {
      //
      if (!data.value.loaded) {
        toast.error("File not loaded");
        return;
      }
      // Update file
      await api.value?.updateFile(fileId.value!, {
        parent: file.value.parent,
        name: file.value.name,
        fileExt: file.value.fileExt,
        fileSize: file.value.fileSize,
        access: file.value.access,
        backend: file.value.backend,
        content: payload.content,
      });
      toast.success("File successfully updated!");
    }
    // Bump id
    await fetchUser.execute();
    // Nav back (prevent going forward if id got bumped)
    router.go(-1);
  },
  null,
  {
    onError: (e) => {
      toast.error((e as Error).message);
    },
    immediate: false,
  }
);

function setFilename(name: string) {
  file.value.name = name;
}

function navBack() {
  // Warning dialog
  router.go(-1);
}
</script>

<template>
  <div class="w-full flex flex-col items-center p-5">
    <!--  -->
    <div v-if="!isLoggedIn">Please login</div>
    <!-- Loader -->
    <Loader v-else-if="fileLoading"></Loader>
    <div v-else-if="fileLoadingError">File loading error</div>
    <!-- Card -->
    <div v-else class="card w-full border border-info flex-col p-6">
      <div class="flex items-center">
        <!-- Name -->
        <div class="flex flex-col w-full">
          <input
            v-model="file.name"
            class="input input-info input-bordered w-full"
            :class="{
              'input-info': !emptyName,
              'input-error': emptyName,
            }"
            type="text"
            placeholder="Name"
          />
        </div>
        <!-- Encryption -->
      </div>
      <!--  -->
      <AccessSelect v-model="file.access"></AccessSelect>
      <!--  -->
      <BackendSelect v-model="file.backend"></BackendSelect>
      <!--  -->
      <Content
        ref="content"
        :file="file"
        :is-new="isNew"
        :set-file-name="setFilename"
      ></Content>
      <!-- <label class="label mt-4"> Website </label> -->

      <!-- Save bar -->
      <div class="flex justify-end mt-6">
        <!-- Save btn -->
        <div class="btn btn-ghost" @click="navBack">Cancel</div>
        <!-- Save btn -->
        <div
          class="btn btn-ghost"
          :class="{ loading: fileSaving }"
          @click="() => saveFile()"
        >
          Save
        </div>
      </div>
      <!--  -->
    </div>
  </div>
</template>
