<script setup lang="ts">
import { useFileStore, spaceString } from "../../store/fileStore";
import { useAsyncState } from "@vueuse/core";
import { useToast } from "vue-toastification";
import { ref, onMounted } from "vue";
import BigNumber from "bignumber.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const modalOpen = ref(false);

const { deposit, getBalance, getCost, uploadFile, withdrawBalance } =
  useFileStore();
const toast = useToast();

const amount = ref(0);

const { execute: depositFunds, isLoading: depositLoading } = useAsyncState(
  async () => {
    // await deposit(BigNumber(2));
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

// Retrieve balance
// const balance = ref<BigNumber | null>(null);
const mbCost = ref<BigNumber | null>(null);
const storageBalanceStr = ref("");
const cryptoBalanceStr = ref("");
onMounted(async () => {
  // Loading state
  storageBalanceStr.value = "...";
  cryptoBalanceStr.value = "";
  // Retrieve balances
  try {
    // balance.value = await getBalance();
    mbCost.value = await getCost(1e6);
    if (!mbCost.value) throw new Error("Invalid cost");
  } catch (e) {
    console.error(e);
    storageBalanceStr.value = "Error";
    return;
  }
  // Finish loading
  const mbAllowed = balance.value.dividedBy(mbCost.value).multipliedBy(1e6);
  storageBalanceStr.value = spaceString(mbAllowed.toNumber(), 1);
  cryptoBalanceStr.value =
    balance.value.dividedBy(LAMPORTS_PER_SOL).toFixed(3) + " SOL";
});

function open() {
  modalOpen.value = true;
}

defineExpose({ open });
</script>

<template>
  <!-- Withdraw modal -->
  <div class="modal" :class="{ 'modal-open': modalOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Deposit file storage funds</h3>
      <p class="py-2">
        Enter the amount of file space you would like to reserve. Deposited
        funds can be withdrawn at any time, and will only be used when uploading
        files
      </p>
      <div class="flex items-center">
        <input
          v-model="amount"
          type="number"
          placeholder="Funding amount"
          class="mt-2 input input-bordered input-info w-full max-w-[200px]"
        />
        <div class="ml-2 font-bold mt-2">MB</div>
      </div>
      <!--  -->
      <div class="mt-3 badge badge-lg badge-success">Cost 0.380 SOL</div>
      <!--  -->
      <div class="modal-action">
        <div class="btn" @click="modalOpen = false">Cancel</div>
        <div
          class="btn"
          :class="{ loading: depositLoading }"
          @click="() => depositFunds()"
        >
          Yes
        </div>
      </div>
    </div>
  </div>
</template>
