// src/registry/definitions/CustomObject.tsx
import React from 'react';
import { Code2 } from 'lucide-react';
import type { ObjectDefinition, RenderProps } from '../types';

// The Component simply renders the computed CSS + the computed HTML string
const CustomComponent: React.FC<RenderProps> = ({ state }) => (
  <div 
    className="w-full h-full"
    style={{ ...state }} // Apply computed CSS (Flexbox, Grid, Colors, etc.)
    dangerouslySetInnerHTML={{ __html: state.content || '' }} // Inject computed HTML
  />
);

export const CustomObject: ObjectDefinition = {
  type: 'custom_html',
  label: 'Custom Code',
  icon: Code2,
  category: 'special', // We handle the button manually in Controls.tsx
  
  create: () => ({
    name: 'Custom Obj',
    duration: 5,
    properties: {}, 
    // Default Logic Template for the user
    logic: `// 1. Example: A dynamic list (DSA)
// const arr = [10, 20, 50, 30];
// const html = arr.map(n => \`<div style="border:1px solid white; padding:5px">\${n}</div>\`).join('');
// return { display: 'flex', gap: '10px', content: html };

// 2. Example: Connecting to another object (System Design)
// const other = query('my_other_obj_id'); 
// if (!other) return {};
// return { content: \`Target is at \${other.x}, \${other.y}\` };

return { 
  color: 'white',
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  border: '1px dashed #555',
  content: 'Custom HTML Object' 
};`
  }),

  Component: CustomComponent,
  
  // No fixed fields required because everything is done in code!
  fields: [] 
};