<template>
  <div class="overlay" @click="close" v-show="opened">
    <div
      class="context-menu"
      ref="container"
      v-show="opened"
      @contextmenu.capture.prevent
    >
      <ul class="menu bg-slate-800 text-white rounded-box">
        <slot></slot>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount } from "vue";
import { openPopper, closePopper, ReferenceObject } from "./popper";
import { onKeyStroke } from "@vueuse/core";

const opened = ref(false);

const container = ref(null as Element | null);

function referenceObject(evt: MouseEvent): ReferenceObject {
  const left = evt.clientX;
  const top = evt.clientY;
  const clientWidth = 1;
  const clientHeight = 1;
  const right = left + clientWidth;
  const bottom = top + clientHeight;

  function getBoundingClientRect(): ClientRect {
    return new DOMRect(left, top, right - left, bottom - top);
  }

  const obj = {
    getBoundingClientRect,
    clientWidth,
    clientHeight,
  };
  return obj;
}

function open(evt: MouseEvent) {
  openPopper(referenceObject(evt), container.value!, nextTick);
  opened.value = true;
}

function close() {
  closePopper();
  opened.value = false;
}

onBeforeUnmount(() => {
  close();
});

onKeyStroke("Escape", (e) => {
  if (opened.value) {
    e.preventDefault();
    close();
  }
});

defineExpose({ open, close });
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 250;
  overflow: hidden;
}

.overlay {
  position: fixed;
  z-index: 200;
  width: 100vw;
  height: 100vh;
  background-color: #00000088;
  left: 0;
  top: 0;
}
</style>
