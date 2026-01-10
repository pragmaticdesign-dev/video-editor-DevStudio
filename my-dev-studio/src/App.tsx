import React, { useEffect, useState, useRef } from 'react';
import { Settings, Play, Pause, Monitor, Maximize, X } from 'lucide-react';
import { startLoop, stopLoop } from './engine/loop';
import { Renderer } from './components/stage/Renderer';
import { useStore } from './store/useStore';
import { Inspector } from './components/editor/Inspector';
import { Timeline } from './components/timeline/Timeline';
import { ProjectSettings } from './components/common/ProjectSettings';
import { AudioRenderer } from './components/stage/AudioRenderer';

function App() {
  const { isPlaying, setIsPlaying, currentTime, selectObject, selectedObjectId, project, setTime } = useStore();
  const [showSettings, setShowSettings] = useState(false);

  // --- PRESENTATION MODE STATE ---
  const [isPresentationMode, setPresentationMode] = useState(false);
  const [scale, setScale] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null); // Ref to measure available space

  const { width, height } = project.meta;

  // 1. Unified Smart Scaling Logic
  useEffect(() => {
    const handleResize = () => {
      if (isPresentationMode) {
        // Presentation: Fit Full Screen (Window dimensions)
        const scaleX = window.innerWidth / width;
        const scaleY = window.innerHeight / height;
        setScale(Math.min(scaleX, scaleY) * 0.95);
      } else {
        // Editor: Fit within the containerRef (The center gray area)
        // We fallback to window math if ref isn't ready yet
        const availableW = containerRef.current?.clientWidth || (window.innerWidth - 384); // 384 = sidebar width
        const availableH = containerRef.current?.clientHeight || (window.innerHeight - 320 - 56); // 320=timeline, 56=toolbar

        // Add some padding (e.g. 40px) so it doesn't touch edges
        const scaleX = (availableW - 40) / width;
        const scaleY = (availableH - 40) / height;

        // "Contain" logic: take the smaller dimension
        setScale(Math.min(scaleX, scaleY));
      }
    };

    handleResize(); // Initial calc
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPresentationMode, width, height]);

  // 2. Keyboard Shortcuts 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key) {
        case 'Escape':
          if (isPresentationMode) setPresentationMode(false);
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(!useStore.getState().isPlaying);
          break;
        case 'Home':       // Standard "Home" key
        case 'Enter':      // Mac "Return" key (Easier to press)
          e.preventDefault(); // Stop it from triggering buttons if focused
          setTime(0);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode]);

  useEffect(() => {
    startLoop();
    return () => stopLoop();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden font-sans">

      {/* 1. TOOLBAR */}
      {!isPresentationMode && (
        <div className="h-14 border-b border-gray-700 flex items-center px-4 justify-between bg-[#1e1e1e] shrink-0">
          <div className="flex items-center gap-4">
            <button
              className={`flex items-center gap-2 px-6 py-1.5 rounded font-bold text-sm transition-all ${isPlaying
                  ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white'
                  : 'bg-green-500/10 text-green-500 border border-green-500/50 hover:bg-green-500 hover:text-white'
                }`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              {isPlaying ? 'PAUSE (Space)' : 'PLAY (Space)'}
            </button>

            <button
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-bold border border-gray-600"
              onClick={() => setTime(0)}
            >
              Start Over (Home)
            </button>

            <div className="bg-black px-3 py-1 rounded border border-gray-700">
              <span className="font-mono text-xl text-blue-400 min-w-[80px] inline-block text-center">
                {currentTime.toFixed(2)}<span className="text-xs text-gray-500 ml-1">s</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPresentationMode(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
            >
              <Maximize size={14} />
              PRESENT
            </button>

            <button
              onClick={() => selectObject('stage_main')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${selectedObjectId === 'stage_main'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <Monitor size={14} />
              STAGE
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* THE STAGE AREA */}
        <div
          ref={containerRef}
          className={`flex-1 bg-[#111] relative flex items-center justify-center overflow-hidden transition-all duration-300 ${isPresentationMode ? 'fixed inset-0 z-50 bg-black cursor-none' : ''
            }`}
        >

          {isPresentationMode && (
            <button
              onClick={() => setPresentationMode(false)}
              className="absolute top-4 right-4 z-[60] bg-white/10 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-md transition-colors pointer-events-auto cursor-pointer"
            >
              <X size={24} />
            </button>
          )}

          {/* The Actual Scalable Container */}
          <div
            className="relative shadow-2xl overflow-hidden bg-black transition-transform duration-300 ease-out origin-center will-change-transform"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              transform: `scale(${scale})`
            }}
          >
            <Renderer />
          </div>

          {!isPresentationMode && (
            <div className="absolute bottom-4 left-4 text-xs text-gray-600 font-mono pointer-events-none">
              {width}x{height} ({(scale * 100).toFixed(0)}%)
            </div>
          )}
        </div>

        {/* Editor Sidebar */}
        {!isPresentationMode && (
          <div className="w-96 border-l border-gray-700 bg-[#1e1e1e] flex flex-col shrink-0 z-10">
            <Inspector />
          </div>
        )}
      </div>

      <AudioRenderer />

      {/* 3. TIMELINE */}
      {!isPresentationMode && (
        <div className="h-80 border-t border-gray-700 bg-[#1e1e1e] shrink-0 z-20">
          <Timeline />
        </div>
      )}

      {showSettings && <ProjectSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;