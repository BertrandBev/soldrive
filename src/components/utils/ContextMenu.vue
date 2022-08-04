<template>
  <div class="overlay" @click="close" v-show="opened">
    <div
      class="context-menu"
      ref="container"
      v-show="opened"
      @contextmenu.capture.prevent
    >
      <ul class="menu bg-slate-800 rounded-box">
        <slot></slot>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import Popper from "popper.js";
import { ref, nextTick, onBeforeUnmount } from "vue";

const opened = ref(false);
let popper: Popper | null = null;
const container = ref(null as Element | null);

function referenceObject(evt: MouseEvent): Popper.ReferenceObject {
  const left = evt.clientX;
  const top = evt.clientY;
  console.log(top, left);
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
  opened.value = true;
  if (popper) {
    popper.destroy();
  }
  popper = new Popper(referenceObject(evt), container.value as Element, {
    placement: "bottom-start",
    positionFixed: true,
  });

  // Recalculate position
  nextTick(() => {
    popper!.scheduleUpdate();
  });
}

function close() {
  opened.value = false;
}

onBeforeUnmount(() => {
  if (popper) {
    popper!.destroy();
    popper = null;
  }
});

defineExpose({ open, close });
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 999;
  overflow: hidden;
}

.overlay {
  position: fixed;
  z-index: 998;
  width: 100vw;
  height: 100vh;
  background-color: #00000055;
  left: 0;
  top: 0;
}
</style>
