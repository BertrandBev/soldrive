<script setup lang="ts">
import { useFileStore, spaceString } from "../../store/fileStore";
import { useAsyncState } from "@vueuse/core";
import { useToast } from "vue-toastification";
import { ref, onMounted, watch } from "vue";
import BigNumber from "bignumber.js";
import DepositModal from "./DepositModal.vue";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAnchorWallet } from "../../api/chain-api";
import { InformationCircleIcon } from "@heroicons/vue/outline";
const modalOpen = ref(false);
const infoModalOpen = ref(false);
const depositModal = ref<null | InstanceType<typeof DepositModal>>(null);

const { deposit, getBalance, getCost, uploadFile, withdrawBalance, mbCost } =
  useFileStore();
const toast = useToast();

const { execute: withdraw, isLoading: withdrawLoading } = useAsyncState(
  async () => {
    await withdrawBalance();
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

//
function openDeposit() {
  depositModal.value!.open(0);
}

// Retrieve balance
const balance = ref<BigNumber | null>(null);
const storageBalanceStr = ref("");
const cryptoBalanceStr = ref("");

async function loadFileBalance() {
  // Loading state
  storageBalanceStr.value = "...";
  cryptoBalanceStr.value = "";
  // Retrieve balances
  try {
    balance.value = await getBalance();
    if (mbCost.value.isZero()) throw new Error("Cost not loaded");
  } catch (e) {
    // console.error(e);
    storageBalanceStr.value = "";
    return;
  }
  // Finish loading
  const mbAllowed = balance.value.dividedBy(mbCost.value).multipliedBy(1e6);
  storageBalanceStr.value = spaceString(mbAllowed.toNumber(), 1);
  cryptoBalanceStr.value =
    balance.value.dividedBy(LAMPORTS_PER_SOL).toFixed(4) + " SOL";
}

const wallet = useAnchorWallet();
watch(
  [mbCost],
  () => {
    loadFileBalance();
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <!-- Stats -->
    <div class="stats bg-primary text-primary-content">
      <div class="stat">
        <div class="flex">
          <div class="stat-title">File storage balance</div>
          <button class="btn btn-xs btn-ghost" @click="infoModalOpen = true">
            <InformationCircleIcon class="w-5 h-5"></InformationCircleIcon>
          </button>
        </div>
        <div class="stat-value">
          <div>{{ storageBalanceStr }}</div>
          <div class="text-xl text-gray-300">{{ cryptoBalanceStr }}</div>
        </div>
        <div class="stat-actions">
          <button class="btn btn-sm" @click="openDeposit">Deposit</button>
          <button class="btn btn-sm ml-2" @click="modalOpen = true">
            Withdraw
          </button>
        </div>
      </div>
    </div>
    <!-- Info modal -->
    <div class="modal" :class="{ 'modal-open': infoModalOpen }">
      <div class="modal-box">
        <!-- <h3 class="font-bold text-lg">Withdraw file storage funds</h3> -->
        <p class="py-2">
          Permanant file storage on Arweave requires funds to be deposited. Deposited
          funds can be withdrawn at any time, and will only be spent when uploading files
        </p>
        <div class="modal-action">
          <div class="btn" @click="infoModalOpen = false">Close</div>
        </div>
      </div>
    </div>
    <!-- Deposit modal -->
    <DepositModal ref="depositModal"></DepositModal>
    <!-- Withdraw modal -->
    <div class="modal" :class="{ 'modal-open': modalOpen }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Withdraw file storage funds</h3>
        <p class="py-2">
          Do you want to withdraw your funds allocated to file storage?
        </p>
        <div class="modal-action">
          <div class="btn" @click="modalOpen = false">Cancel</div>
          <div
            class="btn"
            :class="{ loading: withdrawLoading }"
            @click="() => withdraw()"
          >
            Yes
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
