<script setup lang="ts">
import { MenuIcon, ChevronLeftIcon, LoginIcon } from "@heroicons/vue/outline";
import { DotsHorizontalIcon } from "@heroicons/vue/solid";
import { useChainApi } from "../api/chainApi";
import { WalletMultiButton } from "solana-wallets-vue";
import { useRoute, useRouter } from "vue-router";
import AuthButton from "./AuthButton.vue";
import { computed, ref, watch } from "vue";
import ClusterButton from "./ClusterButton.vue";

const route = useRoute();
const router = useRouter();
const props = defineProps<{
  onMenuClicked: () => void;
}>();

const routeName = computed(() => {
  const name = route.meta.name;
  if (typeof name == "string") {
    return name;
  } else if (typeof name == "function") {
    return name(route);
  } else {
    return "";
  }
});

const hasBack = ref(false);
watch(
  [route],
  () => {
    hasBack.value = window.history.length > 1;
    // console.log("hasback", window.history);
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>

<template>
  <div
    class="navbar bg-base-200 border-b border-slate-800 sticky top-0 z-50"
  >
    <!-- Menu button -->
    <button
      class="btn btn-square btn-ghost lg:hidden"
      @click="props.onMenuClicked"
    >
      <MenuIcon class="w-5 h-5" />
    </button>
    <!-- Back button -->
    <button
      v-if="route.meta.showBack"
      class="btn btn-square btn-ghost"
      @click="() => $router.back()"
    >
      <ChevronLeftIcon class="w-5 h-5" />
    </button>
    <img
      class="ml-2"
      v-else-if="route.meta.showLogo"
      src="../assets/logo.png"
      width="42"
      height="42"
    />
    <!-- Name -->
    <div class="normal-case text-xl font-bold px-4">{{ routeName }}</div>
    <div class="flex-1"></div>
    <!-- Buttons -->
    <ClusterButton></ClusterButton>
    <div class="ml-2">
      <WalletMultiButton dark></WalletMultiButton>
    </div>
    <AuthButton></AuthButton>
  </div>
</template>

<style>
.swv-button {
  white-space: nowrap;
}
</style>
