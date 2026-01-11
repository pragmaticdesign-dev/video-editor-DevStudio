// src/engine/loop.ts
import { useStore } from '../store/useStore';

let requestID: number;
let lastTime: number = 0;

export const startLoop = () => {
  // Initialize lastTime to now to prevent a huge delta on the first frame
  lastTime = performance.now();

  const tick = (now: number) => {
    const state = useStore.getState();

    // 1. Calculate Real-World Delta (Seconds)
    // We strictly use performance.now() to track real time.
    let delta = (now - lastTime) / 1000;

    // 2. Safety Cap (Lag Protection)
    // If the browser hangs or tab is inactive, delta could be huge (e.g., 5 seconds).
    // We cap it at 0.1s (10fps equivalent) to prevent the timeline from "teleporting".
    if (delta > 0.1) delta = 0.1; 

    if (state.isPlaying) {
      const nextTime = state.currentTime + delta;

      // 3. Loop / Stop Logic
      if (nextTime >= state.project.meta.duration) {
        state.setTime(0); // Loop back to start
        // Optional: state.setIsPlaying(false); // Uncomment to stop at end instead of looping
      } else {
        state.setTime(nextTime);
      }
    }

    // Always update lastTime for the next frame
    lastTime = now;
    requestID = requestAnimationFrame(tick);
  };

  requestID = requestAnimationFrame(tick);
};

export const stopLoop = () => {
  cancelAnimationFrame(requestID);
};