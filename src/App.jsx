import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, Sphere, OrbitControls, Stats, useTexture, Sky, Stars } from "@react-three/drei";

import Ingenuity from "./Ingenuity";
import * as THREE from "three";

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

const Terrain = () => {
  const heightMap = useTexture("/textures/heightmap_4196x2048_q85.jpg");
  const normalMap = useTexture("/textures/normalmap_4196x2048_q95_-1to1.jpg");
  const colorMap = useTexture("/textures/colormap_4196x2048_q75.jpg");

  // colorMap.magFilter = THREE.NearestFilter;
  // colorMap.minFilter = THREE.LinearMipmapLinearFilter;
  // colorMap.wrapS = THREE.MirroredRepeatWrapping;
  // colorMap.wrapT = THREE.MirroredRepeatWrapping;

  console.log(colorMap);

  return (
    <Sphere args={[1000, 256, 128]} position={[0, -1000, 0]}>
      <meshStandardMaterial
        color='white'
        map={colorMap}
        displacementMap={heightMap}
        displacementScale={10}
        normalMap={normalMap}
        metalness={0.2}
      />
    </Sphere>
  );
};

const App = () => {
  return (
    <Canvas camera={{ fov: 70, far: 100000, position: [0, 0, -1000] }}>
      {/* <fog attach='fog' args={["#cc7b32", 0, 5000]} /> */}
      <OrbitControls />
      <pointLight intensity={0.5} position={[0, 5, 1]} />
      <pointLight intensity={0.2} position={[0, -5, 4]} />
      <ambientLight intensity={0.5} />
      <Terrain />
      <Ingenuity />
      <Stars radius={5000} factor={1000} fade speed={0.1} depth={50000} />
      <Stats />
    </Canvas>
  );
};

export default App;
