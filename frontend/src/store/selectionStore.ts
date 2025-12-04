import { create } from 'zustand';
import type { Cell, Node, Edge } from '@antv/x6';
import type { SelectionBounds, FillStyle, StrokeStyle, TextStyle, Transform } from '@/types';

interface SelectionStore {
  // Selection state
  selectedIds: string[];
  selectedCells: Cell[];
  selectedNodes: Node[];
  selectedEdges: Edge[];
  bounds: SelectionBounds | null;
  
  // Selection operations
  setSelection: (cells: Cell[]) => void;
  clearSelection: () => void;
  addToSelection: (cell: Cell) => void;
  removeFromSelection: (cellId: string) => void;
  
  // Computed properties for selected elements
  commonFill: FillStyle | null;
  commonStroke: StrokeStyle | null;
  commonText: TextStyle | null;
  transform: Transform | null;
  
  // Property updates
  setCommonFill: (fill: Partial<FillStyle>) => void;
  setCommonStroke: (stroke: Partial<StrokeStyle>) => void;
  setCommonText: (text: Partial<TextStyle>) => void;
  setTransform: (transform: Partial<Transform>) => void;
  
  // Update properties on selected cells
  updateSelectedFill: (fill: Partial<FillStyle>) => void;
  updateSelectedStroke: (stroke: Partial<StrokeStyle>) => void;
}

const extractFillFromCell = (cell: Cell): FillStyle | null => {
  if (!cell.isNode()) return null;
  const attrs = cell.getAttrs();
  const bodyFill = attrs?.body?.fill as string;
  const bodyOpacity = attrs?.body?.fillOpacity as number;
  
  if (!bodyFill || bodyFill === 'none') {
    return { type: 'none', color: '#000000', opacity: 1 };
  }
  
  return {
    type: 'solid',
    color: bodyFill || '#ffffff',
    opacity: bodyOpacity ?? 1,
  };
};

const extractStrokeFromCell = (cell: Cell): StrokeStyle | null => {
  if (!cell.isNode()) return null;
  const attrs = cell.getAttrs();
  
  return {
    color: (attrs?.body?.stroke as string) || '#000000',
    width: (attrs?.body?.strokeWidth as number) || 1,
    opacity: (attrs?.body?.strokeOpacity as number) ?? 1,
    dasharray: attrs?.body?.strokeDasharray as string,
  };
};

const calculateBounds = (cells: Cell[]): SelectionBounds | null => {
  if (cells.length === 0) return null;
  
  const nodes = cells.filter(c => c.isNode()) as Node[];
  if (nodes.length === 0) return null;
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  nodes.forEach(node => {
    const bbox = node.getBBox();
    minX = Math.min(minX, bbox.x);
    minY = Math.min(minY, bbox.y);
    maxX = Math.max(maxX, bbox.x + bbox.width);
    maxY = Math.max(maxY, bbox.y + bbox.height);
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  // Initial state
  selectedIds: [],
  selectedCells: [],
  selectedNodes: [],
  selectedEdges: [],
  bounds: null,
  commonFill: null,
  commonStroke: null,
  commonText: null,
  transform: null,
  
  setSelection: (cells) => {
    const nodes = cells.filter(c => c.isNode()) as Node[];
    const edges = cells.filter(c => c.isEdge()) as Edge[];
    const bounds = calculateBounds(cells);
    
    // Extract common properties
    let commonFill: FillStyle | null = null;
    let commonStroke: StrokeStyle | null = null;
    let transform: Transform | null = null;
    
    if (nodes.length > 0) {
      commonFill = extractFillFromCell(nodes[0]);
      commonStroke = extractStrokeFromCell(nodes[0]);
      
      if (nodes.length === 1) {
        const bbox = nodes[0].getBBox();
        const angle = nodes[0].getAngle() || 0;
        transform = {
          x: Math.round(bbox.x),
          y: Math.round(bbox.y),
          width: Math.round(bbox.width),
          height: Math.round(bbox.height),
          angle: Math.round(angle),
        };
      } else if (bounds) {
        transform = {
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
          angle: 0,
        };
      }
    }
    
    set({
      selectedIds: cells.map(c => c.id),
      selectedCells: cells,
      selectedNodes: nodes,
      selectedEdges: edges,
      bounds,
      commonFill,
      commonStroke,
      transform,
    });
  },
  
  clearSelection: () => {
    set({
      selectedIds: [],
      selectedCells: [],
      selectedNodes: [],
      selectedEdges: [],
      bounds: null,
      commonFill: null,
      commonStroke: null,
      commonText: null,
      transform: null,
    });
  },
  
  addToSelection: (cell) => {
    const { selectedCells } = get();
    if (!selectedCells.find(c => c.id === cell.id)) {
      get().setSelection([...selectedCells, cell]);
    }
  },
  
  removeFromSelection: (cellId) => {
    const { selectedCells } = get();
    get().setSelection(selectedCells.filter(c => c.id !== cellId));
  },
  
  setCommonFill: (fill) => {
    set((state) => ({
      commonFill: state.commonFill ? { ...state.commonFill, ...fill } : null,
    }));
  },
  
  setCommonStroke: (stroke) => {
    set((state) => ({
      commonStroke: state.commonStroke ? { ...state.commonStroke, ...stroke } : null,
    }));
  },
  
  setCommonText: (text) => {
    set((state) => ({
      commonText: state.commonText ? { ...state.commonText, ...text } : null,
    }));
  },
  
  setTransform: (transform) => {
    set((state) => ({
      transform: state.transform ? { ...state.transform, ...transform } : null,
    }));
  },
  
  updateSelectedFill: (fill) => {
    const { selectedNodes, commonFill } = get();
    if (!commonFill) return;
    
    const newFill = { ...commonFill, ...fill };
    
    selectedNodes.forEach(node => {
      if (newFill.type === 'none') {
        node.attr('body/fill', 'none');
      } else {
        node.attr('body/fill', newFill.color);
        node.attr('body/fillOpacity', newFill.opacity);
      }
    });
    
    set({ commonFill: newFill });
  },
  
  updateSelectedStroke: (stroke) => {
    const { selectedNodes, commonStroke } = get();
    if (!commonStroke) return;
    
    const newStroke = { ...commonStroke, ...stroke };
    
    selectedNodes.forEach(node => {
      node.attr('body/stroke', newStroke.color);
      node.attr('body/strokeWidth', newStroke.width);
      node.attr('body/strokeOpacity', newStroke.opacity);
      if (newStroke.dasharray) {
        node.attr('body/strokeDasharray', newStroke.dasharray);
      }
    });
    
    set({ commonStroke: newStroke });
  },
}));