// src/components/stage/Renderer.tsx
import React, { useRef } from 'react';
import gsap from 'gsap'; 
import { useStore } from '../../store/useStore';
import { getDefinition } from '../../registry';

export const Renderer: React.FC = () => {
    const { project, currentTime, selectObject, selectedObjectId } = useStore();
    
    // Separate Stage from Children
    const stageObj = project.objects.find(o => o.type === 'stage');
    const childObjects = project.objects.filter(o => o.type !== 'stage' && o.type !== 'audio');

    // --- GLOBAL FRAME CACHE ---
    // Stores the calculated CSS/State for every object in the current frame.
    // This allows Object A to 'query' Object B's state without recalculating it 100 times.
    const frameCache = useRef<Record<string, any>>({});
    
    // --- LOGIC CACHE ---
    // Stores compiled functions to avoid 'new Function' overhead on every frame.
    // Key = The logic string itself. If the string doesn't change, we reuse the compiled function.
    const logicCache = useRef<Record<string, Function>>({});

    // Reset frame cache at the start of every render (every frame)
    frameCache.current = {};

    // --- QUERY HELPER ---
    // This function is injected into the user's Logic code.
    // It allows them to write: const box = query('box_123');
    const query = (id: string) => {
        // 1. If we already calculated it this frame, return it.
        if (frameCache.current[id]) {
            return frameCache.current[id];
        }

        // 2. Otherwise, find the object and force a calculation.
        const target = project.objects.find(o => o.id === id);
        if (target) {
            // Recursively call computeState.
            return computeState(target, currentTime);
        }
        return null;
    };

    // Helper: Execute User Logic safely & Efficiently
    const computeState = (obj: any, t: number) => {
        // Return cached frame result if available
        if (frameCache.current[obj.id]) return frameCache.current[obj.id];

        const merged = { ...obj.properties };
        
        try {
            // 1. CHECK CACHE: Have we compiled this exact code string before?
            let logicFn = logicCache.current[obj.logic];
            
            if (!logicFn) {
                // Compile ONLY if not in cache
                // We inject 'ease' (GSAP) into the scope here
                logicFn = new Function('t', 'start', 'duration', 'props', 'query', 'ease', obj.logic);
                logicCache.current[obj.logic] = logicFn;
            }

            // 2. EXECUTE: Run the compiled function
            const dynamic = logicFn(t, obj.start, obj.duration, obj.properties, query, gsap);
            
            if (dynamic && typeof dynamic === 'object') {
                Object.keys(dynamic).forEach((key) => {
                    if (dynamic[key] !== undefined && dynamic[key] !== null) merged[key] = dynamic[key];
                });
            }
        } catch (err) { 
            // Silently fail on user code errors to keep the editor running
            // In a real app, we might want to log this to a 'Console' panel
        }
        
        // Save to frame cache
        frameCache.current[obj.id] = merged;
        return merged;
    };

    // 1. Render Stage Container
    let stageStyle: React.CSSProperties = { backgroundColor: '#000', overflow: 'hidden' };
    if (stageObj) {
        const result = computeState(stageObj, currentTime);
        stageStyle = {
            ...stageStyle,
            backgroundColor: result.background,
            transform: `scale(${result.zoom || 1}) translate(${result.x || 0}px, ${result.y || 0}px)`,
            transformOrigin: 'center center'
        };
    }

    return (
        <div 
            className="relative w-full h-full"
            style={stageStyle} 
            onClick={() => selectObject(stageObj?.id || null)}
        >
            {childObjects.map((obj) => {
                const end = obj.start + obj.duration;
                // Simple visibility culling
                if (currentTime < obj.start || currentTime > end) return null;

                const isSelected = selectedObjectId === obj.id;
                const state = computeState(obj, currentTime);
                const Def = getDefinition(obj.type);

                if (!Def) return null;

                return (
                    <div
                        key={obj.id}
                        id={obj.id}
                        onClick={(e) => { e.stopPropagation(); selectObject(obj.id); }}
                        style={{
                            position: 'absolute',
                            ...state, 
                            border: isSelected ? '1px dashed #00ff00' : 'none',
                            cursor: 'pointer'
                        }}
                        className="will-change-transform"
                    >
                        <Def.Component object={obj} state={state} />
                    </div>
                );
            })}
        </div>
    );
};