// src/registry/index.ts
import { TextObject, ImageObject } from './definitions/MediaObjects';
import { BoxObject, CircleObject } from './definitions/ShapeObjects';
import { ArrowObject, LineObject, CylinderObject, RhombusObject, ParallelogramObject } from './definitions/DiagramObjects';
import { StageObject, AudioObject } from './definitions/SpecialObjects';
import { CustomObject } from './definitions/CustomObject'; // <--- Import
import type { ObjectDefinition } from './types';

export const OBJECT_REGISTRY: Record<string, ObjectDefinition> = {
  [TextObject.type]: TextObject,
  [ImageObject.type]: ImageObject,
  [BoxObject.type]: BoxObject,
  [CircleObject.type]: CircleObject,
  [ArrowObject.type]: ArrowObject,
  [LineObject.type]: LineObject,
  [CylinderObject.type]: CylinderObject,
  [RhombusObject.type]: RhombusObject,
  [ParallelogramObject.type]: ParallelogramObject,
  [StageObject.type]: StageObject,
  [AudioObject.type]: AudioObject,
  [CustomObject.type]: CustomObject, // <--- Register
};

// Helper for UI generation
export const AVAILABLE_OBJECTS = Object.values(OBJECT_REGISTRY).filter(o => o.category !== 'special');

export const getDefinition = (type: string): ObjectDefinition | undefined => OBJECT_REGISTRY[type];