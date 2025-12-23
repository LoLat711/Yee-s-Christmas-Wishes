
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { TreeStage } from '../types';

const Points = 'points' as any;
const BufferGeometry = 'bufferGeometry' as any;
const BufferAttribute = 'bufferAttribute' as any;
const PointsMaterial = 'pointsMaterial' as any;

interface ParticleTreeProps {
  count: number;
  height: number;
  radius: number;
  stage: TreeStage;
}

export const ParticleTree: React.FC<ParticleTreeProps> = ({ count, height, radius, stage }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const posAttrRef = useRef<THREE.BufferAttribute>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const { treePositions, nebulaPositions, colors } = useMemo(() => {
    const treePos = new Float32Array(count * 3);
    const nebulaPos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const silver1 = new THREE.Color('#C0C0C0');
    const silver2 = new THREE.Color('#E8E8E8');
    const accent = new THREE.Color('#FFD700');

    for (let i = 0; i < count; i++) {
      const y = Math.random() * height;
      const currentRadius = radius * (1 - y / height);
      const angle = Math.random() * Math.PI * 2;
      const noise = (Math.random() - 0.5) * 0.4;
      
      treePos[i * 3] = Math.cos(angle) * (currentRadius + noise);
      treePos[i * 3 + 1] = y;
      treePos[i * 3 + 2] = Math.sin(angle) * (currentRadius + noise);

      const nebulaR = 12 + (Math.random() - 0.5) * 3;
      const nebulaAngle = Math.random() * Math.PI * 2;
      nebulaPos[i * 3] = Math.cos(nebulaAngle) * nebulaR;
      // Increased vertical spread to 2.5
      nebulaPos[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      nebulaPos[i * 3 + 2] = Math.sin(nebulaAngle) * nebulaR;

      const mixFactor = Math.random();
      const finalColor = mixFactor < 0.3 ? silver1 : mixFactor < 0.6 ? silver2 : accent;
      
      colors[i * 3] = finalColor.r;
      colors[i * 3 + 1] = finalColor.g;
      colors[i * 3 + 2] = finalColor.b;
    }

    return { treePositions: treePos, nebulaPositions: nebulaPos, colors };
  }, [count, height, radius]);

  useEffect(() => {
    if (!posAttrRef.current) return;
    const attribute = posAttrRef.current;
    const array = attribute.array as Float32Array;
    const targetArray = stage === 'tree' ? treePositions : nebulaPositions;

    const data = { progress: 0 };
    const initialArray = Array.from(array);

    gsap.to(data, {
      progress: 1,
      duration: 1.5, // 统一 1.5s
      ease: "power2.out", // 统一 power2.out
      onUpdate: () => {
        for (let i = 0; i < count * 3; i++) {
          array[i] = THREE.MathUtils.lerp(initialArray[i], targetArray[i], data.progress);
        }
        attribute.needsUpdate = true;
      }
    });

    // Fade logic for focus mode
    if (materialRef.current) {
        gsap.to(materialRef.current, {
            opacity: stage === 'focus' ? 0.2 : 0.8,
            duration: 1
        });
    }

  }, [stage, treePositions, nebulaPositions, count]);

  useFrame((state) => {
    if (pointsRef.current) {
      const rotationSpeed = stage === 'tree' ? 0.05 : 0.15;
      pointsRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
    }
  });

  return (
    <Points ref={pointsRef}>
      <BufferGeometry>
        <BufferAttribute
          ref={posAttrRef}
          attach="attributes-position"
          count={treePositions.length / 3}
          array={new Float32Array(treePositions)}
          itemSize={3}
        />
        <BufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </BufferGeometry>
      <PointsMaterial
        ref={materialRef}
        size={0.07}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
};
