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

    // --- CACHES ---
    const frameCache = useRef<Record<string, any>>({});
    const logicCache = useRef<Record<string, Function>>({});

    // Reset frame cache every render
    frameCache.current = {};

    // --- UTILS HELPER ---
    // Injected into User Code as 'utils'. 
    // Useful for complex math or path following without cluttering the logic.
    const utils = {
        followPath: (t: number, path: any[]) => {
            if (!path || path.length === 0) return { x: 0, y: 0 };
            
            // Boundary checks
            if (t <= path[0].t) return { x: path[0].x, y: path[0].y };
            if (t >= path[path.length - 1].t) return { x: path[path.length - 1].x, y: path[path.length - 1].y };

            // Linear Interpolation
            for (let i = 0; i < path.length - 1; i++) {
                const p1 = path[i];
                const p2 = path[i+1];
                if (t >= p1.t && t < p2.t) {
                    const progress = (t - p1.t) / (p2.t - p1.t);
                    return { 
                        x: p1.x + (p2.x - p1.x) * progress,
                        y: p1.y + (p2.y - p1.y) * progress 
                    };
                }
            }
            return { x: 0, y: 0 };
        }
    };

    // --- QUERY HELPER ---
    const query = (id: string) => {
        if (frameCache.current[id]) return frameCache.current[id];
        const target = project.objects.find(o => o.id === id);
        if (target) return computeState(target, currentTime);
        return null;
    };

    // --- CORE ENGINE ---
    const computeState = (obj: any, t: number) => {
        // Return cached frame result if available
        if (frameCache.current[obj.id]) return frameCache.current[obj.id];

        // 1. BASE LOGIC EXECUTION
        // Start with static properties as the base state
        let currentState = { ...obj.properties };
        
        try {
            let logicFn = logicCache.current[obj.logic];
            if (!logicFn) {
                // Compile Base Logic
                // Inject: utils, query, ease (GSAP)
                logicFn = new Function('t', 'start', 'duration', 'props', 'query', 'ease', 'utils', obj.logic);
                logicCache.current[obj.logic] = logicFn;
            }
            
            const baseResult = logicFn(t, obj.start, obj.duration, obj.properties, query, gsap, utils);
            
            // Merge base result
            if (baseResult && typeof baseResult === 'object') {
                Object.assign(currentState, baseResult);
            }
        } catch (err) { 
            // Silently fail base logic (could log to a console panel in future)
        }

        // 2. NUDGE MIDDLEWARE PIPELINE
        // Apply active patches on top of the base state
        if (obj.nudges && obj.nudges.length > 0) {
            
            // Filter: Active & Within Time Window
            const activeNudges = obj.nudges.filter((n: any) => 
                n.active !== false && 
                t >= n.start && 
                t < (n.start + n.duration)
            );

            // Execute sequentially (Pipeline)
            activeNudges.forEach((nudge: any) => {
                try {
                    let nudgeFn = logicCache.current[nudge.logic];
                    if (!nudgeFn) {
                        // Compile Nudge Logic
                        // Inject: 'prev' (The state so far)
                        nudgeFn = new Function('t', 'start', 'duration', 'props', 'prev', 'utils', nudge.logic);
                        logicCache.current[nudge.logic] = nudgeFn;
                    }
                    
                    // Run the Patch
                    const patch = nudgeFn(t, nudge.start, nudge.duration, obj.properties, currentState, utils);
                    
                    // Apply the Patch
                    if (patch && typeof patch === 'object') {
                        Object.assign(currentState, patch);
                    }
                } catch (e) {
                    // console.warn(`Nudge ${nudge.name} failed`, e);
                }
            });
        }
        
        // Cache and Return
        frameCache.current[obj.id] = currentState;
        return currentState;
    };

    // --- RENDER STAGE ---
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
                // Visibility Culling
                // Note: We use base start/duration. Nudges technically could extend this, 
                // but standard practice is to respect the object's main lifespan.
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
                        // Stop propagation so clicking an object selects it, not the stage
                        onClick={(e) => { e.stopPropagation(); selectObject(obj.id); }}
                        style={{
                            position: 'absolute',
                            ...state, 
                            border: isSelected ? '1px dashed #00ff00' : 'none',
                            cursor: 'pointer', // Or 'grab' if you re-add drag handlers
                            userSelect: 'none'
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