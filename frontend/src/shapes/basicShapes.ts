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
          fill: '#333333',
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

  // Dashed Rectangle
  Graph.registerNode(
    'custom-dashed-rect',
    {
      inherit: 'rect',
      width: 100,
      height: 60,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          strokeDasharray: '5,5',
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

  // Parallelogram
  Graph.registerNode(
    'custom-parallelogram',
    {
      inherit: 'polygon',
      width: 100,
      height: 60,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refPoints: '0.25,0 1,0 0.75,1 0,1',
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

  // Trapezoid
  Graph.registerNode(
    'custom-trapezoid',
    {
      inherit: 'polygon',
      width: 100,
      height: 60,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refPoints: '0.2,0 0.8,0 1,1 0,1',
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

  // Cylinder
  Graph.registerNode(
    'custom-cylinder',
    {
      inherit: 'path',
      width: 80,
      height: 100,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refD: 'M 0 20 Q 0 0 40 0 Q 80 0 80 20 L 80 80 Q 80 100 40 100 Q 0 100 0 80 Z M 0 20 Q 0 40 40 40 Q 80 40 80 20',
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
          refY: '50%',
          refX: '50%',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Cloud
  Graph.registerNode(
    'custom-cloud',
    {
      inherit: 'path',
      width: 120,
      height: 80,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refD: 'M 25 60 Q 10 60 10 45 Q 10 35 20 30 Q 20 15 35 10 Q 50 5 60 15 Q 75 10 85 20 Q 100 20 105 35 Q 115 40 110 55 Q 105 65 95 65 Z',
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
          refY: '50%',
          refX: '50%',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Callout/Speech Bubble
  Graph.registerNode(
    'custom-callout',
    {
      inherit: 'path',
      width: 120,
      height: 80,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refD: 'M 10 10 L 110 10 L 110 60 L 30 60 L 20 75 L 25 60 L 10 60 Z',
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
          refY: '40%',
          refX: '50%',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Pentagon
  Graph.registerNode(
    'custom-pentagon',
    {
      inherit: 'polygon',
      width: 80,
      height: 80,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refPoints: '0.5,0 1,0.4 0.8,1 0.2,1 0,0.4',
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

  // Arrow Right
  Graph.registerNode(
    'custom-arrow-right',
    {
      inherit: 'polygon',
      width: 100,
      height: 60,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refPoints: '0,0.25 0.7,0.25 0.7,0 1,0.5 0.7,1 0.7,0.75 0,0.75',
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

  // Document
  Graph.registerNode(
    'custom-document',
    {
      inherit: 'path',
      width: 100,
      height: 100,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refD: 'M 0 0 L 80 0 L 80 80 Q 60 90 40 80 Q 20 70 0 80 Z',
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
          refY: '40%',
          refX: '50%',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Note/Page
  Graph.registerNode(
    'custom-note',
    {
      inherit: 'path',
      width: 80,
      height: 100,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refD: 'M 0 0 L 60 0 L 80 20 L 80 100 L 0 100 Z M 60 0 L 60 20 L 80 20',
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
          refY: '50%',
          refX: '50%',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Cube/3D Box
  Graph.registerNode(
    'custom-cube',
    {
      inherit: 'path',
      width: 80,
      height: 80,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refD: 'M 0 20 L 0 60 L 40 80 L 80 60 L 80 20 L 40 0 Z M 0 20 L 40 40 M 40 40 L 40 80 M 40 40 L 80 20',
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
          refY: '50%',
          refX: '50%',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Plus/Cross
  Graph.registerNode(
    'custom-plus',
    {
      inherit: 'path',
      width: 80,
      height: 80,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
          refD: 'M 30 0 L 50 0 L 50 30 L 80 30 L 80 50 L 50 50 L 50 80 L 30 80 L 30 50 L 0 50 L 0 30 L 30 30 Z',
        },
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
          refY: '50%',
          refX: '50%',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
        },
      },
      ports: commonPorts,
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

  // Dashed Line
  Graph.registerEdge(
    'custom-dashed-line',
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#808080',
          strokeWidth: 2,
          strokeDasharray: '5,5',
          targetMarker: null,
        },
      },
    },
    true
  );

  // Dotted Line
  Graph.registerEdge(
    'custom-dotted-line',
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#808080',
          strokeWidth: 2,
          strokeDasharray: '2,4',
          targetMarker: null,
        },
      },
    },
    true
  );

  // Dashed Arrow
  Graph.registerEdge(
    'custom-dashed-arrow',
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#808080',
          strokeWidth: 2,
          strokeDasharray: '5,5',
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

  // Curved Arrow
  Graph.registerEdge(
    'custom-curved-arrow',
    {
      inherit: 'edge',
      connector: { name: 'smooth' },
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

  // Thick Arrow
  Graph.registerEdge(
    'custom-thick-arrow',
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#808080',
          strokeWidth: 4,
          targetMarker: {
            name: 'block',
            width: 16,
            height: 10,
          },
        },
      },
    },
    true
  );

  // Diamond Arrow
  Graph.registerEdge(
    'custom-diamond-arrow',
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#808080',
          strokeWidth: 2,
          targetMarker: {
            name: 'diamond',
            width: 12,
            height: 12,
          },
        },
      },
    },
    true
  );

  // Circle Arrow
  Graph.registerEdge(
    'custom-circle-arrow',
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#808080',
          strokeWidth: 2,
          targetMarker: {
            name: 'circle',
            r: 5,
          },
        },
      },
    },
    true
  );

  // Actor (Stick Figure)
  Graph.registerNode(
    'custom-actor',
    {
      inherit: 'path',
      width: 60,
      height: 90,
      attrs: {
        body: {
          stroke: '#333333',
          strokeWidth: 2,
          fill: 'none',
          refD: 'M 20 5 A 5 5 0 1 1 10 5 A 5 5 0 1 1 20 5 M 15 10 L 15 25 M 5 15 L 25 15 M 5 40 L 15 25 L 25 40',
        },
        label: {
          text: 'Actor',
          refY: '100%',
          refY2: 20,
        }
      },
      ports: commonPorts,
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
    name: 'Actor',
    icon: 'user',
    shape: 'custom-actor',
    defaultWidth: 50,
    defaultHeight: 80,
    category: 'basic' as const,
  },
  {
    name: 'Text',
    icon: 'type',
    shape: 'custom-text',
    defaultWidth: 80,
    defaultHeight: 30,
    category: 'basic' as const,
  },
  {
    name: 'Dashed Rectangle',
    icon: 'square-dashed',
    shape: 'custom-dashed-rect',
    defaultWidth: 100,
    defaultHeight: 60,
    category: 'basic' as const,
  },
  {
    name: 'Parallelogram',
    icon: 'square',
    shape: 'custom-parallelogram',
    defaultWidth: 100,
    defaultHeight: 60,
    category: 'basic' as const,
  },
  {
    name: 'Trapezoid',
    icon: 'square',
    shape: 'custom-trapezoid',
    defaultWidth: 100,
    defaultHeight: 60,
    category: 'basic' as const,
  },
  {
    name: 'Cylinder',
    icon: 'circle',
    shape: 'custom-cylinder',
    defaultWidth: 80,
    defaultHeight: 100,
    category: 'basic' as const,
  },
  {
    name: 'Cloud',
    icon: 'cloud',
    shape: 'custom-cloud',
    defaultWidth: 120,
    defaultHeight: 80,
    category: 'basic' as const,
  },
  {
    name: 'Callout',
    icon: 'message-square',
    shape: 'custom-callout',
    defaultWidth: 120,
    defaultHeight: 80,
    category: 'basic' as const,
  },
  {
    name: 'Pentagon',
    icon: 'pentagon',
    shape: 'custom-pentagon',
    defaultWidth: 80,
    defaultHeight: 80,
    category: 'basic' as const,
  },
  {
    name: 'Arrow',
    icon: 'arrow-right',
    shape: 'custom-arrow-right',
    defaultWidth: 100,
    defaultHeight: 60,
    category: 'basic' as const,
  },
  {
    name: 'Document',
    icon: 'file-text',
    shape: 'custom-document',
    defaultWidth: 100,
    defaultHeight: 100,
    category: 'basic' as const,
  },
  {
    name: 'Note',
    icon: 'file',
    shape: 'custom-note',
    defaultWidth: 80,
    defaultHeight: 100,
    category: 'basic' as const,
  },
  {
    name: 'Cube',
    icon: 'box',
    shape: 'custom-cube',
    defaultWidth: 80,
    defaultHeight: 80,
    category: 'basic' as const,
  },
  {
    name: 'Plus',
    icon: 'plus',
    shape: 'custom-plus',
    defaultWidth: 80,
    defaultHeight: 80,
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
