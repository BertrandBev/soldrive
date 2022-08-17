<script setup lang="ts">
// @ts-ignore
import VuePlyr from "vue-plyr";
import link from "../../assets/ZZ Top - Gimme All Your Lovin (Official Music Video).mp3";
import "vue-plyr/dist/vue-plyr.css";
import { watch, computed } from "vue";
import { fileType } from "../../store/fileTypes";
import { File } from "../../api/wrappedApi";

const props = defineProps<{
  file?: File | null;
  dataUri?: string | null;
}>();

const fileName = computed(() => props.file?.name);
const type = computed(() => fileType(props.file?.fileExt));
const isVideo = computed(() => type.value == "video");
const isAudio = computed(() => type.value == "audio");

const url = computed(() => {
  return props.dataUri;
});
</script>

<template>
  <div class="full-center flex-col">
    <!-- video element -->
    <vue-plyr v-if="isVideo && url">
      <video controls crossorigin="true" playsinline>
        <source :src="url" />
      </video>
    </vue-plyr>
    <!-- Audio element -->
    <template v-if="isAudio && url">
      <div>{{ fileName }}</div>
      <div class="max-h-[128px] mt-4">
        <vue-plyr>
          <audio controls crossorigin="true" playsinline>
            <source :src="url" />
          </audio>
        </vue-plyr>
      </div>
    </template>
  </div>
</template>
