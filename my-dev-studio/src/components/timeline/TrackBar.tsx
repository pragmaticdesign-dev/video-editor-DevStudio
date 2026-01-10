import React from 'react';
import type { VisualObject } from '../../types/schema';
import { useStore } from '../../store/useStore';

interface Props {
  object: VisualObject;
  zoom: number; // Pixels per second (e.g., 100px = 1s)
}

export const TrackBar: React.FC<Props> = ({ object, zoom }) => {
  const selectObject = useStore((state) => state.selectObject);
  const selectedId = useStore((state) => state.selectedObjectId);
  
  const isSelected = selectedId === object.id;

  return (
    <div 
      className="relative h-8 mb-2 bg-gray-800 rounded overflow-hidden cursor-pointer group"
      onClick={(e) => {
        e.stopPropagation();
        selectObject(object.id);
      }}
    >
      {/* The Colored Bar */}
      <div 
        className={`absolute top-1 bottom-1 rounded border ${
          isSelected ? 'bg-green-600 border-white' : 'bg-green-800 border-green-900 group-hover:bg-green-700'
        }`}
        style={{
          left: `${object.start * zoom}px`,
          width: `${object.duration * zoom}px`
        }}
      >
        <span className="text-xs text-white px-2 font-mono truncate block leading-6">
          {object.name}
        </span>
      </div>
    </div>
  );
};