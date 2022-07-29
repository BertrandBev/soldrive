import { createGlobalState, useAsyncState } from "@vueuse/core";
import { ref, watchEffect } from "vue";
import { useChainApi } from "../api/chain-api";
import axios from "axios";
import CryptoJS from "crypto-js";
import bs58 from "bs58";

const ENCRYPTION_KEY = "encryptionKey";

function createEncryptionTransaction() {}

function createUserStore() {
  const { api, wallet } = useChainApi();

  //
  let firstLoad = false;
  let encryptionKey: string | null = sessionStorage.getItem(ENCRYPTION_KEY);
  const noUser = ref(false);

  // Create user
  const createUser = useAsyncState(async () => {
    if (!wallet.value || !api.value) return;
    return await api.value.createUser();
  }, null);

  // Fetch user
  const fetchUser = useAsyncState(async () => {
    if (!wallet.value || !api.value) return;
    return await api.value.fetchUser();
  }, null);

  // Get encryption key
  const fetchEncryptionKey = useAsyncState(async () => {
    if (!wallet.value || !api.value) return;
    if (!encryptionKey) {
      const tx = await api.value.getSignTransaction();
      const signed = await wallet.value.signTransaction(tx);
      encryptionKey = bs58.encode(
        new Uint8Array(signed.signatures[0].signature!)
      );
      // Persist encryption key until the session ends
      sessionStorage.setItem(ENCRYPTION_KEY, encryptionKey);
    }
    console.log("Encryption key:", encryptionKey);
    return encryptionKey;
  }, null);

  // Automatically fetch user on wallet connection
  watchEffect(async () => {
    if (wallet.value && api.value && !firstLoad) {
      firstLoad = true;
      await fetchUser.execute();
      noUser.value = (
        (fetchUser.error.value as Error) || new Error()
      ).message.includes("Account does not exist");
    }
  });
  console.log("created api");

  return {
    fetchUser,
    createUser,
    fetchEncryptionKey,
    noUser,
    user: fetchUser.state,
  };
}

export const useUserStore = createGlobalState(() => createUserStore());
