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