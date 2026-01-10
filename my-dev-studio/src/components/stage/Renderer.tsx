// src/components/stage/Renderer.tsx
import React, { useRef } from 'react';
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
    
    // Reset cache at the start of every render (every frame)
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
            // Note: This works because computeState relies on closure scope.
            return computeState(target, currentTime);
        }
        return null;
    };

    // Helper: Execute User Logic safely
    const computeState = (obj: any, t: number) => {
        // Return cached if available
        if (frameCache.current[obj.id]) return frameCache.current[obj.id];

        const merged = { ...obj.properties };
        try {
            // INJECT 'query' into the function scope
            const logicFn = new Function('t', 'start', 'duration', 'props', 'query', obj.logic);
            const dynamic = logicFn(t, obj.start, obj.duration, obj.properties, query);
            
            if (dynamic && typeof dynamic === 'object') {
                Object.keys(dynamic).forEach((key) => {
                    if (dynamic[key] !== undefined && dynamic[key] !== null) merged[key] = dynamic[key];
                });
            }
        } catch (err) { /* ignore */ }
        
        // Save to cache
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