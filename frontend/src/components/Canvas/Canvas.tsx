import { useEffect, useRef, useCallback } from 'react';
import { Graph } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { History } from '@antv/x6-plugin-history';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Transform } from '@antv/x6-plugin-transform';
import { Scroller } from '@antv/x6-plugin-scroller';
import { useEditorStore, useSelectionStore, usePageStore } from '@/store';
import { graphConfig } from '@/config/graphConfig';
import { toolShortcuts } from '@/config/shortcuts';
import { importGraphData, exportGraphData } from '@/utils/graphUtils';
import './Canvas.css';

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  
  const { 
    setGraph, 
    tool, 
    setTool,
    zoom,
    setZoom,
    showGrid, 
    showSnaplines,
    setHistoryState,
  } = useEditorStore();
  
  const { setSelection, clearSelection } = useSelectionStore();
  const { currentPage, currentPageId, updatePageData } = usePageStore();
  
  // Save current page data
  const saveCurrentPageData = useCallback(() => {
    if (graphRef.current && currentPageId) {
      const data = exportGraphData(graphRef.current);
      updatePageData(currentPageId, data);
    }
  }, [currentPageId, updatePageData]);

  // Initialize graph
  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      autoResize: true,
      ...graphConfig,
    });

    // Register plugins
    graph.use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
        showEdgeSelectionBox: true,
        pointerEvents: 'none',
      })
    );

    graph.use(
      new Snapline({
        enabled: showSnaplines,
        sharp: true,
      })
    );

    graph.use(
      new History({
        enabled: true,
      })
    );

    graph.use(
      new Clipboard({
        enabled: true,
        useLocalStorage: true,
      })
    );

    graph.use(
      new Keyboard({
        enabled: true,
        global: true,
      })
    );

    graph.use(
      new Transform({
        resizing: {
          enabled: true,
          minWidth: 20,
          minHeight: 20,
          orthogonal: true,
          restrict: false,
          preserveAspectRatio: false,
        },
        rotating: {
          enabled: true,
          grid: 15,
        },
      })
    );

    graph.use(
      new Scroller({
        enabled: true,
        pannable: true,
        pageVisible: false,
        pageBreak: false,
      })
    );

    // Store graph reference
    graphRef.current = graph;
    setGraph(graph);

    // Initial grid state
    if (!showGrid) {
      graph.hideGrid();
    }

    // Event listeners
    graph.on('selection:changed', ({ selected }) => {
      if (selected.length > 0) {
        setSelection(selected);
      } else {
        clearSelection();
      }
    });

    graph.on('scale', ({ sx }) => {
      setZoom(Math.round(sx * 100));
    });

    graph.on('history:change', () => {
      setHistoryState(graph.canUndo(), graph.canRedo());
    });

    // Show ports on hover
    graph.on('node:mouseenter', ({ node }) => {
      const ports = node.getPorts();
      ports.forEach((port) => {
        node.portProp(port.id!, 'attrs/circle/style/visibility', 'visible');
      });
    });

    graph.on('node:mouseleave', ({ node }) => {
      const ports = node.getPorts();
      ports.forEach((port) => {
        node.portProp(port.id!, 'attrs/circle/style/visibility', 'hidden');
      });
    });

    // Register keyboard shortcuts
    // Tool shortcuts
    Object.entries(toolShortcuts).forEach(([key, toolName]) => {
      graph.bindKey(key, () => {
        setTool(toolName as any);
        return false;
      });
    });

    // Undo/Redo
    graph.bindKey(['ctrl+z', 'meta+z'], () => {
      graph.undo();
      return false;
    });

    graph.bindKey(['ctrl+shift+z', 'meta+shift+z', 'ctrl+y', 'meta+y'], () => {
      graph.redo();
      return false;
    });

    // Copy/Paste/Cut
    graph.bindKey(['ctrl+c', 'meta+c'], () => {
      const cells = graph.getSelectedCells();
      if (cells.length) {
        graph.copy(cells);
      }
      return false;
    });

    graph.bindKey(['ctrl+v', 'meta+v'], () => {
      if (!graph.isClipboardEmpty()) {
        const cells = graph.paste({ offset: 20 });
        graph.cleanSelection();
        graph.select(cells);
      }
      return false;
    });

    graph.bindKey(['ctrl+x', 'meta+x'], () => {
      const cells = graph.getSelectedCells();
      if (cells.length) {
        graph.cut(cells);
      }
      return false;
    });

    // Delete
    graph.bindKey(['delete', 'backspace'], () => {
      const cells = graph.getSelectedCells();
      if (cells.length) {
        graph.removeCells(cells);
      }
      return false;
    });

    // Select all
    graph.bindKey(['ctrl+a', 'meta+a'], () => {
      const cells = graph.getCells();
      graph.select(cells);
      return false;
    });

    // Duplicate
    graph.bindKey(['ctrl+d', 'meta+d'], () => {
      const cells = graph.getSelectedCells();
      if (cells.length) {
        const clones = graph.cloneCells(cells);
        const cloneArray = Object.values(clones);
        cloneArray.forEach((cell) => {
          if (cell.isNode()) {
            const pos = cell.getPosition();
            cell.setPosition(pos.x + 20, pos.y + 20);
          }
        });
        graph.addCells(cloneArray);
        graph.cleanSelection();
        graph.select(cloneArray);
      }
      return false;
    });

    // Zoom controls
    graph.bindKey(['ctrl+=', 'meta+=', 'ctrl+plus', 'meta+plus'], () => {
      const currentZoom = graph.zoom();
      graph.zoomTo(Math.min(currentZoom + 0.25, 5));
      return false;
    });

    graph.bindKey(['ctrl+-', 'meta+-', 'ctrl+minus', 'meta+minus'], () => {
      const currentZoom = graph.zoom();
      graph.zoomTo(Math.max(currentZoom - 0.25, 0.1));
      return false;
    });

    graph.bindKey(['ctrl+0', 'meta+0'], () => {
      graph.zoomTo(1);
      return false;
    });

    graph.bindKey(['ctrl+1', 'meta+1'], () => {
      graph.zoomToFit({ padding: 50, maxScale: 1 });
      return false;
    });

    // Escape to deselect
    graph.bindKey('escape', () => {
      graph.cleanSelection();
      setTool('select');
      return false;
    });

    // Cleanup
    return () => {
      saveCurrentPageData();
      graph.dispose();
      graphRef.current = null;
      setGraph(null);
    };
  }, []);

  // Handle page changes
  useEffect(() => {
    if (!graphRef.current || !currentPage) return;

    const graph = graphRef.current;
    
    // Clear current graph
    graph.clearCells();

    // Load page data if exists
    if (currentPage.data) {
      importGraphData(graph, currentPage.data);
    }

    // Reset view
    graph.centerContent();
  }, [currentPageId]);

  // Handle tool changes
  useEffect(() => {
    if (!graphRef.current) return;

    const graph = graphRef.current;

    // Update cursor based on tool
    const container = containerRef.current;
    if (container) {
      container.dataset.tool = tool;
    }

    // Handle hand tool (panning)
    if (tool === 'hand') {
      graph.disableSelection();
    } else {
      graph.enableSelection();
    }
  }, [tool]);

  // Handle grid visibility
  useEffect(() => {
    if (!graphRef.current) return;
    
    if (showGrid) {
      graphRef.current.showGrid();
    } else {
      graphRef.current.hideGrid();
    }
  }, [showGrid]);

  // Handle snapline visibility
  useEffect(() => {
    if (!graphRef.current) return;
    
    if (showSnaplines) {
      graphRef.current.enableSnapline();
    } else {
      graphRef.current.disableSnapline();
    }
  }, [showSnaplines]);

  // Handle zoom changes from store
  useEffect(() => {
    if (!graphRef.current) return;
    
    const currentZoom = Math.round(graphRef.current.zoom() * 100);
    if (currentZoom !== zoom) {
      graphRef.current.zoomTo(zoom / 100);
    }
  }, [zoom]);

  // Handle drawing new shapes
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!graphRef.current) return;
    
    const graph = graphRef.current;
    
    // Only create shapes in drawing mode
    if (!['rectangle', 'ellipse', 'diamond', 'triangle', 'text', 'frame'].includes(tool)) {
      return;
    }

    const point = graph.clientToLocal(e.clientX, e.clientY);
    
    const shapeMap: Record<string, { shape: string; width: number; height: number }> = {
      rectangle: { shape: 'custom-rect', width: 100, height: 60 },
      ellipse: { shape: 'custom-ellipse', width: 80, height: 80 },
      diamond: { shape: 'custom-diamond', width: 80, height: 80 },
      triangle: { shape: 'custom-triangle', width: 80, height: 80 },
      text: { shape: 'custom-text', width: 100, height: 40 },
      frame: { shape: 'custom-frame', width: 300, height: 200 },
    };

    const config = shapeMap[tool];
    if (!config) return;

    const node = graph.addNode({
      shape: config.shape,
      x: point.x - config.width / 2,
      y: point.y - config.height / 2,
      width: config.width,
      height: config.height,
    });

    graph.cleanSelection();
    graph.select(node);
    
    // Switch back to select tool
    setTool('select');
  }, [tool, setTool]);

  return (
    <div 
      ref={containerRef} 
      className="canvas-container"
      data-tool={tool}
      onClick={handleCanvasClick}
    />
  );
}

export default Canvas;