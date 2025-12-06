import { create } from 'zustand';
import type { Graph } from '@antv/x6';
import type { ToolType, EditorState } from '@/types';

interface EditorStore extends EditorState {
  // Graph instance
  graph: Graph | null;
  setGraph: (graph: Graph | null) => void;
 
  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  
  // Tool management
  setTool: (tool: ToolType) => void;
  
  // Zoom
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  zoomTo100: () => void;
  
  // View options
  toggleGrid: () => void;
  toggleSnaplines: () => void;
  toggleMinimap: () => void;
  
  // Drawing state
  setIsDrawing: (isDrawing: boolean) => void;
  setIsPanning: (isPanning: boolean) => void;
  
  // History
  canUndo: boolean;
  canRedo: boolean;
  setHistoryState: (canUndo: boolean, canRedo: boolean) => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial state
  graph: null,
  tool: 'select',
  zoom: 100,
  showGrid: true,
  showSnaplines: true,
  showMinimap: true,
  isDrawing: false,
  isPanning: false,
  canUndo: false,
  canRedo: false,
  theme: (typeof window !== 'undefined' && (localStorage.getItem('editor-theme') as 'dark' | 'light')) || 'dark',
  
  // Graph
  setGraph: (graph) => set({ graph }),

  // Theme
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('editor-theme', theme);
    }
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  // Tool
  setTool: (tool) => {
    const { graph, isPanning } = get();
    
    // Handle hand tool (panning)
    if (tool === 'hand') {
      set({ tool, isPanning: true });
      if (graph) {
        graph.disableSelection();
      }
    } else {
      set({ tool, isPanning: false });
      if (graph) {
        graph.enableSelection();
      }
    }
  },
  
  // Zoom
  setZoom: (zoom) => {
    const { graph } = get();
    const clampedZoom = Math.min(Math.max(zoom, 10), 500);
    set({ zoom: clampedZoom });
    if (graph) {
      graph.zoomTo(clampedZoom / 100);
    }
  },
  
  zoomIn: () => {
    const { zoom, setZoom } = get();
    setZoom(Math.min(zoom + 25, 500));
  },
  
  zoomOut: () => {
    const { zoom, setZoom } = get();
    setZoom(Math.max(zoom - 25, 10));
  },
  
  zoomToFit: () => {
    const { graph } = get();
    if (graph) {
      graph.zoomToFit({ padding: 50, maxScale: 1 });
      const scale = graph.zoom();
      set({ zoom: Math.round(scale * 100) });
    }
  },
  
  zoomTo100: () => {
    const { setZoom } = get();
    setZoom(100);
  },
  
  // View options
  toggleGrid: () => {
    const { graph, showGrid } = get();
    set({ showGrid: !showGrid });
    if (graph) {
      if (showGrid) {
        graph.hideGrid();
      } else {
        graph.showGrid();
      }
    }
  },
  
  toggleSnaplines: () => {
    const { graph, showSnaplines } = get();
    set({ showSnaplines: !showSnaplines });
    if (graph) {
      if (showSnaplines) {
        graph.disableSnapline();
      } else {
        graph.enableSnapline();
      }
    }
  },
  
  toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
  
  // Drawing
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  setIsPanning: (isPanning) => set({ isPanning }),
  
  // History
  setHistoryState: (canUndo, canRedo) => set({ canUndo, canRedo }),
  
  undo: () => {
    const { graph } = get();
    if (graph) {
      graph.undo();
    }
  },
  
  redo: () => {
    const { graph } = get();
    if (graph) {
      graph.redo();
    }
  },
}));
