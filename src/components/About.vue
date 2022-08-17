<script lang="ts" setup>
import Glow from "./about/Glow.vue";
import Blocks from "./about/Blocks.vue";
</script>

<template>
  <div class="flex flex-col items-center font-light">
    <div class="flex items-center p-14">
      <img src="../assets/logo.png" width="96" />
      <div class="text-5xl ml-8">SolDrive</div>
    </div>

    <!-- Intro block -->
    <div class="flex flex-col lg:flex-row max-w-3xl">
      <!-- Text block -->
      <div class="flex flex-col flex-1 p-4 justify-center text-justify">
        <div class="text-3xl">Welcome to SolDrive</div>
        <div class="mt-5">
          SolDrive is completely on-chain cloud storage platform on Solana,
          featuring a file manager to organise files and folders, a text editor
          to easily edit text files and take notes, as well as several file
          viewers to explore the stored files directly online.
        </div>
      </div>
      <!-- Graphic -->
      <div class="flex-1 p-4 w-full flex-center py-[32px]">
        <Blocks class="w-[256px] h-[256px]"></Blocks>
      </div>
    </div>

    <!-- Separator -->
    <div class="h-[32px]"></div>

    <!-- Backend -->
    <div class="flex flex-col lg:flex-row-reverse max-w-3xl">
      <!-- Text block -->
      <div class="flex flex-col flex-1 p-4 justify-center text-justify">
        <div class="text-3xl">Backends</div>
        <div class="mt-5">
          Files and notes can be stored both on-chain directly Solana Accounts,
          or on Arweave, a specialised file chain, to drastically reduce the
          uploading cost. Links to those files are then maintained on chain.
          Regardless of the backend chosen, the hosting is paid once on a data
          size basis and the data lives forever.
        </div>
      </div>

      <!-- Graphic -->
      <div class="flex-1 p-4 w-full flex-center flex flex-col py-[32px]">
        <Glow class="w-[256px]">
          <img src="../assets/solana-large.png" />
        </Glow>
        <Glow class="w-[256px] mt-[64px]">
          <img src="../assets/arweave-large.png" />
        </Glow>
      </div>
    </div>

    <!-- Separator -->
    <div class="h-[32px]"></div>

    <!-- Encryption -->
    <div class="flex flex-col lg:flex-row max-w-3xl">
      <!-- Text block -->
      <div class="flex flex-col flex-1 p-4 justify-center text-justify">
        <div class="text-3xl">Encryption</div>
        <div class="mt-5">
          All the assets are encrypted by default using a key derived from a
          Solana Wallet. No need to remember yet another password. Assets can
          also be shared unencrypted with read and edit rights for collaborative
          text editing (feature coming soon).
        </div>
      </div>
      <!-- Graphic -->
      <div class="flex-1 p-4 w-full flex-center py-[32px]">
        <img src="../assets/data-encryption.png" width="196" />
      </div>
    </div>

    <!-- Separator -->
    <div class="h-[32px]"></div>

    <!-- Files -->
    <div class="flex flex-col lg:flex-row-reverse max-w-3xl">
      <!-- Text block -->
      <div class="flex flex-col flex-1 p-4 justify-center text-justify">
        <div class="text-3xl">File support</div>
        <div class="mt-5">
          Any file can be stored, and several file types can be opened directly
          on Soldrive, including text documents, images, videos, audio files and
          PDFs. A built-in note editor enables online notes edition.
        </div>
      </div>
      <!-- Graphic -->
      <div class="flex-1 p-4 w-full flex-center flex flex-col py-[32px]">
        <div class="grid grid-cols-3 gap-2">
          <img width="56" src="../assets/files/word.png" />
          <img width="56" src="../assets/files/video.png" />
          <img width="56" src="../assets/files/image.png" />
          <img width="56" src="../assets/files/zip.png" />
          <img width="56" src="../assets/files/mp3.png" />
          <img width="56" src="../assets/files/pdf.png" />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="h-[64px]"></div>
  </div>
</template>
