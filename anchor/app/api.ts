import { Program } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { Soldrive } from "../target/types/soldrive";
import bs58 from "bs58";
import borsh from "borsh";
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
export type File = FileRaw & { content: string };

export type Access = "private" | "publicRead" | "publicReadWrite";
export type FileType = "file" | "note";

export function getAPI(authorityKp: web3.Keypair, program: Program<Soldrive>) {
  const authority = authorityKp.publicKey;
  const connection = program.provider.connection;

  // Retreive types
  async function airdrop(pubkey: web3.PublicKey, lamports: number) {
    await connection
      .requestAirdrop(pubkey, lamports)
      .then((sig) => connection.confirmTransaction(sig));
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

  async function fetchFolders(): Promise<Keyed<Folder>[]> {
    return program.account.folder.all();
  }

  function decodeFileAccount(
    accountInfo: web3.AccountInfo<Buffer>,
    withContent = false
  ): File {
    const decoded = program.account.file.coder.accounts.decodeUnchecked(
      "File",
      accountInfo.data
    ) as File;
    if (withContent) {
      decoded.content = accountInfo.data
        .subarray(accountInfo.data.length - decoded.size)
        .toString("utf-8");
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
          offset: 8 + 4 + 8, // discriminator + id + created_at
          bytes: bs58.encode(u32Bytes(id)),
        },
      },
    ]);
    const filePromise = fetchFiles(
      [
        {
          memcmp: {
            offset: 8 + 4 + 8, // discriminator + id + created_at
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

  async function createUser(signers: web3.Keypair[] = [authorityKp]) {
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
    signers: web3.Keypair[] = [authorityKp]
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
    content: string,
    signers: web3.Keypair[] = [authorityKp]
  ) {
    const userPda = await getUserPda();
    const filePda = await getFilePda(id);
    const val = Buffer.from(content, "utf8");
    await program.methods
      .createFile(
        max_size,
        parent,
        name,
        { [fileType]: {} },
        { [access]: {} },
        val
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
    parent: number | null,
    name: string | null,
    signers: web3.Keypair[] = [authorityKp]
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
    parent: number | null,
    name: string | null,
    access: Access | null,
    content: string | null,
    signers: web3.Keypair[] = [authorityKp]
  ) {
    const filePda = await getFilePda(id);
    const accessEnum = access ? { [access]: {} } : null;
    const contentBuf = content ? Buffer.from(content, "utf8") : null;
    return program.methods
      .updateFile(id, parent, name, accessEnum, contentBuf)
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
    signers: web3.Keypair[] = [authorityKp]
  ) {
    const instructions = await Promise.all(
      ids.map(async (id) => {
        const filePda = await getFilePda(id);
        return program.methods
          .updateFile(id, parent, null, null, null)
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
    signers: web3.Keypair[] = [authorityKp]
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
  };
}
