
import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ParticleTree } from './ParticleTree';
import { Ornaments } from './Ornaments';
import { HeartTopper } from './HeartTopper';
import { Polaroid } from './Polaroid';
import { TreeStage } from '../types';

const Group = 'group' as any;

interface ChristmasTreeProps {
  stage: TreeStage;
  photos: string[];
  focusedIndex?: number;
}

const ChristmasTree: React.FC<ChristmasTreeProps> = ({ stage, photos, focusedIndex = 0 }) => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      // If focus, move tree group back slightly or keep centered? 
      // Actually, keeping y:1 for nebula/focus seems good.
      gsap.to(groupRef.current.position, {
        y: stage === 'tree' ? -5 : 1,
        duration: 1.5,
        ease: "power2.out"
      });
    }
  }, [stage]);

  useFrame((state) => {
    if (groupRef.current) {
      if (stage === 'tree') {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
      } else if (stage === 'focus') {
        // Slow down rotation significantly or stop it in focus mode
         gsap.to(groupRef.current.rotation, {
           y: 0,
           duration: 1
         });
      }
    }
  });

  const photoLayouts = useMemo(() => {
    const radiusBase = 4.0; 
    const treeHeight = 10;
    const startY = 1.0;
    const endY = 8.5;
    const nebulaRadius = 12;
    const slopeAngle = Math.atan(radiusBase / treeHeight);
    const totalTurns = 4.5; 

    return photos.map((url, i) => {
      const progress = photos.length > 1 ? i / (photos.length - 1) : 0.5;
      const yNorm = 1 - Math.sqrt(1 - progress * 0.95);
      const treeY = startY + yNorm * (endY - startY);
      const currentRadius = radiusBase * (1 - treeY / treeHeight) + 0.52;
      const thetaTree = progress * Math.PI * 2 * totalTurns;
      const tx = Math.cos(thetaTree) * currentRadius;
      const tz = Math.sin(thetaTree) * currentRadius;
      const treeRot = new THREE.Euler(-slopeAngle, Math.atan2(tx, tz), 0, 'YXZ');

      const nebulaTheta = (i / photos.length) * Math.PI * 2;
      const nx = Math.cos(nebulaTheta) * nebulaRadius;
      const nz = Math.sin(nebulaTheta) * nebulaRadius;
      // Increased vertical thickness from 2.0 to 2.5 (approx 10-25% increase) to prevent overlap
      const ny = (Math.random() - 0.5) * 2.5; 
      const nebulaRot = new THREE.Euler(0, nebulaTheta + Math.PI / 2, 0);

      // Focus target is calculated in Polaroid component dynamically, 
      // but we can pass a 'focus' coordinate here if needed. 
      // However, keeping logic inside Polaroid is cleaner for transitions.

      return {
        url,
        tree: { position: new THREE.Vector3(tx, treeY, tz), rotation: treeRot },
        nebula: { position: new THREE.Vector3(nx, ny, nz), rotation: nebulaRot }
      };
    });
  }, [photos]);

  return (
    <Group ref={groupRef} position={[0, -5, 0]}>
      <ParticleTree count={5500} height={10} radius={4} stage={stage} />
      
      <Ornaments count={40} height={10} spiralTurns={4} stage={stage} />
      
      {photoLayouts.map((layout, index) => (
        <Polaroid 
          key={index} 
          index={index}
          url={layout.url} 
          treeTarget={layout.tree}
          nebulaTarget={layout.nebula}
          stage={stage}
          isFocused={stage === 'focus' && index === focusedIndex}
        />
      ))}

      <Group position={[0, 10, 0]}>
        <HeartTopper stage={stage} />
      </Group>
    </Group>
  );
};

export default ChristmasTree;
