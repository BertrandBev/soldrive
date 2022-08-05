import Popper from "popper.js";

let popper: Popper | null = null;

export type ReferenceObject = Popper.ReferenceObject;

export function openPopper(
  referenceObject: Popper.ReferenceObject,
  el: Element,
  nextTick: (fn: () => void) => void
) {
  if (popper) {
    close();
  }
  popper = new Popper(referenceObject, el, {
    placement: "bottom-start",
    positionFixed: true,
  });

  // Recalculate position
  nextTick(() => {
    popper!.scheduleUpdate();
  });
}

export function closePopper() {
  if (popper) {
    popper!.destroy();
    popper = null;
  }
}
