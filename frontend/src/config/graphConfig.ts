import type { Graph } from '@antv/x6';

export const graphConfig: Partial<Graph.Options> = {
  // Background
  background: {
    color: '#1a1a1a',
  },
  
  // Grid
  grid: {
    visible: true,
    type: 'doubleMesh',
    args: [
      {
        color: '#2a2a2a',
        thickness: 1,
      },
      {
        color: '#333333',
        thickness: 1,
        factor: 4,
      },
    ],
  },
  
  // Panning
  panning: {
    enabled: true,
    modifiers: ['space'],
  },
  
  // Mouse wheel zoom
  mousewheel: {
    enabled: true,
    modifiers: ['ctrl', 'meta'],
    factor: 1.1,
    maxScale: 5,
    minScale: 0.1,
  },
  
  // Connecting edges
  connecting: {
    router: 'manhattan',
    connector: {
      name: 'rounded',
      args: {
        radius: 8,
      },
    },
    anchor: 'center',
    connectionPoint: 'anchor',
    allowBlank: false,
    allowLoop: false,
    allowNode: true,
    allowEdge: false,
    allowPort: true,
    highlight: true,
    snap: {
      radius: 20,
    },
    createEdge() {
      return this.createEdge({
        shape: 'edge',
        attrs: {
          line: {
            stroke: '#808080',
            strokeWidth: 2,
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
            },
          },
        },
        zIndex: 0,
      });
    },
    validateConnection({ sourceCell, targetCell }) {
      if (!sourceCell || !targetCell) return false;
      if (sourceCell.id === targetCell.id) return false;
      return true;
    },
  },
  
  // Highlighting
  highlighting: {
    magnetAdsorbed: {
      name: 'stroke',
      args: {
        attrs: {
          fill: '#0d99ff',
          stroke: '#0d99ff',
        },
      },
    },
    embedding: {
      name: 'stroke',
      args: {
        padding: -1,
        attrs: {
          stroke: '#0d99ff',
        },
      },
    },
  },
  
  // Resizing
  resizing: {
    enabled: true,
    minWidth: 20,
    minHeight: 20,
    orthogonal: true,
    restricted: false,
    autoScroll: true,
    preserveAspectRatio: false,
  },
  
  // Rotating
  rotating: {
    enabled: true,
    grid: 15,
  },
  
  // Selecting
  selecting: {
    enabled: true,
    multiple: true,
    rubberband: true,
    movable: true,
    showNodeSelectionBox: true,
    showEdgeSelectionBox: true,
    pointerEvents: 'none',
    modifiers: ['shift'],
    filter: ['groupNode'],
  },
  
  // Embedding (grouping)
  embedding: {
    enabled: true,
    findParent({ node }) {
      const bbox = node.getBBox();
      return this.getNodes().filter((n) => {
        const data = n.getData<{ isGroup?: boolean }>();
        if (data && data.isGroup) {
          const targetBBox = n.getBBox();
          return targetBBox.containsRect(bbox);
        }
        return false;
      });
    },
  },
  
  // Interacting
  interacting: {
    nodeMovable: true,
    edgeMovable: true,
    edgeLabelMovable: true,
    arrowheadMovable: true,
    vertexMovable: true,
    vertexAddable: true,
    vertexDeletable: true,
  },
};

export const snaplineConfig = {
  enabled: true,
  className: 'x6-widget-snapline',
  tolerance: 10,
  sharp: true,
  resizing: true,
  clean: 5000,
};

export const historyConfig = {
  enabled: true,
  stackSize: 50,
  beforeAddCommand: (event: string) => {
    // Don't record selection changes
    if (event === 'cell:selected' || event === 'cell:unselected') {
      return false;
    }
    return true;
  },
};

export const clipboardConfig = {
  enabled: true,
  useLocalStorage: true,
};

export const keyboardConfig = {
  enabled: true,
  global: true,
};

export const selectionConfig = {
  enabled: true,
  multiple: true,
  rubberband: true,
  movable: true,
  showNodeSelectionBox: true,
  pointerEvents: 'none' as const,
};

export const transformConfig = {
  resizing: {
    enabled: true,
    minWidth: 20,
    minHeight: 20,
    orthogonal: true,
    preserveAspectRatio: false,
  },
  rotating: {
    enabled: true,
    grid: 15,
  },
};

export const minimapConfig = {
  enabled: true,
  width: 200,
  height: 140,
  padding: 10,
  scalable: true,
  minScale: 0.01,
  maxScale: 2,
};