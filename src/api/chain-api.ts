import { ref, computed, watch, Ref } from "vue";
import { useWallet, AnchorWallet } from "solana-wallets-vue";
import { BaseSolletWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { createGlobalState } from "@vueuse/core";
import nacl from "tweetnacl";
import * as anchor from "@project-serum/anchor";
import web3 = anchor.web3;

// Buffer polyfill
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

// Import solana program
import idl from "../../anchor/target/idl/soldrive.json";
import { Soldrive } from "../../anchor/target/types/soldrive";
// eslint-disable-next-line
import * as solApi from "../../anchor/app/api";
import { createCache } from "./cache";
const address = "5QEzcF7HPx6z3oN4Fu8cqxGr99oUEGS4uE4MrazyjstF";

// Config
const LOCAL_WALLET = import.meta.env.DEV && true;
const LOCAL_CLUSTER = import.meta.env.DEV && true;
const AIRDROP = import.meta.env.DEV && true;

// Config
const AIRDROP_LAMPORTS = 1e9;
import id from "/Users/bbev/.config/solana/id.json";
const keypair = web3.Keypair.fromSecretKey(Uint8Array.from(id as number[]));

const clusterUrl = LOCAL_CLUSTER
  ? "http://127.0.0.1:8899"
  : web3.clusterApiUrl("mainnet-beta", false);
const preflightCommitment = "processed";
const commitment = "processed";
const programID = new PublicKey(address);

// Re-export types
export type Keyed<T> = solApi.Keyed<T>;
export type File = solApi.File & { nameStr: string };
export type Folder = solApi.Folder & { nameStr: string };
export type User = solApi.User;
export type Access = solApi.Access;
export type Backend = solApi.Backend;

export function useAnchorWallet() {
  // Overrides useAnchorWallet.ts with signMessage
  const walletStore = useWallet();
  return computed(() => {
    if (!walletStore) return;
    const { signMessage, signTransaction, signAllTransactions, publicKey } =
      walletStore;
    if (
      !publicKey.value ||
      !signTransaction.value ||
      !signAllTransactions.value ||
      !signMessage.value
    )
      return;

    return {
      publicKey: publicKey.value,
      signTransaction: signTransaction.value,
      signAllTransactions: signAllTransactions.value,
      signMessage: signMessage.value,
    };
  });
}

export function useAnchorProvider(
  connection: Connection,
  wallet: Ref<AnchorWallet | undefined>
) {
  return computed(() => {
    if (wallet.value) {
      return new AnchorProvider(connection, wallet.value!, {
        preflightCommitment,
        commitment,
      });
    }
    return null;
  });
}

export function _createChainAPI() {
  const wallet = LOCAL_WALLET
    ? // Local keypair wallet
      ref({
        publicKey: keypair.publicKey,
        signTransaction: async (tx: web3.Transaction) => {
          await tx.sign(keypair);
          return tx;
        },
        signAllTransactions: async (txs: web3.Transaction[]) => {
          txs.forEach((tx) => tx.sign(keypair));
          return txs;
        },
        signMessage: async (msg: Uint8Array) => {
          return nacl.sign.detached(msg, keypair.secretKey);
        },
      })
    : useAnchorWallet();

  // useWallet().wallet;
  const connection = new Connection(clusterUrl, commitment);
  const provider = useAnchorProvider(connection, wallet);

  const program = computed(() =>
    provider.value
      ? // @ts-ignore
        (new Program(idl, programID, provider.value) as Program<Rental>)
      : null
  );

  const api = computed(() => {
    // Create api & extend it with cache
    if (!program.value || !wallet.value?.publicKey) return null;
    const api = solApi.getAPI(
      wallet.value.publicKey,
      program.value,
      LOCAL_WALLET ? [keypair] : []
    );
    return createCache(api);
  });

  // Airdrop if needed
  let airdropped = false;
  if (AIRDROP) {
    watch(
      [wallet],
      async () => {
        if (wallet.value && !airdropped) {
          airdropped = true;
          const balance = await connection.getBalance(wallet.value.publicKey);
          console.log("Balance:", Math.round(balance / 1e9), "SOL");
          if (balance < AIRDROP_LAMPORTS) {
            await api.value?.airdrop(keypair.publicKey, AIRDROP_LAMPORTS);
            console.log("Funds airdropped");
          }
        }
      },
      { immediate: true }
    );
  }

  //
  return {
    wallet,
    provider,
    connection,
    api,
  };
}

export const useChainApi = createGlobalState(() => _createChainAPI());
