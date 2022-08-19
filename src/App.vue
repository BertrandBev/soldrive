<script setup lang="ts">
import { ref, watch, computed } from "vue";
import NavBar from "./components/NavBar.vue";
import Drawer from "./components/Drawer.vue";
import { useRoute } from "vue-router";
import { useUserStore } from "./store/userStore";
import Loader from "./components/utils/Loader.vue";

const drawer = ref(null);
const route = useRoute();
const { isLoggedIn, fetchUser, fetchEncryptionKey } = useUserStore();

const loading = computed(() => {
  return fetchUser.isLoading.value || fetchEncryptionKey.isLoading.value;
});

const routeEnabled = computed(() => {
  return route.meta.noLogin || isLoggedIn.value;
});

function onMenuClicked() {
  const el = drawer.value as any;
  el.click();
}

// document.addEventListener("keydown", function (event) {
//   if (event.metaKey) {
//     // console.log("cmd pressed");
//     // event.stopPropagation();
//   }
// });

// Handle auto navigation
</script>

<template>
  <div class="drawer drawer-mobile h-screen" id="app">
    <input ref="drawer" id="drawer" type="checkbox" class="drawer-toggle" />
    <Drawer />
    <div class="drawer-content flex flex-col h-full">
      <NavBar :onMenuClicked="onMenuClicked" />
      <div class="w-full h-full">
        <div class="max-w-5xl h-full" style="margin: auto">
          <router-view v-if="routeEnabled" />
          <div v-else class="full-center">
            <Loader v-if="loading"></Loader>
            <div v-else>Please login</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Common classes */
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

.absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
