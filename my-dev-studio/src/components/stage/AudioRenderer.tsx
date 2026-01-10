import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';

export const AudioRenderer: React.FC = () => {
    const objects = useStore((state) => state.project.objects);
    const currentTime = useStore((state) => state.currentTime);
    const isPlaying = useStore((state) => state.isPlaying);

    // Filter only audio objects
    const audioObjects = objects.filter(o => o.type === 'audio');

    return (
        <div className="hidden">
            {audioObjects.map(obj => (
                <AudioTrack 
                    key={obj.id} 
                    obj={obj} 
                    currentTime={currentTime} 
                    globalPlaying={isPlaying} 
                />
            ))}
        </div>
    );
};

// Individual Track Component
const AudioTrack: React.FC<{ obj: any, currentTime: number, globalPlaying: boolean }> = ({ obj, currentTime, globalPlaying }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    // 1. Calculate State based on Logic
    let state = { volume: 1, playbackRate: 1 };
    try {
        const logicFn = new Function('t', 'start', 'duration', 'props', obj.logic);
        const result = logicFn(currentTime, obj.start, obj.duration, obj.properties);
        if (result && typeof result === 'object') state = { ...state, ...result };
    } catch (e) { /* ignore */ }

    // 2. Sync Audio Element
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // A. Check if within time range
        const end = obj.start + obj.duration;
        const isActive = currentTime >= obj.start && currentTime <= end;

        // B. Properties
        audio.volume = Math.max(0, Math.min(1, state.volume ?? 1));
        audio.playbackRate = state.playbackRate ?? 1;

        // C. Playback Sync
        if (isActive) {
            // Calculate where the audio SHOULD be (relative time)
            const targetTime = currentTime - obj.start;
            
            // Sync time if drifted (or scrubbing)
            if (Math.abs(audio.currentTime - targetTime) > 0.2) {
                audio.currentTime = targetTime;
            }

            // Play/Pause
            if (globalPlaying && audio.paused) {
                audio.play().catch(e => console.log("Autoplay prevented", e));
            } else if (!globalPlaying && !audio.paused) {
                audio.pause();
            }
        } else {
            // Out of bounds: stop
            if (!audio.paused) audio.pause();
            if (audio.currentTime !== 0) audio.currentTime = 0;
        }

    }, [currentTime, globalPlaying, obj.start, obj.duration, state.volume, state.playbackRate]);

    return <audio ref={audioRef} src={obj.properties.src} preload="auto" />;
};