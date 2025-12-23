
import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment, Float, Loader } from '@react-three/drei';
import { gsap } from 'gsap';
import ChristmasTree from './components/ChristmasTree';
import UIOverlay from './components/UIOverlay';
import GestureHandler from './components/GestureHandler';
import { TreeStage } from './types';

const AmbientLight = 'ambientLight' as any;
const SpotLight = 'spotLight' as any;
const PointLight = 'pointLight' as any;

// Logic to animate camera based on stage
const CameraController: React.FC<{ stage: TreeStage }> = ({ stage }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    let targetPos = { x: 0, y: 5, z: 20 };
    
    if (stage === 'tree') {
      targetPos = { x: 0, y: 5, z: 20 };
    } else if (stage === 'nebula') {
      targetPos = { x: 0, y: 2, z: 24 }; // Wider shot for nebula
    } else if (stage === 'focus') {
      targetPos = { x: 0, y: 0, z: 20 }; // Centered view for photo at y=0
    }

    gsap.to(camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => camera.updateProjectionMatrix()
    });

  }, [stage, camera]);

  return null;
};

const App: React.FC = () => {
  const [isWished, setIsWished] = useState(false);
  const [stage, setStage] = useState<TreeStage>('tree');
  const [focusIndex, setFocusIndex] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleWish = () => {
    setIsWished(!isWished);
  };

  const handlePhotoUpload = (newPhotos: string[]) => {
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const toggleStage = (newStage: TreeStage) => {
    setStage(newStage);
  };

  const onGesture = useCallback((gesture: 'palm' | 'fist' | 'pointing' | 'victory') => {
    // State Machine
    if (stage === 'tree') {
      if (gesture === 'palm') setStage('nebula');
    } 
    else if (stage === 'nebula') {
      if (gesture === 'fist') setStage('tree');
      if (gesture === 'pointing') {
        // Find "nearest" logic: essentially reset to 0 or keep current for now
        // In a real 3D space calculation we would project camera vector, but here we just enter focus mode
        setStage('focus');
      }
    } 
    else if (stage === 'focus') {
      if (gesture === 'victory') setStage('nebula');
      if (gesture === 'palm') {
        // Cycle next photo
        setFocusIndex((prev) => (prev + 1) % (photos.length || 1));
      }
    }
  }, [stage, photos.length]);

  return (
    <div className="w-full h-screen bg-[#050505] relative">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <CameraController stage={stage} />
        <PerspectiveCamera makeDefault position={[0, 5, 20]} fov={45} />
        
        <AmbientLight intensity={0.4} />
        <SpotLight 
          position={[10, 20, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1.5} 
          castShadow 
        />
        <PointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="night" />

        <Suspense fallback={null}>
          <Float 
            speed={stage === 'focus' ? 0.5 : 1.5} 
            rotationIntensity={stage === 'focus' ? 0.05 : 0.2} 
            floatIntensity={stage === 'focus' ? 0.2 : 0.5}
          >
            <ChristmasTree stage={stage} photos={photos} focusedIndex={focusIndex} />
          </Float>
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          enableRotate={true}
          minDistance={2} 
          maxDistance={45} 
          autoRotate={!isWished && stage === 'tree'}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <GestureHandler 
        isActive={isCameraActive} 
        onGesture={onGesture} 
      />

      <UIOverlay 
        onWish={handleWish} 
        isWished={isWished} 
        onPhotoUpload={handlePhotoUpload}
        currentStage={stage}
        onStageChange={toggleStage}
        isCameraActive={isCameraActive}
        onToggleCamera={() => setIsCameraActive(!isCameraActive)}
      />
      <Loader />
    </div>
  );
};

export default App;
