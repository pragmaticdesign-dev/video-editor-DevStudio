// src/store/useStore.ts
import { create } from 'zustand';
import type { ProjectSchema, VisualObject } from '../types/schema';

interface EditorState {
  // 1. Playback State
  currentTime: number;
  isPlaying: boolean;
  
  // 2. Project Data
  project: ProjectSchema;
  selectedObjectId: string | null;

  // 3. Actions
  setTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  selectObject: (id: string | null) => void;
  
  // CRUD Actions for Objects
  addObject: (obj: VisualObject) => void;
  updateObject: (id: string, payload: Partial<VisualObject>) => void;
}

const DEFAULT_LOGIC = `
// Default Fade-In & Slide
const p = (t - start) / duration;
return {
  opacity: p,
  transform: \`translate(\${p * 50}px, 0px)\`
};
`;

export const useStore = create<EditorState>((set) => ({
  currentTime: 0,
  isPlaying: false,
  selectedObjectId: null,

  project: {
    meta: { duration: 10, fps: 60 },
    objects: [
      {
        id: 'demo_text',
        type: 'text',
        name: 'Demo Text',
        content: 'Hello World',
        start: 0.5,
        duration: 3.0,
        logic: DEFAULT_LOGIC
      }
    ]
  },

  setTime: (time) => set({ currentTime: time }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  selectObject: (id) => set({ selectedObjectId: id }),

  addObject: (obj) => set((state) => ({
    project: {
      ...state.project,
      objects: [...state.project.objects, obj]
    }
  })),

  updateObject: (id, payload) => set((state) => ({
    project: {
      ...state.project,
      objects: state.project.objects.map((o) => 
        o.id === id ? { ...o, ...payload } : o
      )
    }
  })),
}));