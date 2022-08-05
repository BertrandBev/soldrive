// Implements an account cache to speed up lookups

import * as solApi from "../../anchor/app/api";

type SolApi = ReturnType<typeof solApi.getAPI>;

// Re-export types
export type Keyed<T> = solApi.Keyed<T>;
export type File = solApi.File;
export type Folder = solApi.Folder;
export type User = solApi.User;
export type FileType = solApi.FileType;
export type Access = solApi.Access;

let folders: { [key: number]: Keyed<Folder> } = {};
let files: { [key: number]: Keyed<File> } = {};

export function createCache(api: SolApi): SolApi {
  // Wrap account lookups in cache

  const fetchFolder = api.fetchFolders;
  api.fetchFolders = async (ids: number[] | undefined) => {
    if (ids == undefined) return fetchFolder(ids);
    else {
      const fetchIds = ids.filter((id) => !folders[id]);
      const fetched = await fetchFolder(ids);
      fetched.forEach((folder, idx) => (folders[fetchIds[idx]] = folder));
      return ids.map((id) => folders[id]);
    }
  };

  const updateFolders = api.updateFolder;
  api.updateFolder = async <T extends Array<any>>(id: number, ...args: T) => {
    delete folders[id];
    return updateFolders(id, ...args);
  };

  const removeFolder = api.removeFolder;
  api.removeFolder = async <T extends Array<any>>(id: number, ...args: T) => {
    delete folders[id];
    return removeFolder(id, ...args);
  };

  return api;
}
