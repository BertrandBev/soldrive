<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const menuItems = [
  { name: "Collections", route: "/" },
  { name: "Account", route: "/account" },
];
</script>

<template>
  <div class="drawer-side lg:border-r lg:border-slate-800">
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
    </ul>
  </div>
</template>
