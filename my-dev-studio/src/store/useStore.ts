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
  removeObject: (id: string) => void; // <--- NEW ACTION
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
    meta: { duration: 10, fps: 60 , width: 1920, 
      height: 1080 },
    objects: [
      // 1. THE STAGE OBJECT (Default)
      {
        id: 'stage_main',
        type: 'stage',
        name: 'Stage (Camera)',
        start: 0,
        duration: 9999, // Effectively infinite
        properties: { 
          background: '#000000', 
          zoom: 1,
          x: 0, 
          y: 0 
        },
        logic: `return {
  backgroundColor: props.background,
  transform: \`scale(\${props.zoom}) translate(\${props.x}px, \${props.y}px)\`,
  transformOrigin: 'center center'
}`
      },
      // 2. Demo Text
      {
        id: 'demo_text',
        type: 'text',
        name: 'Demo Text',
        start: 0.5,
        duration: 3.0,
        properties: { text: 'Hello World', fontSize: 40, color: '#ffffff' },
        logic: `const p = (t - start) / duration;
return {
  opacity: p,
  transform: \`translate(\${p * 50}px, 0px)\`,
  color: props.color,
  fontSize: props.fontSize + 'px',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};`
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

  removeObject: (id) => set((state) => ({
    project: {
      ...state.project,
      // Prevent deleting the stage!
      objects: state.project.objects.filter((o) => o.id !== id || o.type === 'stage')
    },
    selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId
  })),
}));