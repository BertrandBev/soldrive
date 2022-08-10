<script setup lang="ts">
import { ref, watch, watchEffect, computed, onMounted } from "vue";
import { useChainApi, FileType, Access, Backend } from "../../api/chain-api";
import { useAsyncState, useThrottleFn } from "@vueuse/core";
import { useRouter } from "vue-router";
import * as anchor from "@project-serum/anchor";
import { useToast } from "vue-toastification";
import web3 = anchor.web3;
import { useUserStore } from "../../store/userStore";
import { useFileStore } from "../../store/fileStore";
import Loader from "../utils/Loader.vue";

import BackendSelect from "./BackendSelect.vue";
import AccessSelect from "./AccessSelect.vue";
import Content from "./Content.vue";

const { api, wallet, connection } = useChainApi();
const toast = useToast();
const { user, fetchUser, encrypt, decrypt } = useUserStore();
const router = useRouter();

const props = defineProps<{
  id?: string;
  folder: string;
}>();

const fileId = computed(() => {
  return props.id ? parseInt(props.id) : undefined;
});

const isNew = computed(() => {
  return fileId.value == undefined;
});

// Content
const note = ref("");

// File data
const data = ref({
  loaded: false,
  name: "",
  parent: 0,
  // Default
  access: "private" as Access,
  type: "note" as FileType,
  backend: "solana" as Backend,
  content: Buffer.from("", "base64"),
});

// Get file
const { isLoading: fileLoading, error: fileLoadingError } = useAsyncState(
  async () => {
    if (isNew.value) {
      // New file
      data.value.parent = parseInt(props.folder) || 0;
    } else {
      // Existing file
      const res = await api.value?.fetchFile(fileId.value!, true);
      if (!res) {
        toast.error(`Note ${fileId.value} not found`);
      } else {
        // Populate fields
        data.value.loaded = true;
        data.value.name = res.name;
        data.value.parent = res.parent;
        data.value.access = res.access;
        data.value.content = res.content;
        note.value = decrypt(
          res.content,
          data.value.access == "private"
        ).toString();
      }
    }
  },
  null
);

//
const emptyName = ref(false);
const emptyContent = ref(false);

watchEffect(() => {
  emptyName.value = data.value.name.length == 0;
  emptyContent.value = data.value.content.length == 0;
});

const { execute: saveFile, isLoading: fileSaving } = useAsyncState(
  async () => {
    // Fetch user
    if (!user.value) {
      // Must be logged in
      toast.error("Must be logged in");
      return;
    }
    // Verify info
    if (emptyContent.value) {
      toast.error("A valid content must be provided");
      return;
    }
    if (emptyName.value) {
      toast.error("A valid file name must be provided");
      return;
    }
    if (isNew.value) {
      // Create file
      const id = user.value.fileId + 1;
      await api.value?.createFile(
        id,
        data.value.content.length,
        data.value.parent,
        data.value.name,
        data.value.type,
        data.value.access,
        data.value.backend,
        data.value.content
      );
      // Bump id
      await fetchUser.execute();
      toast.success("File successfully created!");
    } else {
      //
      if (!data.value.loaded) {
        toast.error("File not loaded");
        return;
      }
      // Update file
      await api.value?.updateFile(
        fileId.value!,
        data.value.parent,
        data.value.name,
        data.value.access,
        data.value.backend,
        data.value.content
      );
      toast.success("File successfully updated!");
    }
    // Nav back
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

// Upload file
const { uploadFile } = useFileStore();
function upload() {
  uploadFile();
}

function navBack() {
  // Warning dialog
  router.go(-1);
}
</script>

<template>
  <div class="w-full flex flex-col items-center p-5">
    <!-- Loader -->
    <Loader v-if="fileLoading"></Loader>
    <div v-else-if="fileLoadingError">File loading error</div>
    <!-- Card -->
    <div v-else class="card w-full border border-info flex-col p-6">
      <div class="flex items-center">
        <!-- Name -->
        <div class="flex flex-col w-full">
          <input
            v-model="data.name"
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
      <AccessSelect v-model="data.access"></AccessSelect>
      <!--  -->
      <BackendSelect v-model="data.backend"></BackendSelect>
      <!--  -->
      <Content></Content>
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
