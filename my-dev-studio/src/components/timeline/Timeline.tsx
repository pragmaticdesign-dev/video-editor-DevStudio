import React, { useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { TrackBar } from './TrackBar';
import { TimelineControls } from './Controls'; // <--- Import

export const Timeline: React.FC = () => {
  const project = useStore((state) => state.project);
  const currentTime = useStore((state) => state.currentTime);
  const setTime = useStore((state) => state.setTime);
  const setIsPlaying = useStore((state) => state.setIsPlaying);

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom] = useState(100); // 100px = 1 second

  // Handle Scrubbing (Clicking on ruler/timeline)
  const handleScrub = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left + containerRef.current.scrollLeft;
    const newTime = Math.max(0, offsetX / zoom);
    
    setIsPlaying(false); // Stop playing when user drags
    setTime(newTime);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] select-none text-white">
      
      <TimelineControls />

      {/* 1. RULER (Clickable) */}
      <div 
        className="h-8 bg-[#252526] border-b border-[#333] relative overflow-hidden cursor-crosshair"
        onClick={handleScrub}
      >
        {/* Simple ticks every second */}
        {Array.from({ length: Math.ceil(project.meta.duration) }).map((_, i) => (
          <div 
            key={i} 
            className="absolute top-0 bottom-0 border-l border-gray-600 text-[10px] pl-1 text-gray-500"
            style={{ left: `${i * zoom}px` }}
          >
            {i}s
          </div>
        ))}
      </div>

      {/* 2. TRACKS AREA (Scrollable) */}
      <div 
        className="flex-1 relative overflow-x-auto overflow-y-auto p-4"
        ref={containerRef}
        onClick={handleScrub} // Allow scrubbing by clicking empty space too
      >
        {/* THE PLAYHEAD (Red Line) */}
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-10 pointer-events-none"
          style={{ transform: `translateX(${currentTime * zoom}px)` }}
        />

        {/* TRACKS */}
        <div className="min-w-full relative" style={{ width: `${project.meta.duration * zoom + 200}px` }}>
            {project.objects.map((obj) => (
                <TrackBar key={obj.id} object={obj} zoom={zoom} />
            ))}
        </div>
      </div>
    </div>
  );
};