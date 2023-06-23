import { useEffect } from "react";
import { useStore } from "./store";

import ReactNipple from "react-nipple";

function useKeys(keyConfig) {
  useEffect(() => {
    const keyMap = keyConfig.reduce((out, { keys, fn, up = true }) => {
      keys && keys.forEach(key => (out[key] = { fn, pressed: false, up }));
      return out;
    }, {});

    const downHandler = ({ key, target }) => {
      if (!keyMap[key] || target.nodeName === "INPUT") return;
      const { fn, pressed, up } = keyMap[key];
      keyMap[key].pressed = true;
      if (up || !pressed) fn(true);
    };

    const upHandler = ({ key, target }) => {
      if (!keyMap[key] || target.nodeName === "INPUT") return;
      const { fn, up } = keyMap[key];
      keyMap[key].pressed = false;
      if (up) fn(false);
    };

    window.addEventListener("keydown", downHandler, { passive: true });
    window.addEventListener("keyup", upHandler, { passive: true });

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [keyConfig]);
}

export function Keyboard() {
  const { set } = useStore(({ set }) => ({ set }));
  useKeys([
    { keys: ["w", "W"], fn: up => set(state => ({ controls: { ...state.controls, up } })) },
    { keys: ["s", "S"], fn: down => set(state => ({ controls: { ...state.controls, down } })) },
    { keys: ["a", "A"], fn: turnLeft => set(state => ({ controls: { ...state.controls, turnLeft } })) },
    { keys: ["d", "D"], fn: turnRight => set(state => ({ controls: { ...state.controls, turnRight } })) },
    { keys: ["ArrowUp"], fn: moveForward => set(state => ({ controls: { ...state.controls, moveForward } })) },
    { keys: ["ArrowDown"], fn: moveBackward => set(state => ({ controls: { ...state.controls, moveBackward } })) },
    { keys: ["ArrowLeft"], fn: moveLeft => set(state => ({ controls: { ...state.controls, moveLeft } })) },
    { keys: ["ArrowRight"], fn: moveRight => set(state => ({ controls: { ...state.controls, moveRight } })) },
    // { keys: [' '], fn: (brake) => set((state) => ({ controls: { ...state.controls, brake } })) },
    // { keys: ['h', 'H'], fn: (honk) => set((state) => ({ controls: { ...state.controls, honk } })) },
    // { keys: ['Shift'], fn: (boost) => set((state) => ({ controls: { ...state.controls, boost } })) },
    // { keys: ['r', 'R'], fn: reset, up: false },
    // { keys: ['.'], fn: () => set((state) => ({ editor: !state.editor })), up: false },
    // { keys: ['i', 'I'], fn: () => set((state) => ({ help: !state.help, leaderboard: false })), up: false },
    // { keys: ['l', 'L'], fn: () => set((state) => ({ help: false, leaderboard: !state.leaderboard })), up: false },
    // { keys: ['m', 'M'], fn: () => set((state) => ({ map: !state.map })), up: false },
    // { keys: ['u', 'U'], fn: () => set((state) => ({ sound: !state.sound })), up: false },
    // {
    //   keys: ['c', 'C'],
    //   fn: () => set((state) => ({ camera: cameras[(cameras.indexOf(state.camera) + 1) % cameras.length] })),
    //   up: false,
    // },
  ]);
  return null;
}

const Controls = ({ multiTouch }) => {
  // If the device supports multiple touch points, we can use the real drone control nipples.
  // Otherwise, we'll use the assumption that if you can hover, you are using a physical keyboard
  if (multiTouch) {
    return (
      <>
        {/* see https://github.com/yoannmoinet/nipplejs#options */}
        <ReactNipple
          options={{
            mode: "static",
            position: { bottom: "8rem", left: "min(150px, 25vw)" },
          }}
          onMove={(evt, data) => console.log(evt, data)}
        />
        {/* <ReactNipple
          options={{
            mode: "static",
            position: { bottom: "8rem", right: "min(150px, 25vw)" },
          }}
          onMove={(evt, data) => console.log(evt, data)}
        /> */}
      </>
    );
  }
  return <Keyboard />;
};

export { Controls };
