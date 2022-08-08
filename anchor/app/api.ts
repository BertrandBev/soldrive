import { Program } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { Soldrive } from "../target/types/soldrive";
import bs58 from "bs58";
import web3 = anchor.web3;

export interface Keyed<T> {
  account: T;
  publicKey: web3.PublicKey;
}

export interface Pda {
  publicKey: web3.PublicKey;
  bump: number;
}

function u32Bytes(num: number) {
  const arr = new ArrayBuffer(4);
  const view = new DataView(arr);
  view.setUint32(0, num, true);
  return Buffer.from(arr);
}

// Extract types
const typeProg = null as Program<Soldrive>;
export type User = Awaited<ReturnType<typeof typeProg.account.user.fetch>>;
export type Folder = Awaited<ReturnType<typeof typeProg.account.folder.fetch>>;
type FileRaw = Awaited<ReturnType<typeof typeProg.account.file.fetch>>;
export type File = FileRaw & {
  content: Buffer;
  access: Access;
  backend: Backend;
};

export type Access = "private" | "publicRead" | "publicReadWrite";
export type FileType = "file" | "note";
export type Backend = "solana" | "arweave";

export function getAPI(
  authority: web3.PublicKey,
  program: Program<Soldrive>,
  defaultSigners: web3.Keypair[] = []
) {
  const connection = program.provider.connection;

  // Retreive types
  async function airdrop(pubkey: web3.PublicKey, lamports: number) {
    const sig = await connection.requestAirdrop(pubkey, lamports);
    await connection.confirmTransaction(sig);
  }

  async function getUserPda(): Promise<Pda> {
    const [publicKey, bump] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("user"), authority.toBytes()],
      program.programId
    );
    return { publicKey, bump } as Pda;
  }

  async function getFolderPda(id: number): Promise<Pda> {
    const [publicKey, bump] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("folder"), authority.toBytes(), u32Bytes(id)],
      program.programId
    );
    return { publicKey, bump } as Pda;
  }

  async function getFilePda(id: number): Promise<Pda> {
    const [publicKey, bump] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("file"), authority.toBytes(), u32Bytes(id)],
      program.programId
    );
    return { publicKey, bump } as Pda;
  }

  // Fetch

  async function fetchUser(): Promise<User> {
    const pda = await getUserPda();
    return program.account.user.fetch(pda.publicKey);
  }

  async function fetchFolder(id: number): Promise<Folder> {
    const pda = await getFolderPda(id);
    return program.account.folder.fetch(pda.publicKey);
  }

  async function fetchFolders(
    ids: number[] | undefined
  ): Promise<Keyed<Folder>[]> {
    if (ids == undefined) return program.account.folder.all();
    else {
      const pdas = await Promise.all(ids.map((id) => getFolderPda(id)));
      const addresses = pdas.map((pda) => pda.publicKey);
      const folders = await program.account.folder.fetchMultiple(addresses);
      return folders.map((folder, idx) => {
        return { account: folder, publicKey: addresses[idx] } as Keyed<Folder>;
      });
    }
  }

  function parseEnum<T extends string>(obj: { [key: string]: any }): T {
    const keys = Object.keys(obj);
    if (keys.length != 1) throw new Error("Invalid key set");
    const key = keys[0];
    return (key[0].toLowerCase() + key.slice(1)) as T;
  }

  function decodeFileAccount(
    accountInfo: web3.AccountInfo<Buffer>,
    withContent = false
  ): File {
    const decoded = program.account.file.coder.accounts.decodeUnchecked(
      "File",
      accountInfo.data
    ) as File;
    // Update access
    // const access = decoded.access;
    // Object.keys(access).forEach((key) => {
    //   const camelCase = key[0].toLowerCase() + key.slice(1);
    //   decoded.access = camelCase as Access;
    // });
    // const fileType = decoded.fileType;
    // Object.keys(fileType).forEach((key) => {
    //   const camelCase = key[0].toLowerCase() + key.slice(1);
    //   decoded.fileType = camelCase as FileType;
    // });
    // const backend = decoded.backend;
    // Object.keys(backend).forEach((key) => {
    //   const camelCase = key[0].toLowerCase() + key.slice(1);
    //   decoded.backend = camelCase as Backend;
    // });
    decoded.access = parseEnum<Access>(decoded.access);
    decoded.fileType = parseEnum<FileType>(decoded.fileType);
    decoded.backend = parseEnum<Backend>(decoded.backend);

    // Fetch content
    if (withContent) {
      decoded.content = accountInfo.data.subarray(
        accountInfo.data.length - decoded.size
      );
    }
    return decoded;
  }

  async function fetchFile(id: number, withContent = false): Promise<File> {
    const pda = await getFilePda(id);
    // TODO: Remove content fetching here if needed
    const accountInfo = await program.account.file.getAccountInfo(
      pda.publicKey
    );
    return decodeFileAccount(accountInfo, withContent);
  }

  async function fetchFiles(
    filters: web3.GetProgramAccountsFilter[] = [],
    withContent = false
  ): Promise<Keyed<File>[]> {
    // require(program.account.user.);
    const resp = await connection.getParsedProgramAccounts(program.programId, {
      commitment: connection.commitment,
      filters: [{ memcmp: program.coder.accounts.memcmp("File") }, ...filters],
    });
    return resp.map(({ pubkey, account }) => {
      return {
        publicKey: pubkey,
        account: decodeFileAccount(
          account as web3.AccountInfo<Buffer>,
          withContent
        ),
      };
    });
  }

  async function fetchChildren(
    id: number,
    withContent = false
  ): Promise<{ folders: Keyed<Folder>[]; files: Keyed<File>[] }> {
    const folderPromise = program.account.folder.all([
      {
        memcmp: {
          offset: 8 + 32 + 4 + 8, // discriminator + owner + id + created_at
          bytes: bs58.encode(u32Bytes(id)),
        },
      },
    ]);
    const filePromise = fetchFiles(
      [
        {
          memcmp: {
            offset: 8 + 32 + 4 + 8, // discriminator + owner + id + created_at
            bytes: bs58.encode(u32Bytes(id)),
          },
        },
      ],
      withContent
    );
    const res = await Promise.all([folderPromise, filePromise]);
    return { folders: res[0], files: res[1] };
  }

  // Create

  async function createUser(signers: web3.Keypair[] = defaultSigners) {
    const pda = await getUserPda();
    await program.methods
      .createUser()
      .accounts({
        user: pda.publicKey,
        authority: authority,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers(signers)
      .rpc();
  }

  async function createFolder(
    id: number,
    parent: number,
    name: string,
    signers: web3.Keypair[] = defaultSigners
  ) {
    const userPda = await getUserPda();
    const folderPda = await getFolderPda(id);
    await program.methods
      .createFolder(parent, name)
      .accounts({
        folder: folderPda.publicKey,
        user: userPda.publicKey,
        authority: authority,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers(signers)
      .rpc();
  }

  async function createFile(
    id: number,
    max_size: number,
    parent: number,
    name: string,
    fileType: FileType,
    access: Access,
    backend: Backend,
    content: Buffer,
    signers: web3.Keypair[] = defaultSigners
  ) {
    const userPda = await getUserPda();
    const filePda = await getFilePda(id);
    await program.methods
      .createFile(
        max_size,
        parent,
        name,
        { [fileType]: {} },
        { [access]: {} },
        { [backend]: {} },
        content
      )
      .accounts({
        user: userPda.publicKey,
        file: filePda.publicKey,
        authority: authority,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers(signers)
      .rpc();
  }

  // Update

  async function updateFolder(
    id: number,
    parent?: number,
    name?: string,
    signers: web3.Keypair[] = defaultSigners
  ) {
    const folderPda = await getFolderPda(id);
    await program.methods
      .updateFolder(id, parent, name)
      .accounts({
        folder: folderPda.publicKey,
        authority: authority,
      })
      .signers(signers)
      .rpc();
  }

  async function updateFile(
    id: number,
    parent?: number,
    name?: string,
    access?: Access,
    backend?: Backend,
    content?: Buffer,
    signers: web3.Keypair[] = defaultSigners
  ) {
    const filePda = await getFilePda(id);
    const accessEnum = access ? { [access]: {} } : null;
    const backendEnum = backend ? { [backend]: {} } : null;
    return program.methods
      .updateFile(id, parent, name, accessEnum, backendEnum, content)
      .accounts({
        file: filePda.publicKey,
        authority: authority,
      })
      .signers(signers)
      .rpc();
  }

  async function updateFiles(
    ids: number[],
    parent: number,
    signers: web3.Keypair[] = defaultSigners
  ) {
    const instructions = await Promise.all(
      ids.map(async (id) => {
        const filePda = await getFilePda(id);
        return program.methods
          .updateFile(id, parent, null, null, null, null)
          .accounts({
            file: filePda.publicKey,
            authority: authority,
          })
          .signers(signers)
          .transaction();
      })
    );
    await program.provider.sendAll(
      instructions.map((tx) => ({
        tx,
        signers: signers,
      }))
    );
  }

  // Remove

  async function removeFolder(
    id: number,
    signers: web3.Keypair[] = defaultSigners
  ) {
    const userPda = await getUserPda();
    const folderPda = await getFolderPda(id);
    await program.methods
      .removeFolder(id)
      .accounts({
        user: userPda.publicKey,
        folder: folderPda.publicKey,
        authority: authority,
      })
      .signers(signers)
      .rpc();
  }

  async function removeFile(
    id: number,
    signers: web3.Keypair[] = defaultSigners
  ) {
    const userPda = await getUserPda();
    const filePda = await getFilePda(id);
    await program.methods
      .removeFile(id)
      .accounts({
        user: userPda.publicKey,
        file: filePda.publicKey,
        authority: authority,
      })
      .signers(signers)
      .rpc();
  }

  async function getSignTransaction(
    signers: web3.Keypair[] = defaultSigners
  ): Promise<web3.Transaction> {
    const tx = await program.methods
      .sign()
      .accounts({
        authority: authority,
      })
      .signers(signers)
      .transaction();
    // Populated fixed blockhash
    tx.feePayer = authority;
    tx.recentBlockhash = bs58.encode(new Uint8Array(32));
    return tx;
  }

  return {
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
    removeFile,
    // Utils
    getSignTransaction,
  };
}
