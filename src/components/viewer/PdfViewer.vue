<script setup lang="ts">
import VuePdfEmbed from "vue-pdf-embed";
import link from "../../assets/c4611_sample_explain.pdf";
import { useResizeObserver } from "@vueuse/core";
import { ref, nextTick } from "vue";

const body = ref<HTMLElement>();

const props = defineProps<{
  dataUri?: string | null;
}>();

// Blink
const show = ref(true);
useResizeObserver(body, async () => {
  console.log("resized!");
  // show.value = false;
  await nextTick();
  // show.value = true;
  console.log("Showing:", show.value);
  // TODO!: fix
});
</script>

<template>
  <div ref="body" class="w-full h-full overflow-y-scroll">
    <div class="max-w-5xl mx-auto">
      <vue-pdf-embed v-if="dataUri && show" :source="dataUri"></vue-pdf-embed>
    </div>
  </div>
</template>
