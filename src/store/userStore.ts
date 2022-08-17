import { createGlobalState, useAsyncState } from "@vueuse/core";
import { ref, watchEffect, computed } from "vue";
import { useChainApi } from "../api/chainApi";
import bs58 from "bs58";

const ENCRYPTION_KEY = "encryptionKey";

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
    async (createTx = true) => {
      if (!wallet.value || !api.value) return;
      let encryptionKey = sessionStorage.getItem(ENCRYPTION_KEY);
      // Create transaction
      if (!encryptionKey && createTx) {
        const tx = await api.value.getSignTransaction();
        const signed = await wallet.value.signTransaction(tx);
        const keyBuf = new Uint8Array(signed.signatures[0].signature!);
        encryptionKey = bs58.encode(keyBuf);
        // Persist encryption key until the session ends
        sessionStorage.setItem(ENCRYPTION_KEY, encryptionKey);
      }
      // Derive keys
      if (encryptionKey) {
        const keyBuf = bs58.decode(encryptionKey);
        const derived = await deriveKey(keyBuf);
        const empty = await deriveKey(Buffer.from(""));
        return { key: derived, empty };
      }
    },
    null,
    { immediate: false }
  );

  // Fetch user
  const fetchUser = useAsyncState(
    async () => {
      if (!wallet.value || !api.value) return;
      const user = await api.value.fetchUser();
      await fetchEncryptionKey.execute(0, false);
      return user;
    },
    null,
    { immediate: false }
  );

  async function deriveKey(key: BufferSource) {
    const subtle = window.crypto.subtle;
    const salt = Buffer.from("");
    const keyMaterial = await subtle.importKey("raw", key, "PBKDF2", false, [
      "deriveBits",
      "deriveKey",
    ]);
    return await subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 1e5,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  async function encrypt(msg: ArrayBufferLike, encrypt: boolean) {
    const key = fetchEncryptionKey.state.value;
    if (!key) throw new Error("The encryption key not loaded");
    const subtle = window.crypto.subtle;
    let iv = window.crypto.getRandomValues(new Uint8Array(12));
    const buf = (await subtle.encrypt(
      { name: "AES-GCM", iv },
      encrypt ? key.key : key.empty,
      msg
    )) as ArrayBuffer;
    return Buffer.concat([iv, new Uint8Array(buf)]);
  }

  async function decrypt(buf: ArrayBuffer, encrypt: boolean) {
    const u8 = new Uint8Array(buf);
    const iv = u8.slice(0, 12);
    const data = u8.slice(12);
    const key = fetchEncryptionKey.state.value;
    if (!key) throw new Error("The encryption key not loaded");
    const subtle = window.crypto.subtle;
    return (await subtle.decrypt(
      { name: "AES-GCM", iv },
      encrypt ? key.key : key.empty,
      data
    )) as ArrayBuffer;
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
