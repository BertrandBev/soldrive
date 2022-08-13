<script setup lang="ts">
// @ts-ignore
import VuePlyr from "vue-plyr";
import link from "../../assets/Rochelle_2.mp4";
import "vue-plyr/dist/vue-plyr.css";
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <!-- video element -->
    <vue-plyr>
      <video controls crossorigin="true" playsinline>
        <source :src="link" />
        <!-- <source size="1080" src="/path/to/video-1080p.mp4" type="video/mp4" />
        <track
          default
          kind="captions"
          label="English captions"
          src="/path/to/english.vtt"
          srclang="en"
        /> -->
      </video>
    </vue-plyr>

    <!-- <img :src="link" class="w-full h-full object-contain" /> -->
    <!-- <div class="max-w-5xl mx-auto">
      
    </div> -->
  </div>
</template>
