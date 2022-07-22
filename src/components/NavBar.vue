<script setup lang="ts">
import { MenuIcon, ChevronLeftIcon } from "@heroicons/vue/outline";
import { DotsHorizontalIcon } from "@heroicons/vue/solid";
import { WalletMultiButton } from "solana-wallets-vue";
import { useRoute } from "vue-router";

const props = defineProps<{
  onMenuClicked: () => void;
}>();

const route = useRoute();
</script>

<template>
  <div class="navbar bg-base-100 border-b border-slate-800 sticky top-0 z-50">
    <!-- Menu button -->
    <button
      class="flex-none btn btn-square btn-ghost lg:hidden"
      @click="props.onMenuClicked"
    >
      <MenuIcon class="w-5 h-5" />
    </button>
    <!-- Back button -->
    <button
      class="flex-none btn btn-square btn-ghost"
      @click="() => $router.back()"
    >
      <ChevronLeftIcon class="w-5 h-5" />
    </button>

    <div class="flex-1">
      <a class="btn btn-ghost normal-case text-xl">
        {{ route.meta.name }}
      </a>
    </div>
    <div class="flex-none">
      <WalletMultiButton dark></WalletMultiButton>
    </div>
  </div>
</template>
