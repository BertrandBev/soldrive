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
        <div class="max-w-3xl" style="margin: auto">
          <router-view />
        </div>
      </div>
      <!-- <Notification></Notification> -->
    </div>
    <Drawer />
  </div>
</template>
