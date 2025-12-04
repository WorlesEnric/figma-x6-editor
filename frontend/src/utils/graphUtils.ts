import type { Graph, Node, Edge, Cell } from '@antv/x6';
import type { GraphData, NodeData, EdgeData } from '@/types';

/**
 * Export graph data to JSON format
 */
export function exportGraphData(graph: Graph): GraphData {
  const cells = graph.getCells();
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];
  
  cells.forEach((cell) => {
    if (cell.isNode()) {
      const node = cell as Node;
      const bbox = node.getBBox();
      nodes.push({
        id: node.id,
        shape: node.shape,
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height,
        angle: node.getAngle(),
        label: node.getAttrByPath('label/text') as string,
        attrs: node.getAttrs(),
        data: node.getData(),
        zIndex: node.getZIndex(),
        parent: node.getParentId(),
        children: node.getChildCount() > 0 ? node.getChildren()?.map(c => c.id) : undefined,
      });
    } else if (cell.isEdge()) {
      const edge = cell as Edge;
      edges.push({
        id: edge.id,
        shape: edge.shape,
        source: edge.getSourceCellId() || '',
        target: edge.getTargetCellId() || '',
        vertices: edge.getVertices(),
        attrs: edge.getAttrs(),
        labels: edge.getLabels(),
        data: edge.getData(),
        zIndex: edge.getZIndex(),
      });
    }
  });
  
  return { nodes, edges };
}

/**
 * Import graph data from JSON format
 */
export function importGraphData(graph: Graph, data: GraphData) {
  graph.clearCells();
  
  // Add nodes first
  data.nodes.forEach((nodeData) => {
    graph.addNode({
      id: nodeData.id,
      shape: nodeData.shape,
      x: nodeData.x,
      y: nodeData.y,
      width: nodeData.width,
      height: nodeData.height,
      angle: nodeData.angle,
      attrs: nodeData.attrs,
      data: nodeData.data,
      zIndex: nodeData.zIndex,
    });
  });
  
  // Then add edges
  data.edges.forEach((edgeData) => {
    graph.addEdge({
      id: edgeData.id,
      shape: edgeData.shape || 'edge',
      source: edgeData.source,
      target: edgeData.target,
      vertices: edgeData.vertices,
      attrs: edgeData.attrs,
      labels: edgeData.labels,
      data: edgeData.data,
      zIndex: edgeData.zIndex,
    });
  });
  
  // Restore parent-child relationships
  data.nodes.forEach((nodeData) => {
    if (nodeData.parent) {
      const child = graph.getCellById(nodeData.id);
      const parent = graph.getCellById(nodeData.parent);
      if (child && parent && parent.isNode()) {
        (parent as Node).addChild(child);
      }
    }
  });
}

/**
 * Center the graph view on a specific cell
 */
export function centerOnCell(graph: Graph, cell: Cell) {
  const bbox = cell.getBBox();
  graph.centerCell(cell);
}

/**
 * Zoom to fit all cells in the viewport
 */
export function zoomToFit(graph: Graph, padding = 50) {
  graph.zoomToFit({ padding, maxScale: 1 });
}

/**
 * Get the current zoom level as percentage
 */
export function getZoomPercentage(graph: Graph): number {
  return Math.round(graph.zoom() * 100);
}

/**
 * Set zoom level from percentage
 */
export function setZoomPercentage(graph: Graph, percentage: number) {
  graph.zoomTo(percentage / 100);
}

/**
 * Delete selected cells
 */
export function deleteSelectedCells(graph: Graph) {
  const cells = graph.getSelectedCells();
  if (cells.length > 0) {
    graph.removeCells(cells);
  }
}

/**
 * Duplicate selected cells
 */
export function duplicateSelectedCells(graph: Graph, offset = { x: 20, y: 20 }) {
  const cells = graph.getSelectedCells();
  if (cells.length === 0) return;
  
  const clones = graph.cloneCells(cells);
  const cloneArray = Object.values(clones);
  
  cloneArray.forEach((cell) => {
    if (cell.isNode()) {
      const pos = cell.getPosition();
      cell.setPosition(pos.x + offset.x, pos.y + offset.y);
    }
  });
  
  graph.addCells(cloneArray);
  graph.cleanSelection();
  graph.select(cloneArray);
}

/**
 * Group selected nodes
 */
export function groupSelectedNodes(graph: Graph) {
  const nodes = graph.getSelectedCells().filter(c => c.isNode()) as Node[];
  if (nodes.length < 2) return null;
  
  // Calculate bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  nodes.forEach((node) => {
    const bbox = node.getBBox();
    minX = Math.min(minX, bbox.x);
    minY = Math.min(minY, bbox.y);
    maxX = Math.max(maxX, bbox.x + bbox.width);
    maxY = Math.max(maxY, bbox.y + bbox.height);
  });
  
  const padding = 20;
  
  // Create group node
  const group = graph.addNode({
    shape: 'custom-frame',
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
    zIndex: Math.min(...nodes.map(n => n.getZIndex() || 0)) - 1,
    data: { isGroup: true },
  });
  
  // Add nodes as children
  nodes.forEach((node) => {
    group.addChild(node);
  });
  
  graph.cleanSelection();
  graph.select(group);
  
  return group;
}

