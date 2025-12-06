// Shape type definitions

export interface ShapeDefinition {
  name: string;
  icon: string;
  shape: string;
  defaultWidth: number;
  defaultHeight: number;
  category: ShapeCategoryType;
  preview?: string;
}

export type ShapeCategoryType = 'basic' | 'flowchart' | 'arrows' | 'uml' | 'network' | 'custom';

export interface ShapeCategory {
  id: string;
  name: string;
  shapes: ShapeDefinition[];
}

export interface PortConfig {
  id?: string;
  group: string;
  attrs?: Record<string, Record<string, unknown>>;
}

export interface ShapeAttrs {
  body?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    rx?: number;
    ry?: number;
    opacity?: number;
    [key: string]: unknown;
  };
  label?: {
    text?: string;
    fill?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    fontStyle?: string;
    textAnchor?: string;
    [key: string]: unknown;
  };
  [key: string]: Record<string, unknown> | undefined;
}

export interface NodeConfig {
  id?: string;
  shape: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  attrs?: ShapeAttrs;
  data?: Record<string, unknown>;
  zIndex?: number;
  ports?: {
    groups?: Record<string, unknown>;
    items?: PortConfig[];
  };
}

export interface EdgeConfig {
  id?: string;
  shape?: string;
  source: string | { cell: string; port?: string };
  target: string | { cell: string; port?: string };
  vertices?: Array<{ x: number; y: number }>;
  attrs?: {
    line?: {
      stroke?: string;
      strokeWidth?: number;
      strokeDasharray?: string;
      targetMarker?: Record<string, unknown>;
      sourceMarker?: Record<string, unknown>;
      [key: string]: unknown;
    };
  };
  labels?: Array<{
    position?: number;
    attrs?: {
      text?: {
        text: string;
        [key: string]: unknown;
      };
    };
  }>;
  data?: Record<string, unknown>;
  zIndex?: number;
}

// Default port groups for shapes
export const defaultPortGroups = {
  top: {
    position: 'top',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#5F95FF',
        strokeWidth: 1,
        fill: '#fff',
        style: {
          visibility: 'hidden',
        },
      },
    },
  },
  right: {
    position: 'right',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#5F95FF',
        strokeWidth: 1,
        fill: '#fff',
        style: {
          visibility: 'hidden',
        },
      },
    },
  },
  bottom: {
    position: 'bottom',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#5F95FF',
        strokeWidth: 1,
        fill: '#fff',
        style: {
          visibility: 'hidden',
        },
      },
    },
  },
  left: {
    position: 'left',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#5F95FF',
        strokeWidth: 1,
        fill: '#fff',
        style: {
          visibility: 'hidden',
        },
      },
    },
  },
};

export const defaultPortItems: PortConfig[] = [
  { group: 'top' },
  { group: 'right' },
  { group: 'bottom' },
  { group: 'left' },
];