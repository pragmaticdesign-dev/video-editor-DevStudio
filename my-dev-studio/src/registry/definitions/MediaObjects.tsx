import React from 'react';
import { Type, Image as ImageIcon } from 'lucide-react';
import type { ObjectDefinition, RenderProps } from '../types';

// --- TEXT ---
const TextComponent: React.FC<RenderProps> = ({ state }) => (
  <div className="whitespace-pre-wrap w-full h-full flex items-center justify-center"
    style={{
      color: state.color,
      fontSize: state.fontSize,
      fontWeight: state.fontWeight,
      ...state
    }}>
    {state.text}
  </div>
);

export const TextObject: ObjectDefinition = {
  type: 'text',
  label: 'Text',
  icon: Type,
  category: 'media',
  create: () => ({
    name: 'Text',
    duration: 3,
    properties: { text: 'Hello World', fontSize: 40, color: '#ffffff' },
    logic: `return { 
  opacity: 1, 
  color: props.color,
  fontSize: props.fontSize + 'px',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}`
  }),
  Component: TextComponent,
  fields: [
    { key: 'text', label: 'Content', type: 'textarea' },
    { key: 'fontSize', label: 'Size (px)', type: 'number' },
    { key: 'color', label: 'Color', type: 'color' },
  ]
};

// --- IMAGE ---
// Note: Images usually require a file upload event, handled specially in Controls.tsx
// but we define the base behavior here.
const ImageComponent: React.FC<RenderProps> = ({ state }) => (
    <img src={state.src} className="w-full h-full object-cover" style={{...state}} />
);

export const ImageObject: ObjectDefinition = {
  type: 'img',
  label: 'Image',
  icon: ImageIcon,
  category: 'media',
  create: () => ({
    name: 'Image',
    duration: 5,
    properties: { src: '' }, // populated by uploader
    logic: `const p = (t-start)/duration; 
return { 
  opacity: p < 0.1 ? p*10 : 1, 
  width: '100%', height: '100%', 
  objectFit: 'contain' 
}`
  }),
  Component: ImageComponent,
  fields: [
    { key: 'src', label: 'Source URL', type: 'readonly' }
  ]
};