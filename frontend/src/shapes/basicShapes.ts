import { Graph } from '@antv/x6';

// Common port configuration
const commonPorts = {
  groups: {
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
  },
  items: [
    { group: 'top' },
    { group: 'right' },
    { group: 'bottom' },
    { group: 'left' },
  ],
};

export function registerBasicShapes() {
  // Custom Rectangle
  Graph.registerNode(
    'custom-rect',
    {
      inherit: 'rect',
      width: 100,
      height: 60,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          rx: 6,
          ry: 6,
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Custom Rounded Rectangle
  Graph.registerNode(
    'custom-rounded-rect',
    {
      inherit: 'rect',
      width: 100,
      height: 60,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          rx: 20,
          ry: 20,
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Custom Circle/Ellipse
  Graph.registerNode(
    'custom-ellipse',
    {
      inherit: 'ellipse',
      width: 80,
      height: 80,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Diamond
  Graph.registerNode(
    'custom-diamond',
    {
      inherit: 'polygon',
      width: 80,
      height: 80,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refPoints: '0.5,0 1,0.5 0.5,1 0,0.5',
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Triangle
  Graph.registerNode(
    'custom-triangle',
    {
      inherit: 'polygon',
      width: 80,
      height: 80,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refPoints: '0.5,0 1,1 0,1',
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Hexagon
  Graph.registerNode(
    'custom-hexagon',
    {
      inherit: 'polygon',
      width: 100,
      height: 80,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refPoints: '0.25,0 0.75,0 1,0.5 0.75,1 0.25,1 0,0.5',
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Star
  Graph.registerNode(
    'custom-star',
    {
      inherit: 'polygon',
      width: 80,
      height: 80,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refPoints: '0.5,0 0.61,0.35 1,0.35 0.68,0.57 0.79,0.91 0.5,0.70 0.21,0.91 0.32,0.57 0,0.35 0.39,0.35',
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Text node
  Graph.registerNode(
    'custom-text',
    {
      inherit: 'rect',
      width: 100,
      height: 40,
      attrs: {
        body: {
          fill: 'transparent',
          stroke: 'transparent',
          strokeWidth: 0,
        },
        label: {
          text: 'Text',
          fill: '#ffffff',
          fontSize: 16,
          fontFamily: 'DM Sans, sans-serif',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
      },
    },
    true
  );

  // Image node
  Graph.registerNode(
    'custom-image',
    {
      inherit: 'image',
      width: 100,
      height: 100,
      attrs: {
        image: {
          'xlink:href': '',
          width: 100,
          height: 100,
          preserveAspectRatio: 'xMidYMid slice',
        },
        body: {
          fill: '#f5f5f5',
          stroke: '#333333',
          strokeWidth: 1,
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Frame/Group node
  Graph.registerNode(
    'custom-frame',
    {
      inherit: 'rect',
      width: 300,
      height: 200,
      attrs: {
        body: {
          fill: 'rgba(255,255,255,0.02)',
          stroke: '#5F95FF',
          strokeWidth: 1,
          strokeDasharray: '5,5',
          rx: 4,
          ry: 4,
        },
        label: {
          text: 'Frame',
          fill: '#5F95FF',
          fontSize: 12,
          fontFamily: 'DM Sans, sans-serif',
          refX: 8,
          refY: -20,
          textAnchor: 'start',
        },
      },
      data: {
        isGroup: true,
      },
    },
    true
  );

  // Line
  Graph.registerEdge(
    'custom-line',
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#808080',
          strokeWidth: 2,
          targetMarker: null,
        },
      },
    },
    true
  );

  // Arrow
  Graph.registerEdge(
    'custom-arrow',
    {
      inherit: 'edge',
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
    },
    true
  );

  // Double Arrow
  Graph.registerEdge(
    'custom-double-arrow',
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#808080',
          strokeWidth: 2,
          sourceMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      },
    },
    true
  );
}

export const basicShapeDefinitions = [
  {
    name: 'Rectangle',
    icon: 'square',
    shape: 'custom-rect',
    defaultWidth: 100,
    defaultHeight: 60,
    category: 'basic' as const,
  },
  {
    name: 'Rounded Rectangle',
    icon: 'square',
    shape: 'custom-rounded-rect',
    defaultWidth: 100,
    defaultHeight: 60,
    category: 'basic' as const,
  },
  {
    name: 'Ellipse',
    icon: 'circle',
    shape: 'custom-ellipse',
    defaultWidth: 80,
    defaultHeight: 80,
    category: 'basic' as const,
  },
  {
    name: 'Diamond',
    icon: 'diamond',
    shape: 'custom-diamond',
    defaultWidth: 80,
    defaultHeight: 80,
    category: 'basic' as const,
  },
  {
    name: 'Triangle',
    icon: 'triangle',
    shape: 'custom-triangle',
    defaultWidth: 80,
    defaultHeight: 80,
    category: 'basic' as const,
  },
  {
    name: 'Hexagon',
    icon: 'hexagon',
    shape: 'custom-hexagon',
    defaultWidth: 100,
    defaultHeight: 80,
    category: 'basic' as const,
  },
  {
    name: 'Star',
    icon: 'star',
    shape: 'custom-star',
    defaultWidth: 80,
    defaultHeight: 80,
    category: 'basic' as const,
  },
  {
    name: 'Text',
    icon: 'type',
    shape: 'custom-text',
    defaultWidth: 100,
    defaultHeight: 40,
    category: 'basic' as const,
  },
  {
    name: 'Frame',
    icon: 'frame',
    shape: 'custom-frame',
    defaultWidth: 300,
    defaultHeight: 200,
    category: 'basic' as const,
  },
];