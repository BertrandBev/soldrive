<script setup lang="ts">
// @ts-ignore
import VuePlyr from "vue-plyr";
import link from "../../assets/Rochelle_2.mp4";
import "vue-plyr/dist/vue-plyr.css";
import { watch, computed } from "vue";
import { fileType } from "../../store/fileTypes";

const props = defineProps<{
  ext?: string;
  dataUri?: string | null;
}>();

const type = computed(() => fileType(props.ext));
const isVideo = computed(() => type.value == "video");

const url = computed(() => {
  console.log("uri", url);
  return props.dataUri;
  // props.dataUri?.replace("data:application/octet-stream", "data:video/mp4") ||
  // ""
});
// TODO!: test data uri for other video types
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <!-- video element -->
    <vue-plyr>
      <video v-if="url" controls crossorigin="true" playsinline>
        <source :src="url" />
        <!-- <track
          default
          kind="captions"
          label="English captions"
          src="/path/to/english.vtt"
          srclang="en"
        /> -->
        -->
      </video>
    </vue-plyr>
  </div>
</template>
