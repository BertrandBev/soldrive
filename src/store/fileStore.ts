import { WebBundlr } from "@bundlr-network/client";
import {
  useChainApi,
  useAnchorWallet,
  useAnchorProvider,
} from "../api/chain-api";
import { createGlobalState } from "@vueuse/core";
import { watch } from "vue";
import { Connection, Transaction } from "@solana/web3.js";
import { useWallet } from "solana-wallets-vue";
import { computed } from "vue";
const FORCE_ANCHOR_WALLET = true;

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

  async function uploadFile() {
    //
    if (!readyPromise || !bundlr) {
      throw new Error("Wallet not ready");
    }
    await readyPromise;
    const data = Buffer.from("A cool file!");

    // Get balance
    const balance = await bundlr.getLoadedBalance();
    const cost = await bundlr.getPrice(data.length);
    console.log("balance:", balance.toNumber(), "cost:", cost.toNumber());

    // Fund
    if (balance.toNumber() < cost.toNumber()) {
      console.log("Funds required");
      const fundStatus = await bundlr.fund(cost.toNumber());
      console.log("Funded:", fundStatus);
    }

    // Upload file
    const tags = [{ name: "Content-Type", value: "text/plain" }];
    const tx = bundlr!.createTransaction(data, { tags });
    //
    await tx.sign();
    const result = await tx.upload();
    console.log("result:", result);
  }

  return {
    uploadFile,
  };
}

export const useFileStore = createGlobalState(() => createFileStore());
