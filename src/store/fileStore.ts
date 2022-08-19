import { WebBundlr } from "@bundlr-network/client";
import {
  getCluster,
  useChainApi,
  useAnchorWallet,
  useAnchorProvider,
} from "../api/chainApi";
import { File } from "../api/wrappedApi";
import { createGlobalState } from "@vueuse/core";
import { watch, ref } from "vue";
import { Connection, Transaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { useUserStore } from "./userStore";
import axios from "axios";

import { FileType, fileMeme } from "./fileTypes";

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
  // Force mainnet if using localnet
  const cluster = getCluster();
  if (cluster == "localnet") {
    wallet = useAnchorWallet();
    connection = new Connection(
      "https://api.mainnet-beta.solana.com",
      "processed"
    );
    provider = useAnchorProvider(connection, wallet);
  }

  let bundlr: WebBundlr | null = null;
  let readyPromise: Promise<void> | null = null;
  const mbCostArweave = ref(new BigNumber(0));
  const mbCostSolana = ref(new BigNumber(0));

  watch(
    [wallet],
    async () => {
      if (wallet.value) {
        const pvd = {
          publicKey: wallet.value.publicKey,
          sendTransaction: async (tx: Transaction) => {
            return await provider.value?.sendAndConfirm(tx);
          },
          signMessage: async (msg: Uint8Array) => {
            return wallet.value?.signMessage(msg);
          },
        };
        const address =
          cluster == "mainnet"
            ? "https://node1.bundlr.network"
            : "https://devnet.bundlr.network";
        bundlr = new WebBundlr(address, "solana", pvd, {
          timeout: 60e3,
        });
        console.log("Arweave initialized on", cluster);
        readyPromise = bundlr.ready();
        // Ready up
        await readyPromise;
        // Load costs
        mbCostArweave.value = await getCost(1e6);
        const rent = await connection.getMinimumBalanceForRentExemption(1e6);
        mbCostSolana.value = new BigNumber(rent);
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

  async function uploadFile(data: ArrayBuffer) {
    await awaitBundlr();
    if (!bundlr) return;
    // Get balance
    const balance = await getBalance();
    const cost = await getCost(data.byteLength);
    if (balance.isLessThan(cost)) throw new Error("Insufficient funds");

    // Upload file
    const tags = [{ name: "Content-Type", value: "application/octet-stream" }];
    const tx = bundlr.createTransaction(new Uint8Array(data), { tags });
    // Sign and send transaction
    await tx.sign();
    const result = await tx.upload();
    if (!result.data || !result.data.id) throw new Error("File upload failed");
    return result.data.id;
  }

  async function downloadArweave(id: string) {
    const url = `https://arweave.net/${id}`;
    const resp = await axios.get(url, { responseType: "blob" });
    if (resp.data instanceof Blob) return resp.data;
    else throw new Error("Download failed");
  }

  async function arrayBufferToBase64(ext: string, arrayBuffer: ArrayBuffer) {
    const meme = fileMeme(ext);
    const blob = new Blob([arrayBuffer], { type: meme });
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const url = reader.result as string;
        resolve(url);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(blob);
    });
  }

  async function downloadFile(
    file: File,
    downloadLinks: boolean = true
  ): Promise<ArrayBuffer> {
    const { decrypt } = useUserStore();
    // Exit for empty content
    if (file.content.byteLength == 0) return new ArrayBuffer(0);
    // Decrypt filecontent
    const encrypted = file.access == "private";
    // Download file if needed
    if (file.backend == "solana") {
      // Solana backend
      return file.content;
    } else if (downloadLinks) {
      // Arweave backend, unpack
      const decoder = new TextDecoder();
      const contentStr = decoder.decode(file.content);
      // Unpack metadata
      const meta = contentStr.split("\n");
      const id = meta[0];
      // Unpack note
      const blob = await downloadArweave(id);
      return await decrypt(await blob.arrayBuffer(), file.access == "private");
    } else {
      return new ArrayBuffer(0);
    }
  }

  function clientDownload(filename: string, base64: string) {
    var element = document.createElement("a");
    element.setAttribute("href", base64);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return {
    mbCostArweave,
    mbCostSolana,
    getBalance,
    getCost,
    deposit,
    withdrawBalance,
    uploadFile,
    downloadArweave,
    arrayBufferToBase64,
    downloadFile,
    clientDownload,
  };
}

export const useFileStore = createGlobalState(() => createFileStore());
