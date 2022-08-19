import { watch, Ref } from "vue";
import { useMagicKeys } from "@vueuse/core";

export function useEscapeClose(isOpen: Ref<boolean>) {
  const { escape } = useMagicKeys();
  watch([escape], () => (isOpen.value = false));
}
