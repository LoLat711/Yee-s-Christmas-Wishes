import React, { useRef, useState, useEffect } from 'react';
import { TreeStage } from '../types';

interface UIOverlayProps {
  onWish: () => void;
  isWished: boolean;
  onPhotoUpload: (photos: string[]) => void;
  currentStage: TreeStage;
  onStageChange: (stage: TreeStage) => void;
  isCameraActive: boolean;
  onToggleCamera: () => void;
}

const WISH_MESSAGES = [
  "今天要开心哟~",
  "今天要开心哟",
  "生活顺利！",
  "不必飞太高，做一只笨鸟",
  "准备就绪要做个发光体",
  "找到你是我最伟大的成功",
  "去追去闯，去乘风破浪",
  "好事总会发生在下一个转弯",
  "每个梦醒时分，一切成真",
  "幸得与你同乘",
  "只要是与你有关，我就会勇敢"
];

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  onWish, 
  isWished, 
  onPhotoUpload, 
  currentStage,
  onStageChange,
  isCameraActive,
  onToggleCamera
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wishContent, setWishContent] = useState('');
  const lastWishIndex = useRef<number>(-1);

  // Generate a random wish when the modal opens
  useEffect(() => {
    if (isWished) {
      let randomIndex;
      // Ensure we don't pick the same message twice in a row
      do {
        randomIndex = Math.floor(Math.random() * WISH_MESSAGES.length);
      } while (randomIndex === lastWishIndex.current && WISH_MESSAGES.length > 1);
      
      lastWishIndex.current = randomIndex;
      setWishContent(WISH_MESSAGES[randomIndex]);
    }
  }, [isWished]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const loaders = (Array.from(files) as File[]).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loaders).then((results) => {
      onPhotoUpload(results);
    });
  };

  const getStageLabel = (stage: TreeStage) => {
    switch (stage) {
        case 'tree': return '圣诞树';
        case 'nebula': return '星云';
        case 'focus': return '聚焦';
        default: return stage;
    }
  };

  // Shared button styles for harmony
  const buttonBaseClass = "relative overflow-hidden transition-all duration-300 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 active:scale-95 flex items-center justify-center";
  const activeClass = "bg-white/10 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]";
  const inactiveClass = "bg-black/30 text-white/60 hover:text-white";

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 text-white">
      {/* Header */}
      <div className="text-left animate-fade-in pointer-events-auto absolute top-4 left-4 md:top-5 md:left-8 z-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter mb-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-300 to-rose-500 drop-shadow-lg">
          Yee's Christmas Wishes <span className="block sm:inline ml-0 sm:ml-2 text-lg sm:text-inherit mt-1 sm:mt-0">千千许愿树</span>
        </h1>
      </div>

      {/* Right Controls Container - Vertical Stack */}
      <div className="absolute top-8 right-8 pointer-events-auto flex flex-col items-stretch gap-3 w-[140px] z-20">
        
        {/* Stage Switcher Row */}
        <div className="flex flex-row gap-2 justify-between">
          <button
            onClick={() => onStageChange('nebula')}
            title="散开 (手掌)"
            className={`flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 ${buttonBaseClass} ${
              currentStage === 'nebula' 
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : inactiveClass
            }`}
          >
            <i className={`fa-solid fa-bahai text-xl transition-transform duration-500 ${currentStage === 'nebula' ? 'rotate-180 scale-110' : ''}`}></i>
            <span className="text-[10px] font-bold uppercase">散开</span>
          </button>

          <button
            onClick={() => onStageChange('tree')}
            title="收缩 (拳头)"
            className={`flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 ${buttonBaseClass} ${
              currentStage === 'tree' 
                ? 'bg-green-500/20 border-green-400/50 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                : inactiveClass
            }`}
          >
            <i className={`fa-solid fa-tree text-xl transition-transform duration-500 ${currentStage === 'tree' ? 'scale-110' : ''}`}></i>
            <span className="text-[10px] font-bold uppercase">收缩</span>
          </button>
        </div>

        {/* Add Photos Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 ${buttonBaseClass} ${inactiveClass}`}
        >
          <i className="fa-solid fa-images"></i>
          <span className="text-xs font-bold uppercase tracking-widest">添加照片</span>
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </button>

        {/* Camera Toggle Button */}
        <button
          onClick={onToggleCamera}
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 ${buttonBaseClass} ${
            isCameraActive 
              ? 'bg-blue-500/20 border-blue-400/50 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
              : inactiveClass
          }`}
        >
          <i className={`fa-solid ${isCameraActive ? 'fa-video' : 'fa-video-slash'}`}></i>
          <span className="text-xs font-bold uppercase tracking-widest">
            {isCameraActive ? '关闭摄像头' : '开启摄像头'}
          </span>
        </button>
        
        {/* Instructions */}
        <div className="text-right mt-1 pr-1">
            <p className="text-[9px] uppercase tracking-widest opacity-30 leading-tight">
                握拳收缩 · 手掌散开
            </p>
            {currentStage !== 'tree' && (
              <p className="text-[9px] uppercase tracking-widest opacity-30 leading-tight mt-1">
                 ☝️聚焦 · ✌️退出
              </p>
            )}
        </div>
      </div>

      {/* Center Message */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-1000 ${isWished ? 'opacity-100 z-30' : 'opacity-0 z-0'}`}>
        <div className={`transform transition-all duration-1000 ${isWished ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
          <div className="bg-black/60 backdrop-blur-xl px-8 py-6 rounded-3xl border border-white/10 max-w-lg text-center shadow-2xl mx-4 pointer-events-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
              
              <h2 className="text-3xl font-bold font-['SimHei','Microsoft_YaHei',sans-serif] mb-4 text-white tracking-[0.2em] flex items-center justify-center gap-3">
                <span className="animate-sparkle-float text-2xl">✨</span>
                许愿成功
                <span className="animate-sparkle-float text-2xl" style={{ animationDelay: '1s' }}>✨</span>
              </h2>

              <p className="text-white font-medium leading-loose text-lg md:text-xl tracking-wide min-h-[4rem] flex items-center justify-center px-4 animate-breathe">
                {wishContent}
              </p>
          </div>
        </div>
      </div>

      {/* Footer Controls - Positioned absolutely at bottom */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4 pointer-events-auto z-20">
        <button
          onClick={onWish}
          className={`group relative px-10 py-4 rounded-full font-bold text-sm tracking-[0.2em] transition-all duration-500 transform hover:scale-105 active:scale-95 overflow-hidden shadow-2xl ${
            isWished 
              ? 'bg-white/20 text-white/90 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
              : 'bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400/30 shadow-[0_0_30px_rgba(225,29,72,0.4)]'
          }`}
        >
          <span className="relative z-10 flex items-center gap-3">
            {isWished ? "收下祝福" : "许个愿吧"}
            {!isWished && <i className="fa-solid fa-wand-magic-sparkles"></i>}
          </span>
          {!isWished && <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>}
        </button>
        
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
            currentStage === 'tree' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 
            currentStage === 'nebula' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]'
          }`}></div>
          <span className="text-[10px] tracking-[0.2em] uppercase opacity-40">当前视角: {getStageLabel(currentStage)}</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        @keyframes sparkleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 1; text-shadow: 0 0 5px rgba(255,255,255,0.5); }
          50% { transform: translateY(-6px) scale(1.2); opacity: 0.8; text-shadow: 0 0 15px rgba(255,255,255,0.9); }
        }
        .animate-sparkle-float {
          display: inline-block;
          animation: sparkleFloat 2.5s ease-in-out infinite;
        }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.2); }
          30% { transform: scale(1); }
          45% { transform: scale(1.2); }
          60% { transform: scale(1); }
        }
        .animate-heartbeat {
          animation: heartBeat 1.5s ease-in-out infinite;
        }
        
        @keyframes breathe {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); text-shadow: 0 0 10px rgba(255,255,255,0.3); }
        }
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default UIOverlay;