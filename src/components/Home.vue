<script setup lang="ts">
import { ref, onMounted } from "vue";
import { PlusIcon } from "@heroicons/vue/outline";
import { useRoute } from "vue-router";
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="w-full flex">
      <!-- Spacer -->
      <div class="w-full"></div>
      <!-- Add button -->
      <button class="btn gap-2" @click="$router.push('file')">
        Button
        <PlusIcon class="w-5 h-5"></PlusIcon>
      </button>
    </div>
  </div>
</template>
