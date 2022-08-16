<script setup lang="ts">
import { ref } from "vue";
import NavBar from "./components/NavBar.vue";
import Drawer from "./components/Drawer.vue";

const drawer = ref(null);

function onMenuClicked() {
  const el = drawer.value as any;
  el.click();
}
</script>

<template>
  <div class="drawer drawer-mobile h-screen" id="app">
    <input ref="drawer" id="drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col h-full">
      <NavBar :onMenuClicked="onMenuClicked" />
      <div class="w-full h-full">
        <div class="max-w-5xl" style="margin: auto">
          <router-view />
        </div>
      </div>
    </div>
    <Drawer />
  </div>
</template>

<style>
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.full-center {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-2-lines {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
