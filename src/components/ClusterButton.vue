<script setup lang="ts">
import { getCluster, setCluster, Cluster, useChainApi } from "../api/chainApi";
import { useAsyncState } from "@vueuse/core";
import { useToast } from "vue-toastification";
const { api, wallet } = useChainApi();
const toast = useToast();

const cluster = getCluster();

const { execute: airdrop, isLoading } = useAsyncState(
  async () => {
    if (!api.value || !wallet.value) return toast.error("Connect wallet first");
    if (cluster == "mainnet") return toast.error("Can't airdrop on mainnet");
    await api.value.airdrop(wallet.value.publicKey);
    toast.success("Airdropped 2 SOL!");
  },
  null,
  {
    immediate: false,
    onError: (e) => {
      console.error(e);
      toast.error((e as Error).message);
    },
  }
);

function setMainnet() {
  toast.info(
    "SolDrive will soon be deployed on mainnet. All the features can be used on devnet"
  );
}
</script>

<template>
  <div class="dropdown">
    <label
      tabindex="0"
      class="btn btn-ghost text-slate-500"
      :class="{ 'text-blue-300': cluster == 'devnet' }"
      >{{ cluster }}</label
    >
    <ul
      tabindex="0"
      class="dropdown-content menu p-2 gap-2 shadow bg-black rounded-box w-52"
    >
      <li>
        <a :class="{ active: cluster == 'mainnet' }" @click="() => setMainnet()"
          >Mainnet</a
        >
      </li>
      <li>
        <a
          :class="{ active: cluster == 'devnet' }"
          @click="() => setCluster('devnet')"
          >Devnet</a
        >
      </li>
      <button
        class="btn"
        :class="{ loading: isLoading }"
        @click.stop="() => airdrop()"
      >
        Airdrop
      </button>
    </ul>
  </div>
</template>
