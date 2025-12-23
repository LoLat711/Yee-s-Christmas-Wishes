
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
import { TreeStage } from '../types';

const Group = 'group' as any;
const Mesh = 'mesh' as any;
const BoxGeometry = 'boxGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const PlaneGeometry = 'planeGeometry' as any;
const SphereGeometry = 'sphereGeometry' as any;

interface Target {
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

interface PolaroidProps {
  url: string;
  treeTarget: Target;
  nebulaTarget: Target;
  stage: TreeStage;
  index: number;
  isFocused?: boolean;
}

export const Polaroid: React.FC<PolaroidProps> = ({ url, treeTarget, nebulaTarget, stage, index, isFocused }) => {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useTexture(url);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const backMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Dimensions
  const width = 1.05;
  const height = 1.26;
  const borderSize = 0.05;
  const bottomMargin = 0.15;

  useEffect(() => {
    if (!meshRef.current) return;

    let targetPos = new THREE.Vector3();
    let targetRot = new THREE.Euler();
    let targetScale = 1;

    if (stage === 'tree') {
      targetPos.copy(treeTarget.position);
      targetRot.copy(treeTarget.rotation);
      targetScale = 1;
    } else if (stage === 'nebula') {
      targetPos.copy(nebulaTarget.position);
      targetRot.copy(nebulaTarget.rotation);
      targetScale = 1;
    } else if (stage === 'focus') {
      if (isFocused) {
        // Move to center, slightly in front of camera (Camera is at 0,0,20)
        // Set to local y=-1 so World Y approx 0 (parent group at y=1)
        targetPos.set(0, -1, 15);
        targetRot.set(0, 0, 0); // Face camera directly
        targetScale = 1.5; // Scale up
      } else {
        // Stay in nebula position but push back slightly or just stay
        targetPos.copy(nebulaTarget.position);
        targetRot.copy(nebulaTarget.rotation);
        targetScale = 1;
      }
    }

    // Animation for Position/Rotation/Scale
    gsap.to(meshRef.current.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.2,
      ease: "power3.out"
    });

    gsap.to(meshRef.current.rotation, {
      x: targetRot.x,
      y: targetRot.y,
      z: targetRot.z,
      duration: 1.2,
      ease: "power3.out"
    });

    gsap.to(meshRef.current.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 1.2,
      ease: "power3.out"
    });

  }, [stage, treeTarget, nebulaTarget, isFocused, index]);

  // Handle Opacity / Dimming
  useFrame((state) => {
    if (meshRef.current) {
      // Floating effect
      if (stage === 'tree') {
        const time = state.clock.elapsedTime;
        const hover = Math.sin(time * 2 + treeTarget.position.y) * 0.02;
        const ox = Math.sin(meshRef.current.rotation.y);
        const oz = Math.cos(meshRef.current.rotation.y);
        meshRef.current.position.x += ox * hover * 0.1;
        meshRef.current.position.z += oz * hover * 0.1;
      } else if (stage === 'focus' && isFocused) {
        // Gentle breathing hover for focused item
        const time = state.clock.elapsedTime;
        const hover = Math.sin(time * 1.5) * 0.05;
        meshRef.current.position.y = -1 + hover; // Base y=-1 to match targetPos
      }

      // Opacity / Emissive updates
      const targetOpacity = (stage === 'focus' && !isFocused) ? 0.2 : 1.0;
      const targetEmissiveInt = (stage === 'focus' && !isFocused) ? 0.05 : 0.2;

      if (materialRef.current) {
        materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, 0.1);
        materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, targetEmissiveInt, 0.1);
        materialRef.current.transparent = true;
      }
      if (backMaterialRef.current) {
        backMaterialRef.current.opacity = THREE.MathUtils.lerp(backMaterialRef.current.opacity, targetOpacity, 0.1);
        backMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(backMaterialRef.current.emissiveIntensity, targetEmissiveInt, 0.1);
        backMaterialRef.current.transparent = true;
      }
    }
  });

  return (
    <Group 
      ref={meshRef} 
      position={treeTarget.position} 
      rotation={treeTarget.rotation}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      {/* Polaroid Background Card */}
      <Mesh castShadow>
        <BoxGeometry args={[width, height, 0.02]} />
        <MeshStandardMaterial 
          color="#ffffff" 
          roughness={0.4} 
          metalness={0.05} 
          transparent
          opacity={stage === 'focus' && !isFocused ? 0.2 : 1}
        />
      </Mesh>
      
      {/* Front Photo */}
      <Mesh position={[0, (bottomMargin - borderSize) / 2, 0.011]}>
        <PlaneGeometry args={[width - borderSize * 2, height - (borderSize + bottomMargin)]} />
        <MeshStandardMaterial 
          ref={materialRef}
          map={texture} 
          roughness={0.6} 
          metalness={0} 
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </Mesh>

      {/* Back Photo (Rotated 180 degrees) */}
      <Mesh position={[0, (bottomMargin - borderSize) / 2, -0.011]} rotation={[0, Math.PI, 0]}>
        <PlaneGeometry args={[width - borderSize * 2, height - (borderSize + bottomMargin)]} />
        <MeshStandardMaterial 
          ref={backMaterialRef}
          map={texture} 
          roughness={0.6} 
          metalness={0}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </Mesh>

      {/* Decorative Golden Pin (Front) */}
      <Mesh position={[0, height / 2 - 0.05, 0.01]}>
        <SphereGeometry args={[0.02, 12, 12]} />
        <MeshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} transparent opacity={stage === 'focus' && !isFocused ? 0.2 : 1} />
      </Mesh>

      {/* Decorative Golden Pin (Back) */}
      <Mesh position={[0, height / 2 - 0.05, -0.01]}>
        <SphereGeometry args={[0.02, 12, 12]} />
        <MeshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} transparent opacity={stage === 'focus' && !isFocused ? 0.2 : 1}/>
      </Mesh>
    </Group>
  );
};
