// src/types/schema.ts

export type ObjectType = 'div' | 'img' | 'text';

export interface VisualObject {
  id: string;
  type: ObjectType;
  name: string; // Display name in timeline
  content: string; // Inner Text or Image URL
  start: number; // Seconds
  duration: number; // Seconds
  // The raw JS code that returns CSS
  // Signature: (t: number, start: number, duration: number) => CSSProperties
  logic: string; 
}

export interface ProjectSchema {
  meta: {
    duration: number; // Total video length
    fps: number;
  };
  objects: VisualObject[];
  audioSrc?: string; // Global audio file URL
}