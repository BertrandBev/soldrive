<script setup lang="ts">
import {
  LoginIcon,
  LogoutIcon,
  UserAddIcon,
  UserIcon,
} from "@heroicons/vue/outline";
import { useRoute } from "vue-router";
import { useUserStore, AuthState } from "../store/userStore";
import { ref, computed, watch } from "vue";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";

const toast = useToast();
const router = useRouter();
const route = useRoute();

const { user, noUser, createUser, fetchUser, fetchEncryptionKey, authState } =
  useUserStore();

const createUserModal = ref(false);
const encryptionModal = ref(false);

const isLoading = computed(
  () =>
    createUser.isLoading.value ||
    fetchUser.isLoading.value ||
    fetchEncryptionKey.isLoading.value
);

// Control flow
watch(
  [authState],
  () => {
    if (authState.value == AuthState.NO_USER && !fetchUser.isLoading.value) {
      // Create user
      createUserModal.value = true;
    } else if (
      authState.value == AuthState.NO_ENCRYPTION &&
      !fetchUser.isLoading.value
    ) {
      // Create key
      encryptionModal.value = true;
    } else if (authState.value == AuthState.LOGGED_IN && route.path == "/") {
      // Auto nav to explorer
      router.push({ path: "/explorer" });
    }
  },
  { immediate: true }
);

const authStr = computed(() => {
  switch (authState.value) {
    case AuthState.NO_USER:
      return "Sign up";
    case AuthState.LOGGED_OUT:
    case AuthState.NO_ENCRYPTION:
      return "Login";
    case AuthState.LOGGED_IN:
      return "Account";
  }
});

function auth() {
  if (isLoading.value) return;
  switch (authState.value) {
    case AuthState.NO_USER:
      createUserModal.value = true;
      break;
    case AuthState.LOGGED_OUT:
      fetchUser.execute();
      break;
    case AuthState.NO_ENCRYPTION:
      encryptionModal.value = true;
      break;
    case AuthState.LOGGED_IN:
      router.push({ path: "/account" });
      break;
  }
}

async function createUserFromModal() {
  createUserModal.value = false;
  await createUser.execute();
  // TODO: extract in a function
  if (createUser.error.value) {
    console.log("Create user error", createUser.error.value);
    let msg = (createUser.error.value as Error).message as string;
    if (
      msg.includes("no record of a prior credit") ||
      msg.includes("custom program error: 0x1")
    ) {
      msg =
        "Insufficient funds. If on devnet, consider Airdropping some using the button on the top bar";
    }
    toast.error(msg);
  }
}

async function fetchEncryptionFromModal() {
  encryptionModal.value = false;
  await fetchEncryptionKey.execute();
  if (fetchEncryptionKey.error.value) {
    console.log("Fetch encryption error", fetchEncryptionKey.error.value);
    const msg = (fetchEncryptionKey.error.value as Error).message as string;
    toast.error(msg);
  }
}
</script>

<template>
  <div>
    <!-- Auth button -->
    <button
      v-if="authState != AuthState.NO_WALLET"
      class="btn btn-ghost gap-2 ml-2"
      :class="{ loading: isLoading }"
      @click="auth"
    >
      <UserAddIcon
        v-if="authState == AuthState.NO_USER"
        class="w-5 h-5"
      ></UserAddIcon>
      <LoginIcon
        v-else-if="
          authState == AuthState.LOGGED_OUT ||
          authState == AuthState.NO_ENCRYPTION
        "
        class="w-5 h-5"
      ></LoginIcon>
      <UserIcon v-else class="w-5 h-5"></UserIcon>
      {{ authStr }}
    </button>
  </div>
  <!-- Account creation modal -->
  <div class="modal" :class="{ 'modal-open': createUserModal }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Welcome to SolDrive!</h3>
      <p class="py-2">
        Create a new account to start storing your notes & files
      </p>
      <div class="modal-action">
        <div class="btn" @click="() => (createUserModal = false)">Cancel</div>
        <div class="btn" @click="createUserFromModal">Create</div>
      </div>
    </div>
  </div>
  <!-- Encryption modal modal -->
  <div class="modal" :class="{ 'modal-open': encryptionModal }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Encryption key generation</h3>
      <p class="py-2">
        Sign an offline transaction to retrieve your encryption key. This
        transaction won't be commited to the blockchain
      </p>
      <div class="modal-action">
        <div class="btn" @click="fetchEncryptionFromModal">Ok</div>
      </div>
    </div>
  </div>
</template>
