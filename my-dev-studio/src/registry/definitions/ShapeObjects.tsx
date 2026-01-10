import React from 'react';
import { Box, Circle } from 'lucide-react';
import type { ObjectDefinition, RenderProps } from '../types';

// --- BOX ---
const BoxComponent: React.FC<RenderProps> = ({ state }) => (
  <div className="w-full h-full bg-current" 
       style={{ backgroundColor: state.color, borderRadius: state.borderRadius, ...state }} />
);

export const BoxObject: ObjectDefinition = {
  type: 'box',
  label: 'Rectangle',
  icon: Box,
  category: 'shape',
  create: () => ({
    name: 'Rect',
    duration: 4,
    properties: { color: '#3b82f6', borderRadius: '0px' },
    logic: `return { width: '100%', height: '100%' }`
  }),
  Component: BoxComponent,
  fields: [
    { key: 'color', label: 'Fill Color', type: 'color' },
    { key: 'borderRadius', label: 'Radius', type: 'text' },
  ]
};

// --- CIRCLE ---
const CircleComponent: React.FC<RenderProps> = ({ state }) => (
  <div className="w-full h-full rounded-full bg-current" 
       style={{ backgroundColor: state.color, ...state }} />
);

export const CircleObject: ObjectDefinition = {
  type: 'circle',
  label: 'Circle',
  icon: Circle,
  category: 'shape',
  create: () => ({
    name: 'Circle',
    duration: 4,
    properties: { color: '#ef4444' },
    logic: `return { width: '100%', height: '100%' }`
  }),
  Component: CircleComponent,
  fields: [
    { key: 'color', label: 'Fill Color', type: 'color' },
  ]
};