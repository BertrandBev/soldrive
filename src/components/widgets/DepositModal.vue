<script setup lang="ts">
import { useFileStore, spaceString } from "../../store/fileStore";
import { useAsyncState } from "@vueuse/core";
import { useToast } from "vue-toastification";
import { ref, onMounted, watch, computed } from "vue";
import BigNumber from "bignumber.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAnchorWallet } from "../../api/chainApi";
import { getCluster } from "../../api/chainApi";
import { useEscapeClose } from "../utils/utils";

const {
  deposit,
  getBalance,
  getCost,
  uploadFile,
  withdrawBalance,
  mbCostArweave,
} = useFileStore();
const toast = useToast();

const modalOpen = ref(false);
const minSizeMb = ref(0);
const amountMb = ref(0);
const cluster = getCluster();

useEscapeClose(modalOpen);

const amountError = computed(() => {
  if (isNaN(amountMb.value) || amountMb.value <= 0) return "Invalid amount";
  if (amountMb.value > 1e9) return "Must be < 1TB";
  if (minSizeMb.value > 0 && amountMb.value < minSizeMb.value)
    return `Must be > ${minSizeMb.value}MB`;
});

const amountLamports = computed(() => {
  return Math.ceil(amountMb.value * mbCostArweave.value.toNumber());
});

const cryptoCostStr = computed(() => {
  return `${(amountLamports.value / LAMPORTS_PER_SOL).toFixed(4)} SOL`;
});

// Callback
const callback = { resolve: () => {}, reject: (reason: any) => {} };

const { execute: depositFunds, isLoading: depositLoading } = useAsyncState(
  async () => {
    if (amountError.value) {
      toast.error(amountError.value);
      return;
    }
    await deposit(new BigNumber(amountLamports.value));
    toast.success("Deposit successful!");
    modalOpen.value = false;
    callback.resolve();
  },
  null,
  {
    immediate: false,
    onError: (e) => {
      callback.reject(e);
      console.error(e);
      toast.error((e as Error).message);
    },
  }
);

async function open(minSizeInMb: number) {
  minSizeMb.value = minSizeInMb;
  modalOpen.value = true;
  amountMb.value = Math.ceil(minSizeInMb);
  return new Promise<void>((resolve, reject) => {
    callback.resolve = resolve;
    callback.reject = reject;
  });
}

function close() {
  modalOpen.value = false;
  callback.reject(new Error("Operation cancelled"));
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
          v-model="amountMb"
          type="number"
          placeholder="File space"
          class="mt-2 input input-bordered input-info w-full max-w-[200px]"
          :class="{ 'input-error': amountError }"
        />
        <div class="ml-2 font-bold mt-2">MB</div>
      </div>
      <!--  -->
      <div v-if="amountError" class="text-red-400 mt-3">
        {{ amountError }}
      </div>
      <div v-else class="mt-3 badge badge-lg badge-success">
        Cost: {{ cryptoCostStr }} {{ cluster == "devnet" ? "(devnet)" : "" }}
      </div>

      <!--  -->
      <div class="modal-action">
        <div class="btn" @click="close">Cancel</div>
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
