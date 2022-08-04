<script setup lang="ts">
import { ref, watchEffect, computed, onMounted } from "vue";
import { PencilIcon, CheckIcon } from "@heroicons/vue/outline";
import { useChainApi, FileType, Access, Folder } from "../api/chain-api";
import { useAsyncState, useThrottleFn } from "@vueuse/core";
import * as anchor from "@project-serum/anchor";
import { useToast } from "vue-toastification";
import web3 = anchor.web3;
import { useUserStore } from "../store/userStore";

const { api, wallet, connection } = useChainApi();
const toast = useToast();
const { user, fetchUser, encrypt, decrypt } = useUserStore();

// Folder data
const data = ref({
  id: -1,
  name: "",
  parent: 0,
});

const isNew = computed(() => {
  return data.value.id < 0;
});

// Check data
const emptyName = ref(false);
watchEffect(() => {
  emptyName.value = data.value.name.length == 0;
});

const modalOpen = ref(false);
const title = computed(() => {
  return isNew.value ? "Create a new folder" : "Edit folder";
});

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
    if (isNew.value) {
      // Create folder
      const id = user.value.folderId + 1;
      await api.value?.createFolder(id, data.value.parent, data.value.name);
      // Bump id
      await fetchUser.execute();
      toast.success("Folder successfully created!");
    } else {
      // Update folder
      await api.value?.updateFolder(
        data.value.id,
        data.value.parent,
        data.value.name
      );
      toast.success("Folder successfully updated!");
    }
    // Close modal
    modalOpen.value = false;
  },
  null,
  {
    onError: (e) => {
      toast.error((e as Error).message);
    },
    immediate: false,
  }
);

function open(folder: Folder | undefined = undefined) {
  if (folder) {
    data.value.id = folder.id;
    data.value.name = folder.name;
    data.value.parent = folder.parent;
  } else {
    data.value.id = -1;
    data.value.name = "";
    data.value.parent = 0;
  }
}

defineExpose({ open });
</script>

<template>
  <!-- Encryption modal modal -->
  <div class="modal" :class="{ 'modal-open': modalOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ title }}</h3>
      <input
        v-model="data.name"
        class="input input-info input-bordered w-full mt-3"
        :class="{
          'input-info': !emptyName,
          'input-error': emptyName,
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
