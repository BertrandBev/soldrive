<script setup lang="ts">
import { Backend } from "../../api/chain-api";
import { ref } from "vue";
import { InformationCircleIcon } from "@heroicons/vue/outline";

defineProps<{
  modelValue: Backend;
}>();

const infoModalOpen = ref(false);

const emit = defineEmits<{
  (e: "update:modelValue", value: Backend): void;
}>();

function setBackend(backend: Backend) {
  emit("update:modelValue", backend);
}
</script>

<template>
  <!-- Backend -->
  <div class="mt-2 flex items-center">
    <span class="opacity-50">Backend</span>
    <div class="tabs tabs-boxed ml-3">
      <a
        v-for="back in (['solana', 'arweave'] as Backend[])"
        class="tab"
        :class="{ 'tab-active': modelValue == back }"
        @click="() => setBackend(back)"
        >{{ back }}</a
      >
    </div>
    <!-- Tooltip -->
    <button class="btn btn-xs btn-ghost ml-2" @click="infoModalOpen = true">
      <InformationCircleIcon class="w-5 h-5"></InformationCircleIcon>
    </button>
    <!-- Info modal -->
    <div class="modal" :class="{ 'modal-open': infoModalOpen }">
      <div class="modal-box">
        <p class="py-2">
          Notes and files can be stored directly on-chain on Solana, or on the
          file storage chain Arweave
        </p>
        <p class="py-2">
          Storing on-chain is much more expensive but is the most direct form of
          storage as it doesn't rely on an additionnal chain for file storage.
          It is only recommended for small notes or tiny files
        </p>
        <p class="py-2">
          Using Arweave is recommended for bigger files or notes
        </p>
        <div class="modal-action">
          <div class="btn" @click="infoModalOpen = false">Close</div>
        </div>
      </div>
    </div>
  </div>
</template>
