<script setup lang="ts">
import VuePdfEmbed from "vue-pdf-embed";
import link from "../../assets/c4611_sample_explain.pdf";
</script>

<template>
  <div class="w-full h-full overflow-y-scroll">
    <div class="max-w-5xl mx-auto">
      <vue-pdf-embed :source="link"></vue-pdf-embed>
    </div>
  </div>
</template>
