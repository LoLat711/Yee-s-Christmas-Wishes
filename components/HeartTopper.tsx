
import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { TreeStage } from '../types';

const Group = 'group' as any;
const Mesh = 'mesh' as any;
const ExtrudeGeometry = 'extrudeGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const PointLight = 'pointLight' as any;

interface HeartTopperProps {
  stage: TreeStage;
}

export const HeartTopper: React.FC<HeartTopperProps> = ({ stage }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.5, y + 0.5);
    shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
    shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
    return shape;
  }, []);

  const extrudeSettings = {
    depth: 0.4,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 0.1,
    bevelThickness: 0.1,
  };

  useEffect(() => {
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: stage === 'tree' ? 0.5 : 0,
        y: stage === 'tree' ? 0.5 : 0,
        z: stage === 'tree' ? 0.5 : 0,
        duration: 1.5, // 统一 1.5s
        ease: 'power2.out' // 统一 power2.out
      });
    }
  }, [stage]);

  useFrame((state) => {
    if (meshRef.current) {
      const breathing = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2;
      const baseScale = 1.0;
      const pulseScale = baseScale + breathing * 0.1;
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      
      if (lightRef.current) {
        lightRef.current.intensity = (stage === 'tree' ? 1.5 : 0) + breathing * 2.5;
      }
    }
  });

  return (
    <Group ref={groupRef} scale={0} position={[0.25, 0.75, 0]} rotation={[0, 0, Math.PI]}>
      <Mesh ref={meshRef} castShadow>
        <ExtrudeGeometry args={[heartShape, extrudeSettings]} />
        <MeshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.5} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </Mesh>
      <PointLight ref={lightRef} color="#ff3333" distance={10} decay={2} intensity={2} />
    </Group>
  );
};
