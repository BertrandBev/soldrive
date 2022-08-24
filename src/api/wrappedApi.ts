// Implements an account cache to speed up lookups

import { createGlobalState } from "@vueuse/core";
import { computed } from "vue";
import * as solApi from "../../anchor/app/api";
import { useChainApi } from "./chainApi";
import { useUserStore } from "../store/userStore";
import * as anchor from "@project-serum/anchor";

type SolApi = ReturnType<typeof solApi.getAPI>;

// Re-export types
type Keyed<T> = solApi.Keyed<T>;
export type File = Omit<Omit<solApi.File, "name">, "content"> & {
  name: string;
  content: ArrayBuffer;
};
export type Folder = Omit<solApi.Folder, "name"> & { name: string };

// File & folders cache
let folders: { [key: number]: Keyed<solApi.Folder> } = {};
let files: { [key: number]: Keyed<solApi.File> } = {};

function createCache(api: SolApi): SolApi {
  // Wrap account lookups in cache
  const fetchFolders = api.fetchFolders;
  api.fetchFolders = async (ids: number[] | undefined) => {
    if (ids == undefined) return fetchFolders(ids);
    else {
      const fetchIds = ids.filter((id) => !folders[id]);
      const fetched = await fetchFolders(fetchIds);
      fetched.forEach((folder) => (folders[folder.account.id] = folder));
      return ids.map((id) => folders[id]);
    }
  };

  const updateFolders = api.updateFolder;
  api.updateFolder = async (folder: solApi.Folder, ...args) => {
    delete folders[folder.id];
    return updateFolders(folder, ...args);
  };

  const removeFolder = api.removeFolder;
  api.removeFolder = async (id: number, ...args) => {
    delete folders[id];
    return removeFolder(id, ...args);
  };

  // File
  const fetchFile = api.fetchFile;
  api.fetchFile = async (id: number, ...args) => {
    if (!files[id]) {
      const pda = await api.getFilePda(id);
      const file = await fetchFile(id, ...args);
      files[id] = { publicKey: pda.publicKey, account: file };
    }
    return files[id].account;
  };

  const updateFile = api.updateFile;
  api.updateFile = async (file: solApi.File, ...args) => {
    delete files[file.id];
    return updateFile(file, ...args);
  };

  const removeFile = api.removeFile;
  api.removeFile = async (id: number, ...args) => {
    delete files[id];
    return removeFile(id, ...args);
  };

  return api;
}

function createWrappedApi() {
  // Wrap functions for encryption & decryption
  const { api: chainApi } = useChainApi();
  const { isLoggedIn, encrypt, decrypt } = useUserStore();
  return computed(() => {
    if (!chainApi.value || !isLoggedIn.value) return null;
    const api = createCache(chainApi.value);

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    async function encryptStr(str: string, encrypted: boolean) {
      const buf = encoder.encode(str);
      return await encrypt(buf, encrypted);
    }

    async function decryptStr(buf: Buffer, encrypted: boolean) {
      const dec = await decrypt(buf, encrypted);
      return decoder.decode(dec);
    }

    async function encryptFile(file: File) {
      const encrypted = file.access == "private";
      return {
        ...file,
        name: await encryptStr(file.name, encrypted),
        content: await encrypt(file.content, encrypted),
      } as solApi.File;
    }

    async function decryptFile(file: solApi.File) {
      const encrypted = file.access == "private";
      return {
        ...file,
        name: await decryptStr(file.name, encrypted),
        content: await decrypt(file.content, encrypted),
      };
    }

    async function encryptFolder(folder: Folder) {
      return {
        ...folder,
        name: await encryptStr(folder.name, true),
      };
    }

    async function decryptFolder(folder: solApi.Folder) {
      return {
        ...folder,
        name: await decryptStr(folder.name, true),
      };
    }

    // Folder functions
    async function fetchFolder(...args: Parameters<typeof api.fetchFolder>) {
      const res = await api.fetchFolder(...args);
      return decryptFolder(res);
    }

    async function fetchFolders(...args: Parameters<typeof api.fetchFolders>) {
      const res = await api.fetchFolders(...args);
      return Promise.all(res.map((f) => decryptFolder(f.account)));
    }

    async function createFolder(folder: Folder) {
      const enc = await encryptFolder(folder);
      return api.createFolder(enc);
    }

    async function updateFolder(folder: Folder) {
      const enc = await encryptFolder(folder);
      return api.updateFolder(enc);
    }

    // File functions
    async function fetchFile(...args: Parameters<typeof api.fetchFile>) {
      const res = await api.fetchFile(...args);
      return decryptFile(res);
    }

    async function fetchFiles(...args: Parameters<typeof api.fetchFiles>) {
      const res = await api.fetchFiles(...args);
      return Promise.all(res.map((f) => decryptFile(f.account)));
    }

    async function createFile(file: File, execute: boolean = true) {
      const enc = await encryptFile(file);
      const maxSize = enc.content.length;
      return api.createFile(enc, maxSize, execute);
    }

    async function updateFile(
      file: File,
      content?: ArrayBuffer,
      currentFile?: File,
      user?: solApi.User
    ) {
      if (content) file.content = content;
      const fileEnc = await encryptFile(file);
      const currentEnc = currentFile
        ? await encryptFile(currentFile)
        : undefined;
      return api.updateFile(
        fileEnc,
        content ? fileEnc.content : undefined,
        currentEnc,
        user
      );
    }

    // Combined
    async function fetchChildren(id: number, withContent: boolean) {
      const rtn = await api.fetchChildren(id, withContent);
      const folders = await Promise.all(
        rtn.folders.map((f) => decryptFolder(f.account))
      );
      const files = await Promise.all(
        rtn.files.map((f) => decryptFile(f.account))
      );
      return { folders, files };
    }

    return {
      ...api,
      fetchFolder,
      fetchFolders,
      createFolder,
      updateFolder,
      fetchFile,
      fetchFiles,
      createFile,
      updateFile,
      fetchChildren,
    };
  });
}

export const useWrappedApi = createGlobalState(() => createWrappedApi());
