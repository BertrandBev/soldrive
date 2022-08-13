<script setup lang="ts">
import VuePdfEmbed from "vue-pdf-embed";
import link from "../../assets/img-2.webp";
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <img :src="link" class="w-full h-full object-contain" />
    <!-- <div class="max-w-5xl mx-auto">
      
    </div> -->
  </div>
</template>
