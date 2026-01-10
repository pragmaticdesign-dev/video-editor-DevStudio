// src/engine/loop.ts
import { useStore } from '../store/useStore';

let requestID: number;
let lastTime: number = 0;

export const startLoop = () => {
  lastTime = performance.now();
  
  const tick = (now: number) => {
    const state = useStore.getState();

    if (state.isPlaying) {
      // Calculate delta to keep time consistent regardless of frame rate
      const delta = (now - lastTime) / 1000; // convert ms to seconds
      const nextTime = state.currentTime + delta;

      // Loop Logic
      if (nextTime >= state.project.meta.duration) {
        state.setTime(0); // Loop back to start
        // Optional: state.setIsPlaying(false) to stop at end
      } else {
        state.setTime(nextTime);
      }
    }

    lastTime = now;
    requestID = requestAnimationFrame(tick);
  };

  requestID = requestAnimationFrame(tick);
};

export const stopLoop = () => {
  cancelAnimationFrame(requestID);
};