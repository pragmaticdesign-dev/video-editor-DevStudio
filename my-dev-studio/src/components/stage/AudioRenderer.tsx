// src/components/stage/AudioRenderer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';

// 1. Create a global AudioContext (Singleton)
// Browsers limit the number of contexts, so we reuse one.
const getAudioContext = () => {
    const Win = window as any;
    const ctx = new (Win.AudioContext || Win.webkitAudioContext)();
    return ctx;
};

// Global context reference (lazy init)
let audioCtx: AudioContext | null = null;

export const AudioRenderer: React.FC = () => {
    const objects = useStore((state) => state.project.objects);
    const currentTime = useStore((state) => state.currentTime);
    const isPlaying = useStore((state) => state.isPlaying);

    // Initialize Context on first user interaction (browser policy)
    useEffect(() => {
        if (!audioCtx && isPlaying) {
            audioCtx = getAudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended' && isPlaying) {
            audioCtx.resume();
        }
    }, [isPlaying]);

    const audioObjects = objects.filter(o => o.type === 'audio');

    return (
        <div className="hidden">
            {audioObjects.map(obj => (
                <WebAudioTrack 
                    key={obj.id} 
                    obj={obj} 
                    currentTime={currentTime} 
                    globalPlaying={isPlaying} 
                />
            ))}
        </div>
    );
};

const WebAudioTrack: React.FC<{ obj: any, currentTime: number, globalPlaying: boolean }> = ({ obj, currentTime, globalPlaying }) => {
    const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
    const activeSource = useRef<AudioBufferSourceNode | null>(null);
    const lastTimeRef = useRef(currentTime);
    
    // 1. LOAD AUDIO BUFFER (Run once when src changes)
    useEffect(() => {
        if (!obj.properties.src) return;

        const load = async () => {
            try {
                if (!audioCtx) audioCtx = getAudioContext();
                
                // Fetch the blob/file
                const response = await fetch(obj.properties.src);
                const arrayBuffer = await response.arrayBuffer();
                
                // Decode raw audio data
                const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
                setBuffer(decodedAudio);
                console.log(`[Audio] Loaded ${obj.name} (${decodedAudio.duration.toFixed(2)}s)`);
            } catch (e) {
                console.error("Failed to load audio", e);
            }
        };
        load();
    }, [obj.properties.src]);

    // 2. CALCULATE LOGIC STATE
    let state: any = { volume: 1, playbackRate: 1 };
    try {
        const logicFn = new Function('t', 'start', 'duration', 'props', obj.logic);
        const result = logicFn(currentTime, obj.start, obj.duration, obj.properties);
        if (result && typeof result === 'object') {
            state = { ...state, ...result };
        }
    } catch (e) { /* ignore */ }

    // 3. PLAYBACK ENGINE
    useEffect(() => {
        if (!buffer || !audioCtx) return;

        // --- CALCULATE TARGET OFFSET ---
        const start = Number(state.start ?? obj.start ?? 0);
        const duration = Number(state.duration ?? obj.duration ?? 0);
        
        // Determine exactly where in the file we should be
        let targetFileTime = 0;
        
        if (typeof state.time === 'number') {
            // User Logic Override: "return { time: t + 5 }"
            targetFileTime = state.time;
        } else {
            // Standard Timeline Sync
            const offset = Number(state.offset ?? obj.properties.offset ?? 0);
            targetFileTime = Math.max(0, (currentTime - start) + offset);
        }

        const isActive = (currentTime >= start) && (currentTime <= start + duration);
        
        // Detect "Seek" (Did time jump significantly?)
        const dt = Math.abs(currentTime - lastTimeRef.current);
        const isSeeking = dt > 0.2; // If frame delta > 0.2s, it's a seek/scrub
        lastTimeRef.current = currentTime;

        // --- SCHEDULING ---
        
        if (isActive && globalPlaying) {
            
            // CASE A: Start Playing (or Restart after Seek)
            // We start a NEW source node. (Source nodes are fire-and-forget, one-time use)
            if (!activeSource.current || isSeeking) {
                
                // Stop previous if exists
                if (activeSource.current) {
                    try { activeSource.current.stop(); } catch(e) {}
                    activeSource.current = null;
                }

                // Create Player
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                
                // Gain Node (Volume)
                const gainNode = audioCtx.createGain();
                gainNode.gain.value = state.volume ?? 1;
                
                // Connect: Source -> Gain -> Master
                source.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                source.playbackRate.value = state.playbackRate ?? 1;

                // PLAY!
                // param 1: When to start (0 = now)
                // param 2: Where in the file to start (offset)
                source.start(0, targetFileTime);
                
                activeSource.current = source;
                console.log(`[WebAudio] Start ${obj.name} at ${targetFileTime.toFixed(2)}s`);
            }
            // CASE B: Already Playing
            // Web Audio handles the timing automatically. We don't update it every frame.
            // We only update Volume/Rate live.
            else {
                // (Optional) Update volume live if using a GainNode ref
                // activeSource.current.playbackRate.value = state.playbackRate; 
            }

        } else {
            // STOP (Paused or Out of Bounds)
            if (activeSource.current) {
                try { activeSource.current.stop(); } catch(e) {}
                activeSource.current = null;
            }
        }

        // Cleanup on unmount or strict pause
        return () => {
             // We don't stop strictly here because 'useEffect' runs every frame 
             // and we want audio to persist across renders unless paused.
             // But if 'globalPlaying' turns false, the 'else' block above handles the stop.
        };

    }, [currentTime, globalPlaying, buffer, state.time, state.offset]); // Re-run if playback state or logic time changes

    return null; // No DOM elements needed!
};