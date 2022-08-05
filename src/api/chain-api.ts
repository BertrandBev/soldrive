import { ref, computed, watchEffect } from "vue";
import { useAnchorWallet } from "solana-wallets-vue";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { createGlobalState } from "@vueuse/core";
import * as anchor from "@project-serum/anchor";
import web3 = anchor.web3;
// Import solana program
import idl from "../../anchor/target/idl/soldrive.json";
import { Soldrive } from "../../anchor/target/types/soldrive";
// eslint-disable-next-line
import * as solApi from "../../anchor/app/api";
import { createCache } from "./cache";
const address = "5QEzcF7HPx6z3oN4Fu8cqxGr99oUEGS4uE4MrazyjstF";

// Import key for dev
const LOCAL_WALLET = true;
const AIRDROP = true;
const AIRDROP_LAMPORTS = 1e9;
import id from "/Users/bbev/.config/solana/id.json";
const keypair = web3.Keypair.fromSecretKey(Uint8Array.from(id as number[]));

const clusterUrl = "http://127.0.0.1:8899";
const preflightCommitment = "processed";
const commitment = "processed";
const programID = new PublicKey(address);

// Re-export types
export type Keyed<T> = solApi.Keyed<T>;
export type File = solApi.File;
export type Folder = solApi.Folder;
export type User = solApi.User;
export type FileType = solApi.FileType;
export type Access = solApi.Access;

export function _createChainAPI() {
  const wallet = LOCAL_WALLET
    ? ref({
        publicKey: keypair.publicKey,
        signTransaction: async (tx: web3.Transaction) => {
          await tx.sign(keypair);
          return tx;
        },
        signAllTransactions: async (txs: web3.Transaction[]) => {
          txs.forEach((tx) => tx.sign(keypair));
          return txs;
        },
      })
    : useAnchorWallet();
  const connection = new Connection(clusterUrl, commitment);
  const provider = computed(() => {
    if (wallet.value) {
      return new AnchorProvider(connection, wallet.value, {
        preflightCommitment,
        commitment,
      });
    }
    return null;
  });

  const program = computed(() =>
    provider.value
      ? // @ts-ignore
        (new Program(idl, programID, provider.value) as Program<Rental>)
      : null
  );

  const api = computed(() => {
    // Create api & extend it with cache
    if (program.value && wallet.value?.publicKey) {
      const api = solApi.getAPI(
        wallet.value.publicKey,
        program.value,
        LOCAL_WALLET ? [keypair] : []
      );
      return createCache(api);
    } else {
      return null;
    }
  });

  // Airdrop if needed
  let airdropped = false;
  if (AIRDROP) {
    watchEffect(async () => {
      if (wallet.value && !airdropped) {
        airdropped = true;
        const balance = await connection.getBalance(wallet.value.publicKey);
        console.log("Balance:", Math.round(balance / 1e9), "SOL");
        if (balance < AIRDROP_LAMPORTS) {
          await api.value?.airdrop(keypair.publicKey, AIRDROP_LAMPORTS);
          console.log("Funds airdropped");
        }
      }
    });
  }

  //
  return {
    wallet,
    connection,
    api,
  };
}

export const useChainApi = createGlobalState(() => _createChainAPI());
