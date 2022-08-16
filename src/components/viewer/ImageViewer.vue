<script setup lang="ts">
import VuePdfEmbed from "vue-pdf-embed";
import { watch } from "vue";

const props = defineProps<{
  dataUri?: string | null;
}>();
</script>

<template>
  <div class="full-center">
    <img
      v-if="dataUri"
      :src="dataUri || ''"
      class="w-full h-full object-contain"
    />
  </div>
</template>
