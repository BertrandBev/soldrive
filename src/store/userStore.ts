import { createGlobalState, useAsyncState } from "@vueuse/core";
import { ref, watchEffect, computed } from "vue";
import { useChainApi } from "../api/chain-api";
import axios from "axios";
import CryptoJS from "crypto-js";
import bs58 from "bs58";

const ENCRYPTION_KEY = "encryptionKey";

function createEncryptionTransaction() {}

export enum AuthState {
  NO_USER,
  LOGGED_OUT,
  NO_ENCRYPTION,
  LOGGED_IN,
}

function createUserStore() {
  const { api, wallet } = useChainApi();

  //
  let firstLoad = false;
  let encryptionKey: string | null = sessionStorage.getItem(ENCRYPTION_KEY);
  const noUser = ref(false);

  // Create user
  const createUser = useAsyncState(
    async () => {
      if (!wallet.value || !api.value) return;
      return await api.value.createUser();
    },
    null,
    { immediate: false }
  );

  // Get encryption key
  const fetchEncryptionKey = useAsyncState(
    async () => {
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
    },
    null,
    { immediate: false }
  );

  // Fetch user
  const fetchUser = useAsyncState(
    async () => {
      if (!wallet.value || !api.value) return;
      const user = await api.value.fetchUser();
      if (encryptionKey) await fetchEncryptionKey.execute();
      return user;
    },
    null,
    { immediate: false }
  );

  function encrypt(msg: string, encrypt: boolean) {
    if (!encryptionKey) throw new Error("Encryption key not loaded");
    const b64 = CryptoJS.AES.encrypt(
      msg,
      encrypt ? encryptionKey : ""
    ).toString();
    const buf = Buffer.from(b64, "base64");
    console.log(`b64 length: ${b64.length} buf ${buf.length}`);
    return buf;
  }

  function decrypt(buf: Buffer, encrypt: boolean) {
    if (!encryptionKey) throw new Error("Encryption key not loaded");
    const b64 = buf.toString("base64");
    return CryptoJS.AES.decrypt(b64, encrypt ? encryptionKey : "").toString(
      CryptoJS.enc.Utf8
    );
  }

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

  const authState = computed(() => {
    if (noUser.value) return AuthState.NO_USER;
    else if (!fetchUser.state.value) return AuthState.LOGGED_OUT;
    else if (!fetchEncryptionKey.state.value) return AuthState.NO_ENCRYPTION;
    else return AuthState.LOGGED_IN;
  });

  const isLoggedIn = computed(() => {
    return authState.value == AuthState.LOGGED_IN;
  });

  return {
    fetchUser,
    createUser,
    fetchEncryptionKey,
    noUser,
    user: fetchUser.state,
    authState,
    isLoggedIn,
    encrypt,
    decrypt,
  };
}

export const useUserStore = createGlobalState(() => createUserStore());
