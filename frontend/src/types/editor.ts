import type { Graph, Node, Edge, Cell } from '@antv/x6';

// Tool Types
export type ToolType =
  | 'select'
  | 'hand'
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'text'
  | 'image'
  | 'frame';

// Page Types
export interface Page {
  id: string;
  name: string;
  data: GraphData | null;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  pages: Page[];
  currentPageId: string;
  createdAt: number;
  updatedAt: number;
}

// Graph Data
export interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}

export interface NodeData {
  id: string;
  shape: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  label?: string;
  attrs?: Record<string, Record<string, unknown>>;
  data?: Record<string, unknown>;
  zIndex?: number;
  parent?: string;
  children?: string[];
}

export interface EdgeData {
  id: string;
  shape?: string;
  source: string | { cell: string; port?: string };
  target: string | { cell: string; port?: string };
  vertices?: { x: number; y: number }[];
  attrs?: Record<string, Record<string, unknown>>;
  labels?: EdgeLabel[];
  data?: Record<string, unknown>;
  zIndex?: number;
}

export interface EdgeLabel {
  position?: number;
  attrs?: {
    text?: {
      text: string;
    };
  };
}

// Layer Types
export interface LayerItem {
  id: string;
  name: string;
  type: 'node' | 'edge' | 'group';
  visible: boolean;
  locked: boolean;
  children?: LayerItem[];
  expanded?: boolean;
}

// Property Types
export interface FillStyle {
  type: 'solid' | 'gradient' | 'none';
  color: string;
  opacity: number;
}

export interface StrokeStyle {
  color: string;
  width: number;
  opacity: number;
  dasharray?: string;
  linecap?: 'butt' | 'round' | 'square';
  linejoin?: 'miter' | 'round' | 'bevel';
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  textDecoration: 'none' | 'underline' | 'line-through';
  lineHeight: number;
  letterSpacing: number;
  color: string;
}

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

export interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}



// History Types
export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

// Clipboard Types
export interface ClipboardData {
  nodes: NodeData[];
  edges: EdgeData[];
}

// Export Types
export type ExportFormat = 'png' | 'svg' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  scale?: number;
  background?: string;
  padding?: number;
}

// Context Menu Types
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  action?: () => void;
  children?: ContextMenuItem[];
}

// Editor State
export interface EditorState {
  tool: ToolType;
  zoom: number;
  showGrid: boolean;
  showSnaplines: boolean;
  showMinimap: boolean;
  isDrawing: boolean;
  isPanning: boolean;
}

// Selection State
export interface SelectionState {
  selectedIds: string[];
  selectedCells: Cell[];
  bounds: SelectionBounds | null;
}

// Graph Reference
export type GraphInstance = Graph | null;