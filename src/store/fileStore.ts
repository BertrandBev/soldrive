import { WebBundlr } from "@bundlr-network/client";
import { useChainApi } from "../api/chain-api";
import { createGlobalState } from "@vueuse/core";

function createFileStore() {
  const { connection, wallet, provider } = useChainApi();

  const bundlr = new WebBundlr(
    "https://node1.bundlr.network",
    "solana",
    provider.value
  );

  let readyPromise = bundlr.ready();

  async function uploadFile() {
    await readyPromise;
    const data = Buffer.from([0, 1, 2, 3]);
    const tags = [{ name: "Content-Type", value: "text/plain" }];
    const tx = bundlr.createTransaction(data, { tags });
    //
    await tx.sign();
    await tx.upload();
  }

  return {
    uploadFile,
  };
}

export const useFileStore = createGlobalState(() => createFileStore());
