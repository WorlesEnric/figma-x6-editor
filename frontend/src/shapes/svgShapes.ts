import { Graph } from '@antv/x6';

/**
 * Parse SVG string and extract path data
 */
export function parseSvgString(svgString: string): {
  viewBox: string | null;
  paths: Array<{ d: string; fill?: string; stroke?: string }>;
  width: number;
  height: number;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  
  if (!svg) {
    throw new Error('Invalid SVG string');
  }
  
  const viewBox = svg.getAttribute('viewBox');
  const width = parseFloat(svg.getAttribute('width') || '100');
  const height = parseFloat(svg.getAttribute('height') || '100');
  
  const paths: Array<{ d: string; fill?: string; stroke?: string }> = [];
  
  // Extract all path elements
  svg.querySelectorAll('path').forEach((path) => {
    const d = path.getAttribute('d');
    if (d) {
      paths.push({
        d,
        fill: path.getAttribute('fill') || undefined,
        stroke: path.getAttribute('stroke') || undefined,
      });
    }
  });
  
  // Also check for other shape elements and convert to paths
  svg.querySelectorAll('rect, circle, ellipse, polygon, polyline').forEach((el) => {
    // For simplicity, we'll store these as-is and handle them separately
    // In a production app, you'd convert these to path data
  });
  
  return { viewBox, paths, width, height };
}

/**
 * Register a custom SVG shape
 */
export function registerSvgShape(
  name: string,
  svgString: string,
  options?: {
    width?: number;
    height?: number;
    preserveAspectRatio?: boolean;
  }
) {
  const { viewBox, paths, width: svgWidth, height: svgHeight } = parseSvgString(svgString);
  const width = options?.width || svgWidth || 100;
  const height = options?.height || svgHeight || 100;
  
  // Create markup from SVG paths
  const markup = [
    {
      tagName: 'rect',
      selector: 'background',
    },
    ...paths.map((_, index) => ({
      tagName: 'path',
      selector: `path${index}`,
    })),
    {
      tagName: 'text',
      selector: 'label',
    },
  ];
  
  // Create attrs for each path
  const pathAttrs: Record<string, Record<string, unknown>> = {};
  paths.forEach((path, index) => {
    pathAttrs[`path${index}`] = {
      d: path.d,
      fill: path.fill || '#ffffff',
      stroke: path.stroke || '#333333',
      strokeWidth: 2,
      refWidth: '100%',
      refHeight: '100%',
    };
  });
  
  Graph.registerNode(
    name,
    {
      width,
      height,
      markup,
      attrs: {
        background: {
          fill: 'transparent',
          stroke: 'none',
          refWidth: '100%',
          refHeight: '100%',
        },
        ...pathAttrs,
        label: {
          text: '',
          fill: '#333333',
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
          refX: 0.5,
          refY: '100%',
          refY2: 10,
          textAnchor: 'middle',
        },
      },
      ports: {
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
      },
    },
    true
  );
  
  return {
    name,
    width,
    height,
  };
}

/**
 * Create a node from an SVG file
 */
export async function createNodeFromSvgFile(file: File): Promise<{
  shape: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const svgString = e.target?.result as string;
        const shapeName = `svg-${Date.now()}`;
        const result = registerSvgShape(shapeName, svgString);
        resolve({
          shape: shapeName,
          width: result.width,
          height: result.height,
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Create node from SVG URL
 */
export async function createNodeFromSvgUrl(url: string): Promise<{
  shape: string;
  width: number;
  height: number;
}> {
  const response = await fetch(url);
  const svgString = await response.text();
  const shapeName = `svg-${Date.now()}`;
  const result = registerSvgShape(shapeName, svgString);
  
  return {
    shape: shapeName,
    width: result.width,
    height: result.height,
  };
}

// Pre-built SVG icons for common use
export const svgIcons = {
  user: `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>`,
  
  cloud: `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="currentColor"/></svg>`,
  
  server: `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 1h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2zm0 8h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2zm0 8h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2z" fill="currentColor"/></svg>`,
  
  api: `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M14 12l-2 2-2-2 2-2 2 2zm-2-6l2.12 2.12 2.5-2.5L12 1 7.38 5.62l2.5 2.5L12 6zm-6 6l2.12-2.12-2.5-2.5L1 12l4.62 4.62 2.5-2.5L6 12zm12 0l-2.12 2.12 2.5 2.5L23 12l-4.62-4.62-2.5 2.5L18 12zm-6 6l-2.12-2.12-2.5 2.5L12 23l4.62-4.62-2.5-2.5L12 18z" fill="currentColor"/></svg>`,
};