/**
 * Ungroup selected group
 */
export function ungroupSelectedNodes(graph: Graph) {
  const cells = graph.getSelectedCells();
  const groups = cells.filter((cell) => {
    const data = cell.getData<{ isGroup?: boolean }>();
    return data?.isGroup;
  }) as Node[];
  
  groups.forEach((group) => {
    const children = group.getChildren() || [];
    
    // Remove children from group first
    children.forEach((child) => {
      group.removeChild(child);
    });
    
    // Select the former children
    graph.select(children);
    
    // Remove the group
    graph.removeCell(group);
  });
}

/**
 * Bring selected cells to front
 */
export function bringToFront(graph: Graph) {
  const cells = graph.getSelectedCells();
  cells.forEach((cell) => {
    cell.toFront();
  });
}

/**
 * Send selected cells to back
 */
export function sendToBack(graph: Graph) {
  const cells = graph.getSelectedCells();
  cells.forEach((cell) => {
    cell.toBack();
  });
}

/**
 * Bring selected cells forward by one level
 */
export function bringForward(graph: Graph) {
  const cells = graph.getSelectedCells();
  cells.forEach((cell) => {
    const zIndex = cell.getZIndex() || 0;
    cell.setZIndex(zIndex + 1);
  });
}

/**
 * Send selected cells backward by one level
 */
export function sendBackward(graph: Graph) {
  const cells = graph.getSelectedCells();
  cells.forEach((cell) => {
    const zIndex = cell.getZIndex() || 0;
    cell.setZIndex(Math.max(0, zIndex - 1));
  });
}

/**
 * Align selected nodes
 */
export type AlignType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

export function alignNodes(graph: Graph, type: AlignType) {
  const nodes = graph.getSelectedCells().filter(c => c.isNode()) as Node[];
  if (nodes.length < 2) return;
  
  const bboxes = nodes.map(n => n.getBBox());
  
  let target: number;
  
  switch (type) {
    case 'left':
      target = Math.min(...bboxes.map(b => b.x));
      nodes.forEach((node, i) => {
        node.setPosition(target, bboxes[i].y);
      });
      break;
    case 'center':
      const centerX = bboxes.reduce((sum, b) => sum + b.x + b.width / 2, 0) / bboxes.length;
      nodes.forEach((node, i) => {
        node.setPosition(centerX - bboxes[i].width / 2, bboxes[i].y);
      });
      break;
    case 'right':
      target = Math.max(...bboxes.map(b => b.x + b.width));
      nodes.forEach((node, i) => {
        node.setPosition(target - bboxes[i].width, bboxes[i].y);
      });
      break;
    case 'top':
      target = Math.min(...bboxes.map(b => b.y));
      nodes.forEach((node, i) => {
        node.setPosition(bboxes[i].x, target);
      });
      break;
    case 'middle':
      const centerY = bboxes.reduce((sum, b) => sum + b.y + b.height / 2, 0) / bboxes.length;
      nodes.forEach((node, i) => {
        node.setPosition(bboxes[i].x, centerY - bboxes[i].height / 2);
      });
      break;
    case 'bottom':
      target = Math.max(...bboxes.map(b => b.y + b.height));
      nodes.forEach((node, i) => {
        node.setPosition(bboxes[i].x, target - bboxes[i].height);
      });
      break;
  }
}

/**
 * Distribute selected nodes evenly
 */
export type DistributeType = 'horizontal' | 'vertical';

export function distributeNodes(graph: Graph, type: DistributeType) {
  const nodes = graph.getSelectedCells().filter(c => c.isNode()) as Node[];
  if (nodes.length < 3) return;
  
  const bboxes = nodes.map(n => ({ node: n, bbox: n.getBBox() }));
  
  if (type === 'horizontal') {
    bboxes.sort((a, b) => a.bbox.x - b.bbox.x);
    const minX = bboxes[0].bbox.x;
    const maxX = bboxes[bboxes.length - 1].bbox.x + bboxes[bboxes.length - 1].bbox.width;
    const totalWidth = bboxes.reduce((sum, { bbox }) => sum + bbox.width, 0);
    const gap = (maxX - minX - totalWidth) / (bboxes.length - 1);
    
    let currentX = minX;
    bboxes.forEach(({ node, bbox }) => {
      node.setPosition(currentX, bbox.y);
      currentX += bbox.width + gap;
    });
  } else {
    bboxes.sort((a, b) => a.bbox.y - b.bbox.y);
    const minY = bboxes[0].bbox.y;
    const maxY = bboxes[bboxes.length - 1].bbox.y + bboxes[bboxes.length - 1].bbox.height;
    const totalHeight = bboxes.reduce((sum, { bbox }) => sum + bbox.height, 0);
    const gap = (maxY - minY - totalHeight) / (bboxes.length - 1);
    
    let currentY = minY;
    bboxes.forEach(({ node, bbox }) => {
      node.setPosition(bbox.x, currentY);
      currentY += bbox.height + gap;
    });
  }
}