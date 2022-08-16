import { createGlobalState, useAsyncState } from "@vueuse/core";
import { ref, computed } from "vue";
import { File, Folder } from "../api/chain-api";
import { useChainApi } from "../api/chain-api";
import { fileIcon } from "../store/fileTypes";
import folderIcon from "../assets/files/folder.png";

type Item = { type: "file" | "folder"; id: number; name: string; icon: string };

function createClipboardStore() {
  const { api } = useChainApi();
  const items = ref<Item[]>([]);

  const isEmpty = computed(() => {
    return items.value.length == 0;
  });

  function pushFile(file: File) {
    items.value.push({
      type: "file",
      id: file.id,
      name: file.name,
      icon: fileIcon(file.fileExt),
    });
  }

  function pushFolder(folder: Folder) {
    items.value.push({
      type: "folder",
      id: folder.id,
      name: folder.name,
      icon: folderIcon,
    });
  }

  function popFile(file: File) {
    items.value = items.value.filter(
      (f) => f.type != "file" || f.id != file.id
    );
  }

  function popFolder(folder: Folder) {
    items.value = items.value.filter(
      (f) => f.type != "folder" || f.id != folder.id
    );
  }

  function updateFile(oldFile: File, newFile: File) {
    if (hasFile(oldFile)) {
      popFile(oldFile);
      pushFile(newFile);
    }
  }

  function updateFolder(oldFolder: Folder, newFolder: Folder) {
    if (hasFolder(oldFolder)) {
      popFolder(oldFolder);
      pushFolder(newFolder);
    }
  }

  function hasFile(file: File) {
    return items.value.some((f) => f.type == "file" && f.id == file.id);
  }

  function hasFolder(folder: Folder) {
    return items.value.some((f) => f.type == "folder" && f.id == folder.id);
  }

  function clear() {
    items.value = [];
  }

  async function move(parent: number) {
    await api.value!.updateParent(
      items.value.filter((i) => i.type == "file").map((f) => f.id),
      items.value.filter((i) => i.type == "folder").map((f) => f.id),
      parent
    );
    clear();
  }

  return {
    items,
    pushFile,
    pushFolder,
    popFile,
    popFolder,
    updateFile,
    updateFolder,
    hasFile,
    hasFolder,
    clear,
    move,
    isEmpty,
  };
}

export const useClipbardStore = createGlobalState(() => createClipboardStore());
