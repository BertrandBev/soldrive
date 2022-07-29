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
  // Update
  updateFolder,
  updateFile,
  updateFiles,
  // Remove
  removeFolder,
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
    const user = await fetchUser();
    assert.equal(user.encryption, true);
    assert.equal(user.fileCount, 0);
    assert.equal(user.fileId, 0);
    assert.equal(user.folderCount, 0);
    assert.equal(user.folderId, 0);
    assert.equal(user.spaceUsed, 0);
  });

  // it("create folder", async () => {
  //   const id = 1;
  //   await createFolder(id, 0, "folder");
  //   const folder = await fetchFolder(id);
  //   assert.equal(folder.id, id);
  //   assert.equal(folder.parent, 0);
  //   assert.equal(folder.name, "folder");
  //   const user = await fetchUser();
  //   assert.equal(user.folderCount, 1);
  //   assert.equal(user.folderId, 1);
  // });

  // it("update folder", async () => {
  //   const id = 1;
  //   await updateFolder(id, 1, null);
  //   let folder = await fetchFolder(id);
  //   assert.equal(folder.parent, 1);
  //   await updateFolder(id, null, "folder_1");
  //   folder = await fetchFolder(id);
  //   assert.equal(folder.name, "folder_1");
  // });

  it("create file", async () => {
    const id = 1;
    const parent = 1;
    const name = "my file";
    const content = "some content";
    const maxSize = 2 * content.length;
    await createFile(id, maxSize, parent, name, "file", "private", content);
    const file = await fetchFile(id, true);
    console.log("file", file);
    assert.equal(file.id, id);
    assert.equal(file.parent, parent);
    assert.equal(file.name, name);
    assert.ok(file.fileType["file"]);
    assert.ok(file.access["private"]);
    assert.equal(file.content, content);
    assert.equal(file.size, content.length);

    const user = await fetchUser();
    assert.equal(user.fileCount, 1);
    assert.equal(user.fileId, id);
    assert.equal(user.spaceUsed, maxSize);
  });

  it("updates file", async () => {
    const id = 1;
    const parent = 2;
    const name = "my file 2";
    const content = "some content" + "some content"; // Up to 2x the size
    await updateFile(id, parent, null, null, null);
    await updateFile(id, null, name, null, null);
    await updateFile(id, null, null, "publicRead", null);
    await updateFile(id, null, null, null, content);

    const file = await fetchFile(id, true);
    console.log("file", file);
    assert.equal(file.id, id);
    assert.equal(file.parent, parent);
    assert.ok(file.access["publicRead"]);
    assert.equal(file.content, content);
    assert.equal(file.size, content.length);
  });

  it("update multiple files", async () => {
    // Create a second file
    const id = 2;
    const parent = 1;
    const name = "second file";
    const content = "some content";
    const maxSize = 2 * content.length;
    await createFile(id, maxSize, parent, name, "file", "private", content);

    // Now update parents
    await updateFiles([1, 2], 2);

    // And retrieve all files
    const firstChildren = await fetchChildren(2, true);
    assert.equal(firstChildren.files.length, 0);
    const secondChildren = await fetchChildren(2, true);
    assert.equal(secondChildren.files.length, 2);
  });

  it("moves files & folders", async () => {
    //
  });

  // Move at the end
  // it("remove folder", async () => {
  //   const id = 1;
  //   await removeFolder(id);
  //   const folders = await fetchFolders();
  //   assert.equal(folders.length, 0);
  //   const user = await fetchUser();
  //   assert.equal(user.folderCount, 0);
  // });
});
