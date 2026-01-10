import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface RenderProps {
  object: any;       // The raw object from the store
  state: any;        // The calculated CSS/JS state for this frame
}

export type FieldType = 'text' | 'number' | 'color' | 'textarea' | 'range' | 'readonly';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  props?: Record<string, any>; // min, max, step, etc.
}

export interface ObjectDefinition {
  type: string;
  label: string;
  icon: LucideIcon;
  category: 'media' | 'shape' | 'diagram' | 'special'; 
  
  // Factory: Returns the default data structure for a new object
  create: () => {
    name: string;
    duration: number;
    properties: Record<string, any>;
    logic: string;
  };

  // Component: The React component that renders on the Stage
  Component: React.FC<RenderProps>;

  // Fields: Defines what shows up in the Inspector panel
  fields: FieldDef[];
}