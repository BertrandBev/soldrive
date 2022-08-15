<script setup lang="ts">
import VuePdfEmbed from "vue-pdf-embed";
import { watch } from "vue";

const props = defineProps<{
  dataUri?: string | null;
}>();

watch(
  [props],
  () => {
    console.log("uri", props.dataUri);
  },
  { immediate: true }
);
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <img
      v-if="dataUri"
      :src="dataUri || ''"
      class="w-full h-full object-contain"
    />
  </div>
</template>
