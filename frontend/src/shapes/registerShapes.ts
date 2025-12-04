import { registerBasicShapes, basicShapeDefinitions } from './basicShapes';
import { registerFlowchartShapes, flowchartShapeDefinitions } from './flowchartShapes';
import type { ShapeCategory, ShapeDefinition } from '@/types';

export function registerAllShapes() {
  registerBasicShapes();
  registerFlowchartShapes();
}

export const shapeCategories: ShapeCategory[] = [
  {
    id: 'basic',
    name: 'Basic Shapes',
    shapes: basicShapeDefinitions,
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    shapes: flowchartShapeDefinitions,
  },
];

export function getAllShapes(): ShapeDefinition[] {
  return [...basicShapeDefinitions, ...flowchartShapeDefinitions];
}

export function getShapeByName(name: string): ShapeDefinition | undefined {
  return getAllShapes().find(s => s.shape === name);
}

export function getShapesByCategory(category: string): ShapeDefinition[] {
  return getAllShapes().filter(s => s.category === category);
}