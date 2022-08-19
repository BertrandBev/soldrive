<script lang="ts" setup>
import { ClipboardIcon, XIcon, CheckIcon } from "@heroicons/vue/outline";
import { useClipbardStore } from "../../store/clipboardStore";
import { useAsyncState } from "@vueuse/core";
import { computed } from "vue";

const { items, clear, move } = useClipbardStore();

const props = defineProps<{
  folder: number;
  onMoved: () => void;
}>();

const { execute: moveContent, isLoading } = useAsyncState(
  async () => {
    await move(props.folder);
    props.onMoved();
  },
  null,
  {
    immediate: false,
  }
);

defineExpose({ moveContent });
</script>

<template>
  <!-- Toolbar -->
  <div class="w-full flex mt-2 mb-2 items-center">
    <!-- Filter -->
    <ClipboardIcon class="w-5 h-5 ml-4"></ClipboardIcon>
    <!-- Folders & Files -->
    <div class="shrink-0 flex-1 overflow-x-scroll hide-scrollbar">
      <div class="flex">
        <div
          class="card card-bordered border-slate-500 gap-2 p-2 flex-row items-center max-w-[160px] h-[58px] ml-2 shrink-0"
          v-for="item in items"
        >
          <img :src="item.icon" class="object-contain" width="24" height="24" />
          <div class="text-sm text-2-lines">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <!-- Actions -->
    <button class="btn btn-ghost gap-2" @click="clear">
      Clear
      <XIcon class="w-5 h-5"></XIcon>
    </button>
    <button
      class="btn btn-ghost gap-2"
      :class="{ loading: isLoading }"
      @click="() => moveContent()"
    >
      Paste
      <CheckIcon class="w-5 h-5"></CheckIcon>
    </button>
  </div>
</template>
