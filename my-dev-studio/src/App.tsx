// src/App.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Settings, Play, Pause, Monitor, Maximize, X, Download, Upload, FilePlus, Film } from 'lucide-react';
import { startLoop, stopLoop } from './engine/loop';
import { Renderer } from './components/stage/Renderer';
import { useStore } from './store/useStore';
import { Inspector } from './components/editor/Inspector';
import { Timeline } from './components/timeline/Timeline';
import { ProjectSettings } from './components/common/ProjectSettings';
import { AudioRenderer } from './components/stage/AudioRenderer';
import type { ProjectSchema } from './types/schema';
import { useAutosave, AUTOSAVE_KEY } from './hooks/useAutosave'; 

// --- NEW COMPONENT: Time & Frame Display ---
const TimeDisplay = ({ currentTime, setTime, fps }: { currentTime: number, setTime: (t: number) => void, fps: number }) => {
  const [localValue, setLocalValue] = useState(currentTime.toFixed(2));
  const [isEditing, setIsEditing] = useState(false);

  // Sync local input when global time changes (unless user is typing)
  useEffect(() => {
    if (!isEditing) setLocalValue(currentTime.toFixed(2));
  }, [currentTime, isEditing]);

  const handleCommit = () => {
    const val = parseFloat(localValue);
    if (!isNaN(val) && val >= 0) {
      setTime(val);
    } else {
      setLocalValue(currentTime.toFixed(2)); // Revert if invalid
    }
    setIsEditing(false);
  };

  // Calculate current frame
  const currentFrame = Math.floor(currentTime * fps);

  return (
    <div className="flex items-center gap-2">
      {/* 1. Time Input (Editable) */}
      <div className="bg-black px-2 py-1 rounded border border-gray-700 flex items-center gap-1">
        <input 
          className="bg-transparent font-mono text-xl text-blue-400 w-[80px] text-center outline-none border-b border-transparent focus:border-blue-500 transition-colors"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={handleCommit}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
        <span className="text-xs text-gray-500 font-mono select-none">s</span>
      </div>

      {/* 2. Frame Counter */}
      <div className="bg-[#111] px-2 py-1.5 rounded border border-gray-800 flex items-center gap-2" title={`Project FPS: ${fps}`}>
        <Film size={12} className="text-yellow-600" />
        <span className="font-mono text-sm text-yellow-500 min-w-[40px] text-right">
          {currentFrame}
        </span>
        <span className="text-[10px] text-gray-600 font-bold">FR</span>
      </div>
    </div>
  );
};

function App() {
  const { isPlaying, setIsPlaying, currentTime, selectObject, selectedObjectId, project, setTime, loadProject, createNewProject } = useStore();
  const [showSettings, setShowSettings] = useState(false);

  // --- ACTIVATE AUTOSAVE ---
  useAutosave(); 
  // -------------------------

  // --- PRESENTATION MODE STATE ---
  const [isPresentationMode, setPresentationMode] = useState(false);
  const [scale, setScale] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Hidden input for file upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Destructure FPS from meta (default to 60 if missing)
  const { width, height, fps = 60 } = project.meta;

  // --- HANDLER: CREATE NEW PROJECT ---
  const handleNewProject = () => {
    if (confirm('Create new project? Unsaved changes will be lost.')) {
        localStorage.removeItem(AUTOSAVE_KEY);
        createNewProject();
    }
  };

  // --- SAVE / LOAD HANDLERS ---
  const handleSaveProject = () => {
    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const safeName = (project.name || 'Untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeName}.devstudio.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsed: ProjectSchema = JSON.parse(json);
        
        if(parsed.meta && Array.isArray(parsed.objects)) {
          loadProject(parsed);
          alert(`Project "${parsed.name || 'Untitled'}" loaded!`);
        } else {
          alert('Error: Invalid project file format.');
        }
      } catch (err) {
        console.error(err);
        alert('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 1. Unified Smart Scaling Logic
  useEffect(() => {
    const handleResize = () => {
      if (isPresentationMode) {
        const scaleX = window.innerWidth / width;
        const scaleY = window.innerHeight / height;
        setScale(Math.min(scaleX, scaleY) * 0.95);
      } else {
        const availableW = containerRef.current?.clientWidth || (window.innerWidth - 384); 
        const availableH = containerRef.current?.clientHeight || (window.innerHeight - 320 - 56);
        const scaleX = (availableW - 40) / width;
        const scaleY = (availableH - 40) / height;
        setScale(Math.min(scaleX, scaleY));
      }
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPresentationMode, width, height]);

  // 2. Keyboard Shortcuts 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.code === 'KeyK') {
         e.preventDefault();
         setIsPlaying(!useStore.getState().isPlaying);
         return;
      }

      if (isCmdOrCtrl && e.code === 'KeyS') {
        e.preventDefault();
        handleSaveProject();
        return;
      }

      if (isCmdOrCtrl && e.code === 'Enter') {
          e.preventDefault(); 
          setTime(0);
          return;
      }

      const target = e.target as HTMLElement;
      const isTyping = ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;
      if (isTyping) return;

      switch (e.code) {
        case 'Escape':
          if (isPresentationMode) setPresentationMode(false);
          break;
        case 'Home':       
          e.preventDefault(); 
          setTime(0);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, project]);
  
  useEffect(() => {
    startLoop();
    return () => stopLoop();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden font-sans">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleOpenProject} 
        accept=".json" 
        className="hidden" 
      />

      {/* 1. TOOLBAR */}
      {!isPresentationMode && (
        <div className="h-14 border-b border-gray-700 flex items-center px-4 justify-between bg-[#1e1e1e] shrink-0">
          <div className="flex items-center gap-4">
            
            <div className="flex items-center gap-1 mr-4 border-r border-gray-700 pr-4">
              <button
                onClick={handleNewProject}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 border border-blue-400"
                title="Create New Project"
              >
                <FilePlus size={14} /> NEW
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600"
                title="Open Project"
              >
                <Upload size={14} /> OPEN
              </button>
              <button
                onClick={handleSaveProject}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600"
                title="Save Project (Ctrl+S)"
              >
                <Download size={14} /> SAVE
              </button>
            </div>

            <button
              className={`flex items-center gap-2 px-6 py-1.5 rounded font-bold text-sm transition-all ${isPlaying
                  ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white'
                  : 'bg-green-500/10 text-green-500 border border-green-500/50 hover:bg-green-500 hover:text-white'
                }`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>

            <button
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-bold border border-gray-600"
              onClick={() => setTime(0)}
            >
              RESET
            </button>

            {/* EDITED: TimeDisplay with FPS Frame Counter */}
            <TimeDisplay currentTime={currentTime} setTime={setTime} fps={fps} />

          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPresentationMode(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
            >
              <Maximize size={14} /> PRESENT
            </button>

            <button
              onClick={() => selectObject('stage_main')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${selectedObjectId === 'stage_main'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <Monitor size={14} /> STAGE
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