import create from "zustand";
import shallow from "zustand/shallow";

export const angularVelocity = [0, 0.5, 0];

const controls = {
  up: false,
  down: false,
  turnLeft: false,
  turnRight: false,
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
};

const useStoreImpl = create(set => {
  return {
    controls,
    set,
  };
});

// Make the store shallow compare by default
const useStore = sel => useStoreImpl(sel, shallow);
Object.assign(useStore, useStoreImpl);

const { getState, setState } = useStoreImpl;

export { getState, setState, useStore };
