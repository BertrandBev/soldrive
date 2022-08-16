<script setup lang="ts">
import { watch, computed } from "vue";
const props = defineProps<{
  dataUri?: string | null;
}>();

const text = computed(() => {
  if (props.dataUri) {
    const mime = "data:text/plain;base64,";
    if (!props.dataUri.startsWith(mime)) {
      console.error("Mime type error");
      return "Text decoding error";
    }
    const buffer = Buffer.from(props.dataUri.replace(mime, ""), "base64");
    const dec = new TextDecoder();
    return dec.decode(buffer);
  }
  return "";
});
</script>

<template>
  <div class="overflow-y-scroll pt-[16px] m-auto">
    <div class="max-w-5xl p-8" style="white-space: pre-line">{{ text }}</div>
  </div>
</template>
