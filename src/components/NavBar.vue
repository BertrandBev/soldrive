<script setup lang="ts">
import { MenuIcon, ChevronLeftIcon, LoginIcon } from "@heroicons/vue/outline";
import { DotsHorizontalIcon } from "@heroicons/vue/solid";
import { WalletMultiButton } from "solana-wallets-vue";
import { useRoute, useRouter } from "vue-router";
import AuthButton from "./AuthButton.vue";
import { computed } from "vue";

const route = useRoute();
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
</script>

<template>
  <div class="navbar bg-base-200 border-b border-slate-800 sticky top-0 z-50">
    <!-- Menu button -->
    <button
      class="btn btn-square btn-ghost lg:hidden"
      @click="props.onMenuClicked"
    >
      <MenuIcon class="w-5 h-5" />
    </button>
    <!-- Back button -->
    <button
      v-if="!route.meta.hideBack"
      class="btn btn-square btn-ghost"
      @click="() => $router.back()"
    >
      <ChevronLeftIcon class="w-5 h-5" />
    </button>
    <img class="ml-2" v-else src="../assets/logo.png" width="42" height="42" />
    <!-- Name -->
    <div class="normal-case text-xl font-bold px-4">{{ routeName }}</div>
    <div class="flex-1"></div>
    <div>
      <WalletMultiButton dark></WalletMultiButton>
    </div>
    <AuthButton></AuthButton>
  </div>
</template>
