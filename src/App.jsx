import React, { useRef, forwardRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, Sphere, OrbitControls, Stats, useTexture, Environment, Stars, PerspectiveCamera } from "@react-three/drei";
import { Physics, RigidBody, BallCollider, vec3, useRapier } from "@react-three/rapier";

import { Ingenuity } from "./Ingenuity";
import { Controls } from "./Controls";
import * as THREE from "three";

const MARS_POS = new THREE.Vector3(0, -1001, 0);

// const Scene = () => {
//   const boxRef = useRef();
//   useFrame((state, delta) => {
//     // boxRef.current.rotation.y += 0.02;
//   });

//   return (
//     <>
//       <Box ref={boxRef} args={[1, 1, 1]} rotation={[0.5, 0, 0]}>
//         <meshNormalMaterial />
//       </Box>
//       <ambientLight />
//     </>
//   );
// };

const Terrain = forwardRef(function Terrain(props, marsRef) {
  const heightMap = useTexture("/textures/heightmap_4196x2048_q85.jpg");
  const normalMap = useTexture("/textures/normalmap_4196x2048_q95_-1to1.jpg");
  const colorMap = useTexture("/textures/colormap_4196x2048_q75.jpg");

  const rapier = useRapier();
  // console.log("rapier", rapier);

  return (
    <RigidBody colliders='hull' type='fixed' friction={5}>
      {/* <BallCollider args={[1002]} /> */}
      <Sphere ref={marsRef} args={[1000, 64, 32]} position={MARS_POS} rotation={[Math.PI * 0.5, 0, 0]}>
        <meshStandardMaterial
          color='white'
          map={colorMap}
          // displacementMap={heightMap}
          // displacementScale={10}
          normalMap={normalMap}
          metalness={0.2}
        />
      </Sphere>
    </RigidBody>
  );
});

const Scene3D = () => {
  const camControls = useRef();
  const ingenuityRbRef = useRef();
  const marsRef = useRef();

  const lookAtVec = new THREE.Vector3(0, 0, 0);
  const cameraVector = new THREE.Vector3(0, 0, 0);
  const gravityVector = new THREE.Vector3();
  // const { world } = useRapier();
  // console.log(world);
  useFrame(state => {
    const ingenuityPos = ingenuityRbRef.current.translation();
    // console.log("ingenuityPos", ingenuityPos);
    // console.log("marsref. pos", MARS_POS);

    gravityVector.set(MARS_POS.x - ingenuityPos.x, MARS_POS.y - ingenuityPos.y, MARS_POS.z - ingenuityPos.z);
    gravityVector.normalize();

    // console.log(gravityVector);

    // lookAtVec.set(ingenuityPos.x, ingenuityPos.y, ingenuityPos.z);
    // cameraVector.lerp(lookAtVec, 0.2);
    // camControls.current.target.copy(cameraVector);

    // camControls.current.update();
  });

  return (
    <>
      {/* <fog attach='fog' args={["#cc7b32", 0, 5000]} /> */}

      <pointLight intensity={0.5} position={[0, 5, 1]} />
      <pointLight intensity={0.2} position={[0, -5, 4]} />
      <ambientLight intensity={0.5} />
      <Physics gravity={[0, -3.71, 0]} colliders={false} debug={false}>
        <Terrain ref={marsRef} />
        <Ingenuity ref={ingenuityRbRef} position={[0, 5, 0]}>
          <PerspectiveCamera fov={75} far={100000} position={[0, 1.5, -5]} rotation={[0, Math.PI, 0]} makeDefault />
        </Ingenuity>
      </Physics>

      {/* <OrbitControls ref={camControls} /> */}

      <Environment files='textures/dikhololo_night_1k.hdr' />

      <Stars radius={5000} factor={1000} fade speed={0.1} depth={50000} />
      <Stats />
    </>
  );
};

const App = () => {
  // Check whether we can play the game with the controls.
  // TODO: change to 1
  // const multiTouch = window.navigator.maxTouchPoints > 0;
  const multiTouch = true;
  const keyboardHardware = !matchMedia("(hover: none)").matches;

  if (!multiTouch && !keyboardHardware) {
    alert("Error!\n. You can only control the helicopter is you have a multi-touch device or a physical keyboard.");
    return null;
  }

  return (
    <>
      {/* <Canvas camera={{ fov: 70, far: 100000, position: [0, 5, -10] }}> */}
      <Canvas>
        <Scene3D />
      </Canvas>
      <Controls multiTouch={multiTouch} />
    </>
  );
};

export default App;
