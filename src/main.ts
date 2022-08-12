import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import Toast, { PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

// Wallets
import SolanaWallets from "solana-wallets-vue";
import "solana-wallets-vue/styles.css";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
    new SlopeWalletAdapter(),
    new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
  ],
  autoConnect: true,
};

const toastOptions = {
  timeout: 5000,
  position: POSITION.BOTTOM_CENTER,
  maxToasts: 2,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  filterBeforeCreate: (toast, list) => {
    const msg = toast.content.toString();
    const some = list.some((sub) => {
      return sub.content.toString() == msg;
    });
    return some ? false : toast;
  },
} as PluginOptions;

const app = createApp(App);
app.use(SolanaWallets, walletOptions);
app.use(router);
app.use(Toast, toastOptions);
app.mount("#app");
