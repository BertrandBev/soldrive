<script setup lang="ts">
import { MenuIcon, ChevronLeftIcon, LoginIcon } from "@heroicons/vue/outline";
import { DotsHorizontalIcon } from "@heroicons/vue/solid";
import { WalletMultiButton } from "solana-wallets-vue";
import { useRoute } from "vue-router";
import AuthButton from "./AuthButton.vue";

const props = defineProps<{
  onMenuClicked: () => void;
}>();

function login() {}

const route = useRoute();
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
    <button class="btn btn-square btn-ghost" @click="() => $router.back()">
      <ChevronLeftIcon class="w-5 h-5" />
    </button>
    <div class="">
      <a class="btn btn-ghost normal-case text-xl">
        {{ route.meta.name }}
      </a>
    </div>
    <div class="flex-1"></div>
    <div class="">
      <WalletMultiButton dark></WalletMultiButton>
    </div>
    <AuthButton class="ml-2"></AuthButton>
  </div>
</template>
