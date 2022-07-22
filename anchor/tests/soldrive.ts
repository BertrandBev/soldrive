import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Soldrive } from "../target/types/soldrive";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import * as assert from "assert";
import web3 = anchor.web3;

import { Pda, User, Folder, File, getAPI } from "../app/api";

// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());
const program = anchor.workspace.Soldrive as Program<Soldrive>;
const provider = program.provider as anchor.AnchorProvider;
const connection = provider.connection;

// Generate users
const user = web3.Keypair.generate();
const other_user = web3.Keypair.generate();

const {
  airdrop,
  getUserPda,
  getFolderPda,
  getFilePda,
  // Fetch
  fetchUser,
  fetchFolder,
  fetchFolders,
  fetchFile,
  fetchFiles,
  fetchChildren,
  // Create
  createUser,
  createFolder,
  createFile,
} = getAPI(user, program);

function stripBn(obj) {
  Object.keys(obj).forEach((key) => {
    // console.log('key', key, 'instance', obj[key] instanceof anchor.BN);
    if (obj[key] instanceof anchor.BN) obj[key] = obj[key].toNumber();
    if (obj[key] instanceof web3.PublicKey) obj[key] = obj[key].toBase58();
  });
  return obj;
}

describe("soldrive", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  it("setup", async () => {
    await airdrop(user.publicKey, 10 * LAMPORTS_PER_SOL);
  });

  it("create users", async () => {
    await createUser();
    const userRetrieved = await fetchUser();
    assert.equal(userRetrieved.encryption, true);
    assert.equal(userRetrieved.fileCount, 0);
    assert.equal(userRetrieved.fileId, 0);
    assert.equal(userRetrieved.folderCount, 0);
    assert.equal(userRetrieved.folderId, 0);
    assert.equal(userRetrieved.spaceUsed, 0);
  });

  it("create folder", async () => {
    await createFolder(1, 0, "folder");
    const folderRetrieved = await fetchFolder(1);
    console.log(folderRetrieved);

  });
});
