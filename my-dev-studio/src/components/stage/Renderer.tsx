// src/components/stage/Renderer.tsx
import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';

export const Renderer: React.FC = () => {
  // We subscribe to specific parts of the store for performance
  const objects = useStore((state) => state.project.objects);
  const currentTime = useStore((state) => state.currentTime);
  const selectObject = useStore((state) => state.selectObject); 
  const selectedId = useStore((state) => state.selectedObjectId); 
  return (
    <div className="relative w-full h-full bg-black overflow-hidden"
    onClick={() => selectObject(null)}
    >
        
      {objects.map((obj) => {
        // 1. Lifecycle Check: Should this exist right now?
        const end = obj.start + obj.duration;
        if (currentTime < obj.start || currentTime > end) {
          return null; // Don't render
        }

        // 2. Logic Execution
        let style: React.CSSProperties = {};
        const isSelected = selectedId === obj.id;

        try {
          // Create the sandbox function
          // Note: In production, you might want to cache these functions 
          // instead of recreating new Function() every frame if performance drops.
          const logicFn = new Function('t', 'start', 'duration', obj.logic);
          
          // Execute user code
          const result = logicFn(currentTime, obj.start, obj.duration);
          
          if (result && typeof result === 'object') {
            style = result;
          }
        } catch (err) {
          // Fail silently in renderer, or log to a debug console
          // console.warn(`Error in object ${obj.id}:`, err);
        }

        // 3. Render DOM
        return (
          <div
            key={obj.id}
            id={obj.id}
            onClick={(e) => {
              e.stopPropagation(); // Stop background click
              selectObject(obj.id); // Select this object
            }}
            style={{
              position: 'absolute',
              ...style, // Apply the user's calculated CSS
              // Add a visual border when selected so we know it worked
              border: isSelected ? '2px solid #00ff00' : 'none', 
              cursor: 'pointer'
            }}
            className="will-change-transform" // Performance hint for browser
          >
            {obj.type === 'img' ? (
              <img src={obj.content} alt={obj.name} className="w-full h-full object-cover" />
            ) : (
              <div className="p-2 whitespace-pre-wrap">{obj.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};