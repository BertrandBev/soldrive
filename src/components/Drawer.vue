<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore";

const { isLoggedIn } = useUserStore();
const route = useRoute();
const router = useRouter();
const overlay = ref<HTMLElement>();

const menuItems = [
  { name: "About", path: "/", login: false },
  { name: "Home", path: "/explorer", login: true },
  { name: "Account", path: "/account", login: true },
];
type MenuItem = typeof menuItems[0];
function onClick(item: MenuItem) {
  if (!item.login || isLoggedIn.value) {
    overlay.value?.click();
    router.push({ path: item.path });
  }
}
</script>

<template>
  <div class="drawer-side bg-slate-900 border-r-[1px] border-slate-800">
    <label
      for="drawer"
      class="drawer-overlay z-10 lg:z-0"
      ref="overlay"
    ></label>
    <ul class="menu p-4 overflow-y-auto w-60 bg-base-100 text-base-content">
      <!-- Sidebar content here -->
      <li
        v-for="item in menuItems"
        :class="{ disabled: item.login && !isLoggedIn }"
      >
        <a
          :class="{ active: route.fullPath == item.path }"
          @click="onClick(item)"
          >{{ item.name }}</a
        >
      </li>
      <div class="h-full"></div>
      <li>
        <a href="https://github.com/BertrandBev/soldrive" target="_blank">
          <img width="28" height="28" src="../assets/github-logo.png" />
          Github
        </a>
      </li>
    </ul>
  </div>
</template>

<style>
@media only screen and (min-width: 1024px) {
  /* Allow for full screen overlays */
  .drawer-toggle ~ .drawer-side > .drawer-overlay + * {
    z-index: 0;
  }
}
</style>
