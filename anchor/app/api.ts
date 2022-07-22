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

// Extract types
const typeProg = null as Program<Soldrive>;
export type User = Awaited<ReturnType<typeof typeProg.account.user.fetch>>;
export type Folder = Awaited<ReturnType<typeof typeProg.account.folder.fetch>>;
export type File = Awaited<ReturnType<typeof typeProg.account.file.fetch>>;

export function getAPI(authorityKp: web3.Keypair, program: Program<Soldrive>) {
  const authority = authorityKp.publicKey;

  // Retreive types
  async function airdrop(pubkey: web3.PublicKey, lamports: number) {
    await program.provider.connection
      .requestAirdrop(pubkey, lamports)
      .then((sig) => program.provider.connection.confirmTransaction(sig));
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
      [Buffer.from("folder"), authority.toBytes(), new Uint8Array([id])],
      program.programId
    );
    return { publicKey, bump } as Pda;
  }

  async function getFilePda(id: number): Promise<Pda> {
    const [publicKey, bump] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("file"), authority.toBytes(), new Uint8Array([id])],
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

  async function fetchFolders(): Promise<Folder[]> {
    return program.account.folder.all() as any;
  }

  async function fetchFile(id: number): Promise<File> {
    const pda = await getFilePda(id);
    return program.account.file.fetch(pda.publicKey);
  }

  async function fetchFiles(): Promise<File[]> {
    return program.account.file.all() as any;
  }

  async function fetchChildren(
    id: number
  ): Promise<{ folders: Folder[]; files: File[] }> {
    const folderPromise = program.account.folder.all([
      {
        memcmp: {
          offset: 8 + 4 + 8, // discriminator + id + created_at
          bytes: bs58.encode(new Uint8Array([id])),
        },
      },
    ]);
    const filePromise = program.account.file.all([
      {
        memcmp: {
          offset: 8 + 4 + 8, // discriminator + id + created_at
          bytes: bs58.encode(new Uint8Array([id])),
        },
      },
    ]);
    return Promise.all([folderPromise, filePromise]) as any;
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
    parent: number,
    size: number,
    access: any,
    fileType: any,
    content: string,
    signers: web3.Keypair[] = [authorityKp]
  ) {
    const userPda = await getUserPda();
    const filePda = await getFilePda(id);
    await program.methods
      .createFile(parent, size, access, fileType, content)
      .accounts({
        user: userPda.publicKey,
        file: filePda.publicKey,
        authority: authority,
        systemProgram: web3.SystemProgram.programId,
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
  };
}
