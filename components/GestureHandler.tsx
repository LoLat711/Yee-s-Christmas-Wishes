
import React, { useEffect, useRef } from 'react';

interface GestureHandlerProps {
  isActive: boolean;
  onGesture: (gesture: 'palm' | 'fist' | 'pointing' | 'victory') => void;
}

const GestureHandler: React.FC<GestureHandlerProps> = ({ isActive, onGesture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastGestureRef = useRef<string | null>(null);
  const cooldownRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isActive) return;

    let isMounted = true;
    const canvasCtx = canvasRef.current?.getContext('2d');
    const hands = new (window as any).Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results: any) => {
      if (!isMounted || !canvasCtx || !canvasRef.current || !videoRef.current) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          // 绘制手部反馈
          (window as any).drawConnectors(canvasCtx, landmarks, (window as any).HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 2,
          });
          (window as any).drawLandmarks(canvasCtx, landmarks, {
            color: '#FF0000',
            lineWidth: 1,
            radius: 3,
          });

          // 逻辑判定
          const isFingerUp = (tipIdx: number, pipIdx: number) => {
            return landmarks[tipIdx].y < landmarks[pipIdx].y; // y越小越靠上
          };

          const thumbUp = landmarks[4].x < landmarks[3].x; // 简化判定，不做严格要求
          const indexUp = isFingerUp(8, 6);
          const middleUp = isFingerUp(12, 10);
          const ringUp = isFingerUp(16, 14);
          const pinkyUp = isFingerUp(20, 18);

          let currentGesture: 'palm' | 'fist' | 'pointing' | 'victory' | null = null;

          // 严格判定逻辑
          if (indexUp && middleUp && ringUp && pinkyUp) {
            currentGesture = 'palm';
          } else if (indexUp && middleUp && !ringUp && !pinkyUp) {
            currentGesture = 'victory';
          } else if (indexUp && !middleUp && !ringUp && !pinkyUp) {
            currentGesture = 'pointing';
          } else if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
            currentGesture = 'fist';
          }

          if (currentGesture && currentGesture !== lastGestureRef.current && !cooldownRef.current) {
            onGesture(currentGesture);
            lastGestureRef.current = currentGesture;
            cooldownRef.current = true;
            // 800ms cool down for responsive but stable switching
            setTimeout(() => { cooldownRef.current = false; }, 800);
          }
        }
      }
      canvasCtx.restore();
    });

    let camera: any = null;
    if (videoRef.current) {
      camera = new (window as any).Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && isMounted) {
            try {
              await hands.send({ image: videoRef.current });
            } catch (error) {
              if (isMounted) console.error("MediaPipe error:", error);
            }
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    return () => {
      isMounted = false;
      if (camera) camera.stop();
      if (hands) hands.close();
    };
  }, [isActive, onGesture]);

  return (
    <div className={`absolute bottom-6 right-6 w-48 h-36 rounded-2xl overflow-hidden border-2 border-white/30 bg-black/50 backdrop-blur-md transition-all duration-700 shadow-2xl ${isActive ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0 pointer-events-none'}`}>
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 scale-x-[-1]" playsInline muted />
      <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500/80 rounded text-[9px] font-bold uppercase tracking-widest text-white animate-pulse">
        Live Tracking
      </div>
      <div className="absolute bottom-2 left-2 text-[8px] text-white/70 font-mono">
        ☝️Focus ✌️Back ✋Next ✊Tree
      </div>
    </div>
  );
};

export default GestureHandler;
