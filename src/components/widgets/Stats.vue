<script setup lang="ts">
import { useUserStore } from "../../store/userStore";
import { DatabaseIcon, FolderIcon, DocumentIcon } from "@heroicons/vue/outline";
import { computed } from "vue";
import { spaceString } from "../../store/fileStore";

const { user } = useUserStore();

const fileCountStr = computed(() => {
  return (user.value?.fileCount || 0).toFixed(0);
});

const folderCountStr = computed(() => {
  return (user.value?.folderCount || 0).toFixed(0);
});

const byteCountStr = computed(() => {
  return spaceString(user.value?.spaceUsed || 0, 1);
});
</script>

<template>
  <div class="stats shadow bg-primary text-neutral">
    <div class="stat">
      <div class="stat-figure text-neutral">
        <DocumentIcon class="w-[32px] h-[32px]"></DocumentIcon>
      </div>
      <div class="stat-title">Files</div>
      <div class="stat-value">{{ fileCountStr }}</div>
      <div class="stat-desc"></div>
    </div>

    <div class="stat">
      <div class="stat-figure text-neutral">
        <FolderIcon class="w-[32px] h-[32px]"></FolderIcon>
      </div>
      <div class="stat-title">Folders</div>
      <div class="stat-value">{{ folderCountStr }}</div>
      <div class="stat-desc"></div>
    </div>

    <div class="stat">
      <div class="stat-figure text-neutral">
        <DatabaseIcon class="w-[32px] h-[32px]"></DatabaseIcon>
      </div>
      <div class="stat-title">Chain space</div>
      <div class="stat-value">{{ byteCountStr }}</div>
      <!-- <div class="stat-desc">bytes</div> -->
    </div>
  </div>
</template>
