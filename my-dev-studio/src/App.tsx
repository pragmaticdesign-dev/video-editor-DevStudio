// src/App.tsx
import React, { useEffect } from 'react';
import { startLoop, stopLoop } from './engine/loop';
import { Renderer } from './components/stage/Renderer';
import { useStore } from './store/useStore';
import { Inspector } from './components/editor/Inspector';
import { Timeline } from './components/timeline/Timeline'; 

function App() {
  const { isPlaying, setIsPlaying, currentTime } = useStore();

  // Initialize Engine Loop on Mount
  useEffect(() => {
    startLoop();
    return () => stopLoop();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      
      {/* 1. TOOLBAR (Top) */}
      <div className="h-12 border-b border-gray-700 flex items-center px-4 gap-4 bg-gray-900 shrink-0">
        <button 
          className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-500 text-sm font-bold transition-colors"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <span className="font-mono text-xl text-blue-400 min-w-[80px]">
          {currentTime.toFixed(2)}s
        </span>
      </div>

      {/* 2. MAIN WORKSPACE (Middle) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: STAGE (Flexible Width) */}
        <div className="flex-1 bg-gray-800 relative flex items-center justify-center overflow-hidden">
          {/* The 16:9 Container 
             We force a specific aspect ratio here.
          */}
          <div 
            className="relative bg-black shadow-2xl border border-gray-600"
            style={{ width: '960px', height: '540px' }}
          >
            <Renderer />
          </div>
        </div>

        {/* RIGHT: INSPECTOR (Fixed Width) */}
        <div className="w-96 border-l border-gray-700 bg-gray-900 flex flex-col shrink-0">
          <Inspector />
        </div>
      </div>

      {/* 3. TIMELINE (Bottom, Fixed Height) */}
      <div className="h-72 border-t border-gray-700 bg-gray-900 shrink-0">
       <Timeline />
      </div>
    </div>
  );
}

export default App;