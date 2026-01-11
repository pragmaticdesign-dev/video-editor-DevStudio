// src/types/schema.ts

export type ObjectType = 
  | 'text' 
  | 'img' 
  | 'box'      // Basic Rectangle
  | 'circle'   // Basic Circle
  | 'arrow'    // SVG Arrow
  | 'line'     // SVG Line
  | 'cylinder' // Database/Storage symbol
  | 'rhombus'  // Decision point
  | 'parallelogram'
  | 'audio'
  | 'custom_html'
  | 'stage'; // I/O


  export interface Nudge {
  id: string;
  name: string;        // e.g., "Manual Shift", "Glitch Effect"
  start: number;       // Activation time
  duration: number;    // How long it lasts (9999 for infinite)
  logic: string;       // The patch code: (t, props, prev) => style
  active: boolean;     // Toggle for quick debugging
}

export interface VisualObject {
  id: string;
  type: ObjectType;
  name: string;
  start: number;
  duration: number;
  
  // The flexible storage for specific data (text, src, color, etc.)
  properties: {
    [key: string]: any; 
  };

  // The logic string that receives (t, start, duration, props)
  logic: string; 

  // The Middleware Stack
  nudges: Nudge[];
}

export interface ProjectSchema {
  name: string;
  meta: {
    duration: number; 
    fps: number;
    width: number;  
    height: number; 
  };
  objects: VisualObject[];
  audioSrc?: string; 
}