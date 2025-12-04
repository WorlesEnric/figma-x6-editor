import { Graph } from '@antv/x6';

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
          style: { visibility: 'hidden' },
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
          style: { visibility: 'hidden' },
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
          style: { visibility: 'hidden' },
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
          style: { visibility: 'hidden' },
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

export function registerFlowchartShapes() {
  // Process (Rectangle)
  Graph.registerNode(
    'flowchart-process',
    {
      inherit: 'rect',
      width: 120,
      height: 60,
      attrs: {
        body: {
          fill: '#E8F4FD',
          stroke: '#1890FF',
          strokeWidth: 2,
          rx: 4,
          ry: 4,
        },
        label: {
          text: 'Process',
          fill: '#1890FF',
          fontSize: 13,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Decision (Diamond)
  Graph.registerNode(
    'flowchart-decision',
    {
      inherit: 'polygon',
      width: 100,
      height: 80,
      attrs: {
        body: {
          fill: '#FFF7E6',
          stroke: '#FA8C16',
          strokeWidth: 2,
          refPoints: '0.5,0 1,0.5 0.5,1 0,0.5',
        },
        label: {
          text: 'Decision',
          fill: '#FA8C16',
          fontSize: 13,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Start/End (Rounded Rectangle / Stadium)
  Graph.registerNode(
    'flowchart-terminator',
    {
      inherit: 'rect',
      width: 100,
      height: 50,
      attrs: {
        body: {
          fill: '#F6FFED',
          stroke: '#52C41A',
          strokeWidth: 2,
          rx: 25,
          ry: 25,
        },
        label: {
          text: 'Start',
          fill: '#52C41A',
          fontSize: 13,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Data (Parallelogram)
  Graph.registerNode(
    'flowchart-data',
    {
      inherit: 'polygon',
      width: 120,
      height: 60,
      attrs: {
        body: {
          fill: '#F9F0FF',
          stroke: '#722ED1',
          strokeWidth: 2,
          refPoints: '0.15,0 1,0 0.85,1 0,1',
        },
        label: {
          text: 'Data',
          fill: '#722ED1',
          fontSize: 13,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Document
  Graph.registerNode(
    'flowchart-document',
    {
      inherit: 'path',
      width: 120,
      height: 80,
      attrs: {
        body: {
          fill: '#FFF0F6',
          stroke: '#EB2F96',
          strokeWidth: 2,
          d: 'M 0 0 L 120 0 L 120 60 Q 90 80 60 60 Q 30 40 0 60 Z',
        },
        label: {
          text: 'Document',
          fill: '#EB2F96',
          fontSize: 13,
          fontFamily: 'DM Sans, sans-serif',
          refY: 0.4,
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Database (Cylinder)
  Graph.registerNode(
    'flowchart-database',
    {
      inherit: 'rect',
      width: 80,
      height: 100,
      markup: [
        {
          tagName: 'path',
          selector: 'body',
        },
        {
          tagName: 'ellipse',
          selector: 'top',
        },
        {
          tagName: 'text',
          selector: 'label',
        },
      ],
      attrs: {
        body: {
          fill: '#E6FFFB',
          stroke: '#13C2C2',
          strokeWidth: 2,
          d: 'M 0 15 Q 0 0 40 0 Q 80 0 80 15 L 80 85 Q 80 100 40 100 Q 0 100 0 85 Z',
        },
        top: {
          fill: '#E6FFFB',
          stroke: '#13C2C2',
          strokeWidth: 2,
          cx: 40,
          cy: 15,
          rx: 40,
          ry: 15,
        },
        label: {
          text: 'Database',
          fill: '#13C2C2',
          fontSize: 12,
          fontFamily: 'DM Sans, sans-serif',
          refX: 0.5,
          refY: 0.55,
          textAnchor: 'middle',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Predefined Process (Rectangle with side lines)
  Graph.registerNode(
    'flowchart-predefined',
    {
      inherit: 'rect',
      width: 120,
      height: 60,
      markup: [
        {
          tagName: 'rect',
          selector: 'body',
        },
        {
          tagName: 'line',
          selector: 'leftLine',
        },
        {
          tagName: 'line',
          selector: 'rightLine',
        },
        {
          tagName: 'text',
          selector: 'label',
        },
      ],
      attrs: {
        body: {
          fill: '#FFF1F0',
          stroke: '#F5222D',
          strokeWidth: 2,
          rx: 0,
          ry: 0,
        },
        leftLine: {
          x1: 10,
          y1: 0,
          x2: 10,
          y2: 60,
          stroke: '#F5222D',
          strokeWidth: 2,
        },
        rightLine: {
          x1: 110,
          y1: 0,
          x2: 110,
          y2: 60,
          stroke: '#F5222D',
          strokeWidth: 2,
        },
        label: {
          text: 'Subroutine',
          fill: '#F5222D',
          fontSize: 12,
          fontFamily: 'DM Sans, sans-serif',
          refX: 0.5,
          refY: 0.5,
          textAnchor: 'middle',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Manual Input (Trapezoid top)
  Graph.registerNode(
    'flowchart-manual-input',
    {
      inherit: 'polygon',
      width: 120,
      height: 60,
      attrs: {
        body: {
          fill: '#FFFBE6',
          stroke: '#FAAD14',
          strokeWidth: 2,
          refPoints: '0,0.2 1,0 1,1 0,1',
        },
        label: {
          text: 'Input',
          fill: '#FAAD14',
          fontSize: 13,
          fontFamily: 'DM Sans, sans-serif',
          refY: 0.55,
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Display
  Graph.registerNode(
    'flowchart-display',
    {
      inherit: 'polygon',
      width: 120,
      height: 60,
      attrs: {
        body: {
          fill: '#F0F5FF',
          stroke: '#2F54EB',
          strokeWidth: 2,
          refPoints: '0.1,0 0.9,0 1,0.5 0.9,1 0.1,1 0,0.5',
        },
        label: {
          text: 'Display',
          fill: '#2F54EB',
          fontSize: 13,
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      ports: commonPorts,
    },
    true
  );

  // Connector (Circle)
  Graph.registerNode(
    'flowchart-connector',
    {
      inherit: 'circle',
      width: 50,
      height: 50,
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 2,
        },
        label: {
          text: 'A',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 600,
        },
      },
      ports: commonPorts,
    },
    true
  );
}

export const flowchartShapeDefinitions = [
  {
    name: 'Process',
    icon: 'square',
    shape: 'flowchart-process',
    defaultWidth: 120,
    defaultHeight: 60,
    category: 'flowchart' as const,
  },
  {
    name: 'Decision',
    icon: 'diamond',
    shape: 'flowchart-decision',
    defaultWidth: 100,
    defaultHeight: 80,
    category: 'flowchart' as const,
  },
  {
    name: 'Terminator',
    icon: 'circle',
    shape: 'flowchart-terminator',
    defaultWidth: 100,
    defaultHeight: 50,
    category: 'flowchart' as const,
  },
  {
    name: 'Data',
    icon: 'database',
    shape: 'flowchart-data',
    defaultWidth: 120,
    defaultHeight: 60,
    category: 'flowchart' as const,
  },
  {
    name: 'Document',
    icon: 'file-text',
    shape: 'flowchart-document',
    defaultWidth: 120,
    defaultHeight: 80,
    category: 'flowchart' as const,
  },
  {
    name: 'Database',
    icon: 'database',
    shape: 'flowchart-database',
    defaultWidth: 80,
    defaultHeight: 100,
    category: 'flowchart' as const,
  },
  {
    name: 'Predefined Process',
    icon: 'layout',
    shape: 'flowchart-predefined',
    defaultWidth: 120,
    defaultHeight: 60,
    category: 'flowchart' as const,
  },
  {
    name: 'Manual Input',
    icon: 'edit',
    shape: 'flowchart-manual-input',
    defaultWidth: 120,
    defaultHeight: 60,
    category: 'flowchart' as const,
  },
  {
    name: 'Display',
    icon: 'monitor',
    shape: 'flowchart-display',
    defaultWidth: 120,
    defaultHeight: 60,
    category: 'flowchart' as const,
  },
  {
    name: 'Connector',
    icon: 'circle',
    shape: 'flowchart-connector',
    defaultWidth: 50,
    defaultHeight: 50,
    category: 'flowchart' as const,
  },
];