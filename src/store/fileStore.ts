import { WebBundlr } from "@bundlr-network/client";
import {
  useChainApi,
  useAnchorWallet,
  useAnchorProvider,
} from "../api/chain-api";
import { createGlobalState } from "@vueuse/core";
import { watch } from "vue";
import { Connection, Transaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
const FORCE_ANCHOR_WALLET = true;

export function spaceString(
  val: number,
  precision = 0,
  prefixes = ["B", "KB", "MB", "GB", "TB"]
) {
  let idx = 0;
  while (val > 1e3 && idx < prefixes.length) {
    val /= 1e3;
    idx += 1;
  }
  let rtn = `${val.toFixed(precision)}`;
  if (idx < prefixes.length) {
    rtn += ` ${prefixes[idx]}`;
  }
  return rtn;
}

function createFileStore() {
  let { wallet, connection, provider } = useChainApi();
  if (FORCE_ANCHOR_WALLET) {
    // Force real wallet
    wallet = useAnchorWallet();
    connection = new Connection(
      "https://api.mainnet-beta.solana.com",
      "processed"
    );
    provider = useAnchorProvider(connection, wallet);
  }

  let bundlr: WebBundlr | null = null;
  let readyPromise: Promise<void> | null = null;

  watch(
    [wallet],
    () => {
      if (wallet.value) {
        const pvd = {
          publicKey: wallet.value.publicKey,
          sendTransaction: async (tx: Transaction) => {
            await provider.value?.sendAndConfirm(tx);
          },
          signMessage: async (msg: Uint8Array) => {
            return wallet.value?.signMessage(msg);
          },
        };
        bundlr = new WebBundlr("https://node1.bundlr.network", "solana", pvd);
        readyPromise = bundlr.ready();
      }
    },
    { immediate: true }
  );

  async function awaitBundlr() {
    if (!readyPromise || !bundlr) {
      throw new Error("Wallet not ready");
    }
    await readyPromise;
  }

  async function getBalance() {
    await awaitBundlr();
    return await bundlr!.getLoadedBalance();
  }

  async function getCost(bytes: number) {
    await awaitBundlr();
    return await bundlr!.getPrice(bytes);
  }

  async function deposit(amount: BigNumber) {
    await awaitBundlr();
    if (!bundlr) return;
    const fundStatus = await bundlr.fund(amount);
    return fundStatus;
  }

  async function withdrawBalance() {
    await awaitBundlr();
    if (!bundlr) return;
    const balance = await getBalance();
    await bundlr.withdrawBalance(balance!);
  }

  async function uploadFile() {
    //
    if (!readyPromise || !bundlr) {
      throw new Error("Wallet not ready");
    }
    await readyPromise;
    const data = Buffer.from("A cool file!");

    // Get balance
    const balance = await getBalance();
    const cost = await getCost(data.length);
    console.log("balance:", balance.toNumber(), "cost:", cost.toNumber());

    if (balance.isLessThan(cost)) {
      throw new Error("Insufficient funds");
    }

    // Upload file
    // application/octet-stream
    const tags = [{ name: "Content-Type", value: "application/octet-stream" }];
    const tx = bundlr.createTransaction(data, { tags });
    // Sign and send transaction
    await tx.sign();
    const result = await tx.upload();
    console.log("result:", result);
  }

  return {
    getBalance,
    getCost,
    deposit,
    withdrawBalance,
    uploadFile,
  };
}

export const useFileStore = createGlobalState(() => createFileStore());
