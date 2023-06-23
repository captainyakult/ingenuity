/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 ingenuity.gltf
*/

import React, { useRef, useEffect, forwardRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { BallCollider, RigidBody, CylinderCollider, CuboidCollider, useRapier, quat, euler } from "@react-three/rapier";

import * as THREE from "three";
import { getState, useStore } from "./store";

const dirVector = new THREE.Vector3();
const impulseVector = new THREE.Vector3();
const torqueVector = new THREE.Vector3();

const Ingenuity = forwardRef(function Ingenuity(props, ingenuityRbRef) {
  const { nodes, materials } = useGLTF("/models/ingenuity/ingenuity.gltf");

  const lowerBladeRef = useRef();
  const upperBladeRef = useRef();

  const [upMult, setUpMult] = useState(1);

  useFrame(({ clock }) => {
    lowerBladeRef.current.material.transparent = true;
    lowerBladeRef.current.material.opacity = 1;

    dirVector.set(0, 1, 0);

    const { controls } = getState();
    const { up, down, turnLeft, turnRight, moveForward, moveBackward, moveLeft, moveRight } = controls;

    // up && console.log("up");
    // down && console.log("down");
    // turnLeft && console.log("turnLeft");
    // turnRight && console.log("turnRight");
    // moveForward && console.log("moveForward");
    // moveBackward && console.log("moveBackward");
    // moveLeft && console.log("moveLeft");
    // moveRight && console.log("moveRight");
    const applyImpulse = moveForward || moveBackward || moveLeft || moveRight || up || down;
    const applyTorque = turnLeft || turnRight;

    let propSpeed = 0.4;

    const rotationOffset = quat(ingenuityRbRef.current.rotation());
    dirVector.applyQuaternion(rotationOffset);

    const eulerRot = euler().setFromQuaternion(quat(ingenuityRbRef.current.rotation()));
    // console.log("eulerRot", eulerRot);

    if (applyImpulse) {
      impulseVector.set(0, 0, 0);
      const vAmount = 0.1;
      const amount = 0.2;
      if (up) {
        impulseVector.setY(vAmount);
        propSpeed = 0.6;
      }
      if (down) {
        impulseVector.setY(-vAmount);
        propSpeed = 0.2;
      }
      if (moveForward) impulseVector.setZ(amount);
      if (moveBackward) impulseVector.setZ(-amount);
      if (moveLeft) impulseVector.setX(amount);
      if (moveRight) impulseVector.setX(-amount);

      impulseVector.applyEuler(eulerRot);

      ingenuityRbRef.current.applyImpulse(impulseVector, true);
    }

    if (upMult !== dirVector.y) {
      setUpMult(dirVector.y);
    }

    if (applyTorque) {
      const tAmount = 0.01;
      torqueVector.set(0, 0, 0);
      if (turnLeft) {
        torqueVector.setY(tAmount);
      }
      if (turnRight) {
        torqueVector.setY(-tAmount);
      }

      torqueVector.applyEuler(eulerRot);

      ingenuityRbRef.current.applyTorqueImpulse(torqueVector, true);
    }

    const delta = clock.getDelta() * 4000;
    // console.log(clock.getDelta());

    lowerBladeRef.current.rotation.x += propSpeed * delta;
    upperBladeRef.current.rotation.x += propSpeed * delta;
  });

  // const rigidBody = useRef(null);

  useEffect(() => {
    if (ingenuityRbRef.current) {
      // Constant power force opposing Mars gravity for stable hover.
      ingenuityRbRef.current.resetForces(true);
      ingenuityRbRef.current.addForce({ x: 0, y: 3.71 * upMult, z: 0 }, true);
    }
  }, [upMult]);

  return (
    // prettier-ignore
    <RigidBody
      ref={ingenuityRbRef}
      colliders={false}
      linearDamping={0.5}
      angularDamping={2}
      friction={1}
      density={2}
      {...props}
    >
      <CuboidCollider args={[0.5, 0.25, 0.5]} position={[0, 0.25, 0]} />
      {props.children}
      <group dispose={null}>
        <group rotation={[0, 0, Math.PI / 2]} scale={0.13}>
          <mesh geometry={nodes.Cube025.geometry} material={materials["foil_silver.011"]} />
          <mesh geometry={nodes.Cube025_1.geometry} material={materials["carbon fiber.001"]} />
          <mesh geometry={nodes.Cube025_2.geometry} material={materials["aluminum.002"]} />
          <group rotation={[0, 0, -Math.PI / 2]} scale={7.721}>
            <mesh geometry={nodes.Cube024.geometry} material={materials["carbon fiber.001"]} />
            <mesh geometry={nodes.Cube024_1.geometry} material={materials.binoculars} />
          </group>
          <group position={[1.965, 0.664, 0.69]} rotation={[-0.864, -0.69, -0.373]} scale={7.721}>
            <mesh
              geometry={nodes["MHP_JR_AV_ROTOR_STOWED_120717_A1-STOWED_ROTOR_ASSEMBLY,_120056"].geometry}
              material={materials["gunmetal.001"]}
            />
            <mesh
              geometry={nodes["MHP_JR_AV_ROTOR_STOWED_120717_A1-STOWED_ROTOR_ASSEMBLY,_120056_1"].geometry}
              material={materials.gunmetal_dark}
            />
            <mesh
              geometry={nodes["MHP_JR_AV_ROTOR_STOWED_120717_A1-STOWED_ROTOR_ASSEMBLY,_120056_2"].geometry}
              material={materials["aluminum.002"]}
            />
          </group>
          <group position={[1.965, 0.664, -0.686]} rotation={[0.864, 0.69, -0.373]} scale={7.721}>
            <mesh
              geometry={nodes["MHP_JR_AV_ROTOR_STOWED_120717_A1-STOWED_ROTOR_ASSEMBLY,_120027"].geometry}
              material={materials["gunmetal.001"]}
            />
            <mesh
              geometry={nodes["MHP_JR_AV_ROTOR_STOWED_120717_A1-STOWED_ROTOR_ASSEMBLY,_120027_1"].geometry}
              material={materials.gunmetal_dark}
            />
            <mesh
              geometry={nodes["MHP_JR_AV_ROTOR_STOWED_120717_A1-STOWED_ROTOR_ASSEMBLY,_120027_2"].geometry}
              material={materials["aluminum.002"]}
            />
          </group>
          <group position={[1.868, -0.543, 0.729]} rotation={[-0.276, -1.476, -1.126]} scale={7.721}>
            <mesh geometry={nodes.Cylinder028.geometry} material={materials["gunmetal.001"]} />
            <mesh geometry={nodes.Cylinder028_1.geometry} material={materials.gunmetal_dark} />
            <mesh geometry={nodes.Cylinder028_2.geometry} material={materials["aluminum.002"]} />
          </group>
          <group position={[1.879, -0.543, -0.724]} rotation={[0.368, 1.468, -1.217]} scale={7.721}>
            <mesh geometry={nodes.Cylinder025.geometry} material={materials["gunmetal.001"]} />
            <mesh geometry={nodes.Cylinder025_1.geometry} material={materials.gunmetal_dark} />
            <mesh geometry={nodes.Cylinder025_2.geometry} material={materials["aluminum.002"]} />
          </group>
          <group position={[3.272, 0.014, 0.002]} rotation={[0, 0, -Math.PI / 2]} scale={7.721}>
            <mesh geometry={nodes.Cylinder024.geometry} material={materials["aluminum.002"]} />
            <mesh geometry={nodes.Cylinder024_1.geometry} material={materials["gunmetal.001"]} />
            <mesh geometry={nodes.Cylinder024_2.geometry} material={materials.grey_brushed} />
          </group>
          <group position={[2.508, 0.014, 0.002]} rotation={[0, 0, -1.571]} scale={7.721}>
            <mesh geometry={nodes.Cylinder035.geometry} material={materials["aluminum.002"]} />
            <mesh geometry={nodes.Cylinder035_1.geometry} material={materials["gunmetal.001"]} />
            <mesh geometry={nodes.Cylinder035_2.geometry} material={materials.grey_brushed} />
          </group>
          <group position={[3.499, 0.014, 0.002]} rotation={[Math.PI / 9, 0, 0]} scale={7.721}>
            <mesh geometry={nodes.Cylinder022.geometry} material={materials["gunmetal.001"]} />
            <mesh geometry={nodes.Cylinder022_1.geometry} material={materials["carbon fiber.001"]} />
            <mesh geometry={nodes.Cylinder022_2.geometry} material={materials["aluminum.002"]} />
            <mesh ref={upperBladeRef} geometry={nodes.Cylinder022_3.geometry} material={materials.blades} />
          </group>
          <group position={[2.734, 0.014, 0.002]} rotation={[-0.873, 0, -Math.PI]} scale={7.721}>
            <mesh ref={lowerBladeRef} geometry={nodes.Cylinder021.geometry} material={materials.blades} />
            <mesh geometry={nodes.Cylinder021_1.geometry} material={materials["carbon fiber.001"]} />
            <mesh geometry={nodes.Cylinder021_2.geometry} material={materials["gunmetal.001"]} />
            <mesh geometry={nodes.Cylinder021_3.geometry} material={materials["aluminum.002"]} />
          </group>
          <group position={[3.673, 0.014, 0.002]} rotation={[-Math.PI, Math.PI / 2, 0]} scale={7.721}>
            <mesh geometry={nodes["10460522-1_2_B1-SOLAR_PANEL_SUBSTRATE_5781_FILLET5003"].geometry} material={materials.gunmetal_dark} />
            <mesh geometry={nodes["10460522-1_2_B1-SOLAR_PANEL_SUBSTRATE_5781_FILLET5003_1"].geometry} material={materials.chopper_sp} />
            <mesh geometry={nodes["10460522-1_2_B1-SOLAR_PANEL_SUBSTRATE_5781_FILLET5003_2"].geometry} material={materials["gold.001"]} />
            <mesh
              geometry={nodes["10460522-1_2_B1-SOLAR_PANEL_SUBSTRATE_5781_FILLET5003_3"].geometry}
              material={materials["aluminum.002"]}
            />
          </group>
        </group>
      </group>
    </RigidBody>
  );
});

export { Ingenuity };
