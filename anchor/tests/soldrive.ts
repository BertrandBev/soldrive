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
  updateParent,
  // Remove
  removeFolder,
} = getAPI(user.publicKey, program, [user]);

function stripBn(obj) {
  Object.keys(obj).forEach((key) => {
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

  it("create folder", async () => {
    const id = 1;
    const name = "folder";
    await createFolder({ id, parent: 0, name: Buffer.from(name) } as Folder);
    const folder = await fetchFolder(id);
    assert.equal(folder.id, id);
    assert.equal(folder.parent, 0);
    assert.equal(folder.name.toString(), "folder");
    const user = await fetchUser();
    assert.equal(user.folderCount, 1);
    assert.equal(user.folderId, 1);
  });

  it("update folder", async () => {
    const id = 1;
    const name = "folder_1";
    await updateFolder({ id, parent: 2, name: Buffer.from(name) } as Folder);
    let folder = await fetchFolder(id);
    assert.equal(folder.parent, 2);
    assert.equal(folder.name.toString(), Buffer.from("folder_1"));
  });

  it("create file", async () => {
    const id = 1;
    const parent = 1;
    const name = "my file";
    const content = Buffer.from("some content");
    const maxSize = 2 * content.length;
    await createFile(
      {
        id,
        parent,
        name: Buffer.from(name),
        fileExt: "txt",
        fileSize: new anchor.BN(content.length),
        backend: "solana",
        access: "private",
        content,
      } as File,
      maxSize
    );
    const file = await fetchFile(id, true);
    assert.equal(file.id, id);
    assert.equal(file.parent, parent);
    assert.equal(file.name.toString(), name);
    assert.equal(file.fileExt, "txt");
    assert.equal(file.fileSize.toNumber(), content.length);
    assert.equal(file.access, "private");
    assert.equal(file.backend, "solana");
    assert.equal(file.content.toString(), content.toString());
    assert.equal(file.size, content.length);
    assert.equal(file.maxSize, maxSize);

    const user = await fetchUser();
    assert.equal(user.fileCount, 1);
    assert.equal(user.fileId, id);
    assert.equal(user.spaceUsed, maxSize);
  });

  it("updates file", async () => {
    let id = 1;
    let currentFile = await fetchFile(id, true);
    const parent = 2;
    const name = "my file 2";
    let content = Buffer.from("some content" + "some content"); // Up to 2x the size
    id = await updateFile(
      {
        ...currentFile,
        parent,
        name: Buffer.from(name),
        access: "publicRead",
        backend: "arweave",
      } as File,
      content
    );
    assert.equal(id, 1);

    let file = await fetchFile(id, true);
    assert.equal(file.id, id);
    assert.equal(file.name.toString(), name);
    assert.equal(file.parent, parent);
    assert.equal(file.access, "publicRead");
    assert.equal(file.backend, "arweave");
    assert.equal(file.content.toString(), content.toString());
    assert.equal(file.size, content.length);

    // Now overflow content
    content = Buffer.from("some content" + "some contents");
    id = await updateFile(file, content);
    file = await fetchFile(id, true);
    assert.equal(id, 2);
    assert.equal(file.id, id);
    assert.equal(file.parent, parent);
    assert.equal(file.access, "publicRead");
    assert.equal(file.backend, "arweave");
    assert.equal(file.content.toString(), content.toString());
    assert.equal(file.size, content.length);
  });

  it("update multiple files", async () => {
    // Create a second file
    const id = 3;
    const parent = 1;
    const name = "second file";
    const content = Buffer.from("some content");
    const maxSize = 2 * content.length;
    await createFile(
      {
        id,
        parent,
        name: Buffer.from(name),
        fileExt: "txt",
        fileSize: new anchor.BN(content.length),
        access: "private",
        backend: "solana",
        content: Buffer.from(content),
      } as File,
      maxSize
    );

    // Now update parents
    await updateParent([2, 3], [], 2);

    // And retrieve all files
    const firstChildren = await fetchChildren(1, true);
    assert.equal(firstChildren.files.length, 0);
    const secondChildren = await fetchChildren(2, true);
    assert.equal(secondChildren.files.length, 2);
  });
});
