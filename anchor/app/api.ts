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
let typeProg: Program<Soldrive>;
export type User = Awaited<ReturnType<typeof typeProg.account.user.fetch>>;
type FileRaw = Awaited<ReturnType<typeof typeProg.account.file.fetch>>;
type FolderRaw = Awaited<ReturnType<typeof typeProg.account.folder.fetch>>;
export type File = FileRaw & {
  name: Buffer;
  content: Buffer;
  access: Access;
  backend: Backend;
};
export type Folder = FolderRaw & {
  name: Buffer;
};

export type Access = "private" | "publicRead" | "publicReadWrite";
export type Backend = "solana" | "arweave";

export function getAPI(
  authority: web3.PublicKey,
  program: Program<Soldrive>,
  defaultSigners: web3.Keypair[] = []
) {
  const connection = program.provider.connection;

  // Retreive types
  async function airdrop(
    pubkey: web3.PublicKey,
    lamports: number = 2 * web3.LAMPORTS_PER_SOL
  ) {
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
    return program.account.folder.fetch(pda.publicKey) as Promise<Folder>;
  }

  async function fetchFolders(
    ids: number[] | undefined
  ): Promise<Keyed<Folder>[]> {
    if (ids == undefined)
      return program.account.folder.all() as Promise<Keyed<Folder>[]>;
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

    // Update enums
    decoded.access = parseEnum<Access>(decoded.access);
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
    const accountInfo = await program.account.file.getAccountInfo(
      pda.publicKey
    );
    return decodeFileAccount(accountInfo!, withContent);
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

  async function fetchChildren(id: number, withContent = false) {
    const folderPromise = program.account.folder.all([
      {
        memcmp: {
          offset: 8, // discriminator
          bytes: authority.toBase58(),
        },
      },
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
            offset: 8, // discriminator
            bytes: authority.toBase58(),
          },
        },
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
    return { folders: res[0] as Keyed<Folder>[], files: res[1] };
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
    folder: Folder,
    signers: web3.Keypair[] = defaultSigners
  ) {
    const userPda = await getUserPda();
    const folderPda = await getFolderPda(folder.id);
    await program.methods
      .createFolder(folder.parent, folder.name)
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
    file: File,
    maxSize: number,
    execute: boolean = true,
    signers: web3.Keypair[] = defaultSigners
  ) {
    const userPda = await getUserPda();
    const filePda = await getFilePda(file.id);
    console.log("create file", file);
    const builder = program.methods
      .createFile(
        maxSize,
        file.parent,
        file.name,
        file.fileExt,
        file.fileSize,
        { [file.access]: {} },
        { [file.backend]: {} },
        file.content
      )
      .accounts({
        user: userPda.publicKey,
        file: filePda.publicKey,
        authority: authority,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers(signers);
    if (execute) await builder.rpc();
    return builder.transaction();
  }

  async function updateFolder(
    folder: Folder,
    signers: web3.Keypair[] = defaultSigners
  ) {
    const folderPda = await getFolderPda(folder.id);
    await program.methods
      .updateFolder(folder.id, folder.parent, folder.name)
      .accounts({
        folder: folderPda.publicKey,
        authority: authority,
      })
      .signers(signers)
      .rpc();
  }

  async function updateFile(
    file: File,
    content?: Buffer, // Optional content to prevent costly tx for large files
    currentFile?: File,
    user?: User,
    signers: web3.Keypair[] = defaultSigners
  ): Promise<number> {
    const id = file.id;
    const filePda = await getFilePda(id);
    // Check if the current file has enough space
    if (!currentFile) currentFile = await fetchFile(id);
    if (currentFile.maxSize < (content?.byteLength || 0)) {
      // File needs re-creation
      if (!user) user = await fetchUser();
      const removeTx = await removeFile(id, false, signers);
      const createTx = await createFile(
        {
          ...file,
          content: content || file.content,
          id: user.fileId + 1,
        },
        content!.byteLength,
        false,
        signers
      );
      await program.provider.sendAndConfirm!(removeTx.add(createTx), signers);
      return user.fileId + 1;
    } else {
      // Update file
      await program.methods
        .updateFile(
          id,
          file.parent,
          file.name,
          file.fileExt,
          file.fileSize,
          { [file.access]: {} },
          { [file.backend]: {} },
          content || null
        )
        .accounts({
          file: filePda.publicKey,
          authority: authority,
        })
        .signers(signers)
        .rpc();
      return id;
    }
  }

  async function updateParent(
    fileIds: number[],
    folderIds: number[],
    parent: number,
    signers: web3.Keypair[] = defaultSigners
  ) {
    // Build transaction list
    const tx = [
      ...fileIds.map(async (id) => {
        const filePda = await getFilePda(id);
        return program.methods
          .updateFile(id, parent, null, null, null, null, null, null)
          .accounts({
            file: filePda.publicKey,
            authority: authority,
          })
          .signers(signers)
          .transaction();
      }),
      ...folderIds.map(async (id) => {
        const folderPda = await getFolderPda(id);
        return program.methods
          .updateFolder(id, parent, null)
          .accounts({
            folder: folderPda.publicKey,
            authority: authority,
          })
          .signers(signers)
          .transaction();
      }),
    ];
    const instructions = await Promise.all(tx);
    await program.provider.sendAll!(
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
    console.log('remove folder', id);
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
    execute: boolean = true,
    signers: web3.Keypair[] = defaultSigners
  ) {
    const userPda = await getUserPda();
    const filePda = await getFilePda(id);
    const builder = program.methods
      .removeFile(id)
      .accounts({
        user: userPda.publicKey,
        file: filePda.publicKey,
        authority: authority,
      })
      .signers(signers);
    if (execute) await builder.rpc();
    return builder.transaction();
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
    // User
    createUser,
    fetchUser,
    // Folder
    fetchFolder,
    fetchFolders,
    createFolder,
    updateFolder,
    removeFolder,
    // File
    fetchFile,
    fetchFiles,
    createFile,
    updateFile,
    removeFile,
    // Combined
    fetchChildren,
    updateParent,
    // Utils
    getSignTransaction,
  };
}
