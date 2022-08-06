<script setup lang="ts">
import { ref, watchEffect, computed, onMounted } from "vue";
import { PencilIcon, CheckIcon } from "@heroicons/vue/outline";
import { useChainApi, FileType, Access } from "../api/chain-api";
import { useAsyncState, useThrottleFn } from "@vueuse/core";
import { useRouter } from "vue-router";
import * as anchor from "@project-serum/anchor";
import { useToast } from "vue-toastification";
import web3 = anchor.web3;
import { useUserStore } from "../store/userStore";
import { useFileStore } from "../store/fileStore";

const { api, wallet, connection } = useChainApi();
const toast = useToast();
const { user, fetchUser, encrypt, decrypt } = useUserStore();
const router = useRouter();

const props = defineProps<{
  id?: number;
  folder: number;
}>();

// File data
const data = ref({
  loaded: false,
  name: "",
  parent: 0,
  access: "private" as Access,
  content: "",
  contentBuffer: Buffer.from("", "base64"),
});

// Get file
const { isLoading: fileLoading, error: fileLoadingError } = useAsyncState(
  async () => {
    if (!props.id) {
      // New file
      data.value.parent = props.folder;
    } else {
      // Existing file
      const res = await api.value?.fetchFile(props.id, true);
      if (!res) {
        toast.error(`Note ${props.id} not found`);
      } else {
        // Populate fields
        data.value.loaded = true;
        data.value.name = res.name;
        data.value.parent = res.parent;
        data.value.access = res.access;
        data.value.content = decrypt(
          res.content,
          data.value.access == "private"
        );
      }
    }
  },
  null
);

const isNew = computed(() => {
  return props.id == undefined;
});

//
const emptyName = ref(false);
const emptyContent = ref(false);

watchEffect(() => {
  emptyName.value = data.value.name.length == 0;
  emptyContent.value = data.value.content.length == 0;
});

const {
  execute: saveFile,
  isLoading: fileSaving,
  error: fileSavingError,
} = useAsyncState(
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
        data.value.contentBuffer.length,
        data.value.parent,
        data.value.name,
        "note",
        data.value.access,
        data.value.contentBuffer
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
        props.id!,
        data.value.parent,
        data.value.name,
        data.value.access,
        data.value.contentBuffer
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

// Rent cost
const rentBase = ref(0);
const rentPerByte = ref(0);
const noteRentCost = computed(() => {
  return rentBase.value + rentPerByte.value * data.value.content.length;
});
const noteRentCostStr = computed(() => {
  const solVal = noteRentCost.value / 1e9;
  if (noteRentCost.value == 0) return `loading storage cost...`;
  else if (solVal < 1e-3) return `< ${solVal.toFixed(3)} SOL`;
  else return `${solVal.toFixed(3)} SOL`;
});
const wordCountStr = computed(() => {
  return `${data.value.content.length} characters`;
});

watchEffect(() => {
  const msg = data.value.content;
  try {
    const buf = encrypt(msg, data.value.access == "private");
    const decrypted = decrypt(buf, data.value.access == "private");
    if (decrypted != msg) throw new Error("Encryption error");
    data.value.contentBuffer = buf;
  } catch (e) {
    console.error("Encryption error:", (e as Error).message);
    toast.error((e as Error).message);
  }
});

onMounted(async () => {
  // Fetch rent cost
  rentBase.value = await connection.getMinimumBalanceForRentExemption(0);
  rentPerByte.value =
    (await connection.getMinimumBalanceForRentExemption(1)) - rentBase.value;
});

// Upload file
const { uploadFile } = useFileStore();
function upload() {
  uploadFile();
}
</script>

<template>
  <div class="w-full flex flex-col items-center p-5">
    <!-- Loader -->
    <Loader
      v-if="fileLoading || fileLoadingError"
      :error="fileLoadingError ? 'File loading error' : undefined"
    ></Loader>
    <!-- Card -->
    <div v-else class="card w-full border border-info flex-col p-6">
      <div class="flex">
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
        <select v-model="data.access" class="select ml-2">
          <option disabled :value="null" selected>Access</option>
          <option value="private">Private (encrypted)</option>
          <option value="publicRead">Public read only</option>
          <option value="publicReadWrite">Public read write</option>
        </select>
      </div>
      <!-- <label class="label mt-4"> Website </label> -->
      <textarea
        v-model="data.content"
        class="textarea mt-4 min-h-[10rem]"
        :class="{
          'textarea-info': !emptyContent,
          'textarea-error': emptyContent,
        }"
        placeholder="Note"
      ></textarea>
      <!-- Info line -->
      <div class="flex mt-2">
        <label class="whitespace-nowrap"> {{ wordCountStr }}</label>
        <!-- Word count -->
        <div class="w-full"></div>
        <!-- Rent cost -->
        <label class="whitespace-nowrap"> {{ noteRentCostStr }}</label>
      </div>
      <!-- Save bar -->
      <div class="flex justify-end mt-6">
        <!-- Save btn -->
        <div class="btn btn-ghost" @click="() => upload()">Upload</div>
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
