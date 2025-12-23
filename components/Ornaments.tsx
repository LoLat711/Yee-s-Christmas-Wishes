
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { TreeStage } from '../types';

const Mesh = 'mesh' as any;
const SphereGeometry = 'sphereGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;

interface OrnamentsProps {
  count: number;
  height: number;
  spiralTurns: number;
  stage: TreeStage;
}

const ORNAMENT_COLORS = [
  '#FF4D4D',
  '#B5E5FF',
  '#FF8A9C',
  '#F5F5F5',
];

export const Ornaments: React.FC<OrnamentsProps> = ({ count, height, spiralTurns, stage }) => {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const matRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  const data = useMemo(() => {
    const radiusBase = 3.5;
    const treePositions: THREE.Vector3[] = [];
    const nebulaPositions: THREE.Vector3[] = [];
    const treeScales: number[] = [];

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const y = t * (height - 1) + 0.5;
      const currentRadius = radiusBase * (1 - y / height) + 0.2;
      const angle = t * Math.PI * 2 * spiralTurns;
      treePositions.push(new THREE.Vector3(
        Math.cos(angle) * currentRadius,
        y,
        Math.sin(angle) * currentRadius
      ));

      const nebulaR = 12 + (Math.random() - 0.5) * 4;
      const nebulaAngle = Math.random() * Math.PI * 2;
      nebulaPositions.push(new THREE.Vector3(
        Math.cos(nebulaAngle) * nebulaR,
        (Math.random() - 0.5) * 2.5, 
        Math.sin(nebulaAngle) * nebulaR
      ));

      // Calculate scale based on height (t)
      // Bottom 30% -> 1.8r
      // Middle 30% -> 1.4r (0.3 to 0.6)
      // Top 40% -> 1.0r
      let scale = 1.0;
      if (t < 0.3) {
        scale = 1.8;
      } else if (t < 0.6) {
        scale = 1.4;
      }
      treeScales.push(scale);
    }
    return { treePositions, nebulaPositions, treeScales };
  }, [count, height, spiralTurns]);

  useEffect(() => {
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const targetPos = stage === 'tree' ? data.treePositions[i] : data.nebulaPositions[i];
      const targetScale = stage === 'tree' ? data.treeScales[i] : 0.6; // Use calculated scale for tree, fixed small scale for nebula
      
      gsap.to(mesh.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        ease: "power2.out",
        delay: 0
      });

      gsap.to(mesh.scale, {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration: 1.5,
        ease: "power2.out"
      });
      
      // Material fading for focus mode
      const mat = matRefs.current[i];
      if (mat) {
          gsap.to(mat, {
              opacity: stage === 'focus' ? 0.2 : 1.0,
              duration: 1.0,
              onUpdate: () => { mat.transparent = true; }
          });
      }
    });
  }, [stage, data]);

  return (
    <>
      {data.treePositions.map((pos, i) => (
        <Mesh 
          key={i} 
          ref={(el: THREE.Mesh) => (meshRefs.current[i] = el)}
          position={stage === 'tree' ? [pos.x, pos.y, pos.z] : [data.nebulaPositions[i].x, data.nebulaPositions[i].y, data.nebulaPositions[i].z]} 
          castShadow 
          receiveShadow
        >
          <SphereGeometry args={[0.22, 32, 32]} />
          <MeshStandardMaterial
            ref={(el: THREE.MeshStandardMaterial) => (matRefs.current[i] = el)}
            color={ORNAMENT_COLORS[i % ORNAMENT_COLORS.length]}
            emissive={ORNAMENT_COLORS[i % ORNAMENT_COLORS.length]}
            emissiveIntensity={0.2}
            metalness={0.9}
            roughness={0.05}
            envMapIntensity={3}
          />
        </Mesh>
      ))}
    </>
  );
};
