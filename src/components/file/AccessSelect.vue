<script setup lang="ts">
import { Access } from "../../api/chainApi";
import { ref, watch } from "vue";
import { InformationCircleIcon } from "@heroicons/vue/outline";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/vue/solid";
import { useEscapeClose } from "../utils/utils";

const props = defineProps<{
  modelValue: Access;
}>();

const access = ref("private" as Access);

const infoModalOpen = ref(false);
useEscapeClose(infoModalOpen);

const emit = defineEmits<{
  (e: "update:modelValue", value: Access): void;
}>();

watch(
  [props],
  () => {
    if (access.value != props.modelValue) {
      access.value = props.modelValue;
    }
  },
  { immediate: true }
);

watch([access], () => {
  emit("update:modelValue", access.value);
});
</script>

<template>
  <div class="flex items-center">
    <!-- Encryption -->
    <div class="flex items-center">
      <span class="opacity-50">Encryption</span>
      <select v-model="access" class="select ml-1">
        <option value="private">Private (encrypted)</option>
        <option value="publicRead">Public read only</option>
        <option value="publicReadWrite">Public read write</option>
      </select>
      <div class="ml-2">
        <LockClosedIcon
          class="w-[18px] h-[18px]"
          v-if="modelValue == 'private'"
        ></LockClosedIcon>
        <LockOpenIcon class="w-[18px] h-[18px]" v-else></LockOpenIcon>
      </div>
      <!-- Tooltip -->
      <button class="btn btn-xs btn-ghost ml-2" @click="infoModalOpen = true">
        <InformationCircleIcon class="w-5 h-5"></InformationCircleIcon>
      </button>
    </div>
    <!-- Info modal -->
    <div class="modal" :class="{ 'modal-open': infoModalOpen }">
      <div class="modal-box">
        <p class="py-2">
          Private note and files will be encrypted using a key derived from your
          wallet keys. To share notes & files, leave them unencrypted
        </p>
        <div class="modal-action">
          <div class="btn" @click="infoModalOpen = false">Close</div>
        </div>
      </div>
    </div>
  </div>
</template>
