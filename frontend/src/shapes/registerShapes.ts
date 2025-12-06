import { registerBasicShapes, basicShapeDefinitions } from './basicShapes';
import { registerFlowchartShapes, flowchartShapeDefinitions } from './flowchartShapes';
import { registerNetworkShapes, networkShapeDefinitions } from './networkShapes';
import { registerUmlShapes, umlShapeDefinitions } from './umlShapes';
import type { ShapeCategory, ShapeDefinition } from '@/types';

export function registerAllShapes() {
  registerBasicShapes();
  registerFlowchartShapes();
  registerNetworkShapes();
  registerUmlShapes();
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
  {
    id: 'network',
    name: 'Network',
    shapes: networkShapeDefinitions,
  },
  {
    id: 'uml',
    name: 'UML',
    shapes: umlShapeDefinitions,
  },
];

export function getAllShapes(): ShapeDefinition[] {
  return [
    ...basicShapeDefinitions,
    ...flowchartShapeDefinitions,
    ...networkShapeDefinitions,
    ...umlShapeDefinitions,
  ];
}

export function getShapeByName(name: string): ShapeDefinition | undefined {
  return getAllShapes().find(s => s.shape === name);
}

export function getShapesByCategory(category: string): ShapeDefinition[] {
  return getAllShapes().filter(s => s.category === category);
}