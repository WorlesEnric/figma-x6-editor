/**
 * SVG Utilities for parsing, manipulating, and converting SVG content
 */

export interface ParsedSvg {
    viewBox: string | null;
    width: number;
    height: number;
    elements: SvgElement[];
    originalSvg: string;
  }
  
  export interface SvgElement {
    tagName: string;
    attributes: Record<string, string>;
    children?: SvgElement[];
    textContent?: string;
  }
  
  /**
   * Parse SVG string into structured data
   */
  export function parseSvgString(svgString: string): ParsedSvg {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');
  
    if (!svg) {
      throw new Error('Invalid SVG: No SVG element found');
    }
  
    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error(`SVG Parse Error: ${parseError.textContent}`);
    }
  
    const viewBox = svg.getAttribute('viewBox');
    const width = parseFloat(svg.getAttribute('width') || '100');
    const height = parseFloat(svg.getAttribute('height') || '100');
  
    const elements = parseElements(svg);
  
    return {
      viewBox,
      width,
      height,
      elements,
      originalSvg: svgString,
    };
  }
  
  /**
   * Recursively parse SVG elements
   */
  function parseElements(element: Element): SvgElement[] {
    const elements: SvgElement[] = [];
  
    for (const child of Array.from(element.children)) {
      const attributes: Record<string, string> = {};
      
      for (const attr of Array.from(child.attributes)) {
        attributes[attr.name] = attr.value;
      }
  
      const svgElement: SvgElement = {
        tagName: child.tagName.toLowerCase(),
        attributes,
      };
  
      if (child.children.length > 0) {
        svgElement.children = parseElements(child);
      }
  
      if (child.textContent && child.children.length === 0) {
        svgElement.textContent = child.textContent.trim();
      }
  
      elements.push(svgElement);
    }
  
    return elements;
  }
  
  /**
   * Extract path data from SVG
   */
  export function extractPaths(svgString: string): Array<{
    d: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: string;
  }> {
    const parsed = parseSvgString(svgString);
    const paths: Array<{
      d: string;
      fill?: string;
      stroke?: string;
      strokeWidth?: string;
    }> = [];
  
    function extractFromElements(elements: SvgElement[]) {
      for (const element of elements) {
        if (element.tagName === 'path' && element.attributes.d) {
          paths.push({
            d: element.attributes.d,
            fill: element.attributes.fill,
            stroke: element.attributes.stroke,
            strokeWidth: element.attributes['stroke-width'],
          });
        }
  
        if (element.children) {
          extractFromElements(element.children);
        }
      }
    }
  
    extractFromElements(parsed.elements);
    return paths;
  }
  
  /**
   * Convert basic shapes to path
   */
  export function rectToPath(
    x: number,
    y: number,
    width: number,
    height: number,
    rx = 0,
    ry = 0
  ): string {
    if (rx === 0 && ry === 0) {
      return `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`;
    }
  
    // Rounded rectangle
    return `
      M ${x + rx} ${y}
      H ${x + width - rx}
      A ${rx} ${ry} 0 0 1 ${x + width} ${y + ry}
      V ${y + height - ry}
      A ${rx} ${ry} 0 0 1 ${x + width - rx} ${y + height}
      H ${x + rx}
      A ${rx} ${ry} 0 0 1 ${x} ${y + height - ry}
      V ${y + ry}
      A ${rx} ${ry} 0 0 1 ${x + rx} ${y}
      Z
    `.trim();
  }
  
  export function circleToPath(cx: number, cy: number, r: number): string {
    return `
      M ${cx - r} ${cy}
      A ${r} ${r} 0 1 0 ${cx + r} ${cy}
      A ${r} ${r} 0 1 0 ${cx - r} ${cy}
      Z
    `.trim();
  }
  
  export function ellipseToPath(cx: number, cy: number, rx: number, ry: number): string {
    return `
      M ${cx - rx} ${cy}
      A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy}
      A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}
      Z
    `.trim();
  }
  
  export function polygonToPath(points: string): string {
    const pointPairs = points.trim().split(/\s+|,/).filter(Boolean);
    if (pointPairs.length < 2) return '';
  
    let path = `M ${pointPairs[0]} ${pointPairs[1]}`;
    
    for (let i = 2; i < pointPairs.length; i += 2) {
      path += ` L ${pointPairs[i]} ${pointPairs[i + 1]}`;
    }
    
    return path + ' Z';
  }
  
  export function polylineToPath(points: string): string {
    const pointPairs = points.trim().split(/\s+|,/).filter(Boolean);
    if (pointPairs.length < 2) return '';
  
    let path = `M ${pointPairs[0]} ${pointPairs[1]}`;
    
    for (let i = 2; i < pointPairs.length; i += 2) {
      path += ` L ${pointPairs[i]} ${pointPairs[i + 1]}`;
    }
    
    return path;
  }
  
  /**
   * Optimize SVG string by removing unnecessary elements
   */
  export function optimizeSvg(svgString: string): string {
    // Remove comments
    let optimized = svgString.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remove empty groups
    optimized = optimized.replace(/<g[^>]*>\s*<\/g>/g, '');
    
    // Remove metadata
    optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/g, '');
    
    // Remove editor-specific attributes
    optimized = optimized.replace(/\s*(inkscape|sodipodi|sketch)[:\w-]*="[^"]*"/g, '');
    
    // Normalize whitespace
    optimized = optimized.replace(/\s+/g, ' ').trim();
    
    return optimized;
  }
  
  /**
   * Scale SVG to fit within bounds
   */
  export function scaleSvg(
    svgString: string,
    maxWidth: number,
    maxHeight: number
  ): { svg: string; scale: number } {
    const parsed = parseSvgString(svgString);
    
    const scaleX = maxWidth / parsed.width;
    const scaleY = maxHeight / parsed.height;
    const scale = Math.min(scaleX, scaleY);
    
    const newWidth = parsed.width * scale;
    const newHeight = parsed.height * scale;
    
    // Replace width and height in SVG
    let scaledSvg = svgString
      .replace(/width="[^"]*"/, `width="${newWidth}"`)
      .replace(/height="[^"]*"/, `height="${newHeight}"`);
    
    // If no viewBox, add one
    if (!parsed.viewBox) {
      scaledSvg = scaledSvg.replace(
        '<svg',
        `<svg viewBox="0 0 ${parsed.width} ${parsed.height}"`
      );
    }
    
    return { svg: scaledSvg, scale };
  }
  
  /**
   * Convert SVG to data URL
   */
  export function svgToDataUrl(svgString: string): string {
    const encoded = encodeURIComponent(svgString);
    return `data:image/svg+xml,${encoded}`;
  }
  
  /**
   * Create SVG string from path data
   */
  export function createSvgFromPath(
    pathData: string,
    options: {
      width?: number;
      height?: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
    } = {}
  ): string {
    const {
      width = 100,
      height = 100,
      fill = 'none',
      stroke = '#000000',
      strokeWidth = 2,
    } = options;
  
    return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <path d="${pathData}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
  </svg>
    `.trim();
  }
  
  /**
   * Validate SVG string
   */
  export function isValidSvg(svgString: string): boolean {
    try {
      parseSvgString(svgString);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get SVG dimensions
   */
  export function getSvgDimensions(svgString: string): { width: number; height: number } {
    const parsed = parseSvgString(svgString);
    return { width: parsed.width, height: parsed.height };
  }