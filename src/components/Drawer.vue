<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const menuItems = [
  { name: "Home", route: "/explorer" },
  { name: "Account", route: "/account" },
];
</script>

<template>
  <div class="drawer-side bg-slate-900">
    <label for="drawer" class="drawer-overlay"></label>
    <ul class="menu p-4 overflow-y-auto w-60 bg-base-100 text-base-content">
      <!-- Sidebar content here -->
      <li v-for="item in menuItems">
        <a
          :class="{ active: route.fullPath == item.route }"
          @click="$router.push(item.route)"
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
