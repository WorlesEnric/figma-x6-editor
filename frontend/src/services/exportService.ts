import type { Graph } from '@antv/x6';
import type { ExportFormat, ExportOptions } from '@/types';
import { exportGraphData } from '@/utils/graphUtils';

/**
 * Export graph to PNG
 */
export async function exportToPng(
  graph: Graph,
  options: {
    scale?: number;
    backgroundColor?: string;
    padding?: number;
    fileName?: string;
  } = {}
): Promise<void> {
  const {
    scale = 2,
    backgroundColor = '#ffffff',
    padding = 20,
    fileName = 'diagram.png',
  } = options;
  
  try {
    // Use X6's built-in export
    const dataUri = await graph.toDataURL({
      type: 'png',
      width: graph.container.clientWidth * scale,
      height: graph.container.clientHeight * scale,
      backgroundColor,
      padding,
    });
    
    downloadDataUri(dataUri, fileName);
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw error;
  }
}

/**
 * Export graph to SVG
 */
export async function exportToSvg(
  graph: Graph,
  options: {
    fileName?: string;
    stylesheet?: string;
  } = {}
): Promise<void> {
  const { fileName = 'diagram.svg', stylesheet } = options;
  
  try {
    const svgString = await graph.toSVG({
      copyStyles: true,
      preserveDimensions: true,
      stylesheet,
    });
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    downloadUrl(url, fileName);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export SVG:', error);
    throw error;
  }
}

/**
 * Export graph to JSON
 */
export function exportToJson(
  graph: Graph,
  options: {
    fileName?: string;
    pretty?: boolean;
  } = {}
): void {
  const { fileName = 'diagram.json', pretty = true } = options;
  
  const data = exportGraphData(graph);
  const jsonString = pretty
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);
  
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  downloadUrl(url, fileName);
  URL.revokeObjectURL(url);
}

/**
 * Export graph in specified format
 */
export async function exportGraph(
  graph: Graph,
  options: ExportOptions & { fileName?: string }
): Promise<void> {
  const { format, fileName } = options;
  
  switch (format) {
    case 'png':
      await exportToPng(graph, {
        scale: options.scale,
        backgroundColor: options.background,
        padding: options.padding,
        fileName: fileName || 'diagram.png',
      });
      break;
    case 'svg':
      await exportToSvg(graph, {
        fileName: fileName || 'diagram.svg',
      });
      break;
    case 'json':
      exportToJson(graph, {
        fileName: fileName || 'diagram.json',
      });
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Copy graph to clipboard as PNG
 */
export async function copyToClipboard(graph: Graph): Promise<void> {
  try {
    const dataUri = await graph.toDataURL({
      type: 'png',
      backgroundColor: '#ffffff',
    });
    
    // Convert data URI to blob
    const response = await fetch(dataUri);
    const blob = await response.blob();
    
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
}

/**
 * Download data URI as file
 */
function downloadDataUri(dataUri: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download URL as file
 */
function downloadUrl(url: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get thumbnail of the current graph
 */
export async function getGraphThumbnail(
  graph: Graph,
  options: {
    width?: number;
    height?: number;
    backgroundColor?: string;
  } = {}
): Promise<string> {
  const { width = 200, height = 140, backgroundColor = '#1a1a1a' } = options;
  
  try {
    const dataUri = await graph.toDataURL({
      type: 'png',
      width,
      height,
      backgroundColor,
    });
    
    return dataUri;
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    return '';
  }
}