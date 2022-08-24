import { createGlobalState, useAsyncState } from "@vueuse/core";
import { ref, watch, computed } from "vue";
import { useChainApi, User } from "../api/chainApi";
import { useRouter, useRoute } from "vue-router";
import bs58 from "bs58";

const ENCRYPTION_KEY = "encryptionKey";

export enum AuthState {
  NO_WALLET,
  NO_USER,
  LOGGED_OUT,
  NO_ENCRYPTION,
  LOGGED_IN,
}

function createUserStore() {
  const { api, wallet } = useChainApi();

  //
  const noUser = ref(false);

  // Get encryption key
  const fetchEncryptionKey = useAsyncState(
    async (createTx = true) => {
      if (!wallet.value || !api.value) return;
      const itemKey = ENCRYPTION_KEY + " " + wallet.value.publicKey.toBase58();
      let encryptionKey = sessionStorage.getItem(itemKey);
      // Create transaction
      if (!encryptionKey && createTx) {
        const tx = await api.value.getSignTransaction();
        const signed = await wallet.value.signTransaction(tx);
        const keyBuf = new Uint8Array(signed.signatures[0].signature!);
        encryptionKey = bs58.encode(keyBuf);
        // Persist encryption key until the session ends
        sessionStorage.setItem(itemKey, encryptionKey);
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
      let user: User | undefined = undefined;
      try {
        user = await api.value.fetchUser();
      } catch (e) {
        const msg = (e as Error).message as string;
        noUser.value = msg.includes("Account does not exist");
        throw e;
      }
      noUser.value = false;
      await fetchEncryptionKey.execute(0, false);
      return user;
    },
    null,
    { immediate: false, onError: (e) => console.error("Fetch user error", e) }
  );

  // Create user
  const createUser = useAsyncState(
    async () => {
      if (!wallet.value || !api.value) return;
      await api.value.createUser();
      await fetchUser.execute();
    },
    null,
    { immediate: false, onError: (e) => console.error("Create user error", e) }
  );

  // Automatically fetch user on wallet
  watch(
    [wallet],
    async () => {
      if (wallet.value && api.value) await fetchUser.execute();
    },
    { immediate: true }
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
    if (!buf) return buf;
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

  const authState = computed(() => {
    if (!wallet.value) return AuthState.NO_WALLET;
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
