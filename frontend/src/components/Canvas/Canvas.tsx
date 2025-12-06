import { useEffect, useRef, useCallback, useState } from 'react';
import { Graph, Cell } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { History } from '@antv/x6-plugin-history';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Transform } from '@antv/x6-plugin-transform';
import { useEditorStore, useSelectionStore, usePageStore } from '@/store';
import { graphConfig } from '@/config/graphConfig';
import { toolShortcuts } from '@/config/shortcuts';
import { importGraphData, exportGraphData } from '@/utils/graphUtils';
import { CanvasContextMenu } from './CanvasContextMenu';
import './Canvas.css';
import { redrawGridForTheme, ensureGridVisible } from '@/utils/themeUtils';

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [textEdit, setTextEdit] = useState<{ nodeId: string; value: string; x: number; y: number; width: number; height: number; fontSize: number; fontFamily: string; color: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; cell: Cell | null }>({ visible: false, x: 0, y: 0, cell: null });

  const {
    setGraph,
    tool,
    setTool,
    zoom,
    setZoom,
    showGrid,
    showSnaplines,
    setHistoryState,
    theme,
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
      autoResize: false,
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
          enabled: (node) => {
            const d = node.getData<any>();
            return !d?.locked;
          },
          minWidth: 20,
          minHeight: 20,
          orthogonal: true,
          restrict: false,
          preserveAspectRatio: false,
        },
        rotating: {
          enabled: (node) => {
            const d = node.getData<any>();
            return !d?.locked;
          },
          grid: 15,
        },
      })
    );

    // Scroller disabled for true infinite canvas (Draw.io style)
    // The built-in panning (enabled in graphConfig) provides infinite canvas behavior
    // graph.use(
    //   new Scroller({
    //     enabled: true,
    //     pannable: true,
    //     pageVisible: false,
    //     pageBreak: false,
    //     padding: 2000,
    //   })
    // );

    // Store graph reference
    graphRef.current = graph;
    setGraph(graph);

    // Initial grid state
    if (showGrid) {
      ensureGridVisible(graph);
    } else {
      graph.hideGrid();
    }

    graph.centerContent();
    graph.zoomTo(1);

    // Initial Resize handling
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !graphRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Resize graph directly (no scroller)
      graphRef.current.resize(width, height);

      // Redraw grid to ensure it covers new area
      // @ts-ignore
      if (typeof graphRef.current.drawGrid === 'function') {
        // @ts-ignore
        graphRef.current.drawGrid();
      }
    });

    resizeObserver.observe(containerRef.current);

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

    // Double-click to edit text
    graph.on('node:dblclick', ({ node }) => {
      const attrs = node.getAttrs();
      const label = attrs?.label as Record<string, unknown> | undefined;

      if (label) {
        const bbox = node.getBBox();
        const zoom = graph.zoom();
        const translate = graph.translate();

        // Calculate position in screen coordinates
        const x = bbox.x * zoom + translate.tx;
        const y = bbox.y * zoom + translate.ty;
        const width = bbox.width * zoom;
        const height = bbox.height * zoom;

        setTextEdit({
          nodeId: node.id,
          value: (label.text as string) || '',
          x,
          y,
          width,
          height,
          fontSize: ((label.fontSize as number) || 14) * zoom,
          fontFamily: (label.fontFamily as string) || 'DM Sans, sans-serif',
          color: (label.fill as string) || '#333333',
        });
      }
    });


    // Right-click context menu for cells
    graph.on('cell:contextmenu', ({ cell, e }) => {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        cell,
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
        graph.addCell(cloneArray);
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
      ensureGridVisible(graphRef.current);
    } else {
      graphRef.current.hideGrid();
    }
  }, [showGrid]);

  // Handle theme change
  useEffect(() => {
    if (!graphRef.current || !showGrid) return;

    // Delay to ensure DOM update for CSS variables
    const timer = setTimeout(() => {
      if (graphRef.current) {
        ensureGridVisible(graphRef.current);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [theme, showGrid]);

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

  const commitTextEdit = useCallback(() => {
    if (!graphRef.current || !textEdit) return;
    const node = graphRef.current.getCellById(textEdit.nodeId);
    if (node && node.isNode()) {
      node.attr('label/text', textEdit.value);
    }
    setTextEdit(null);
  }, [textEdit]);

  // Context menu handlers
  const handleContextMenuClose = () => {
    setContextMenu({ visible: false, x: 0, y: 0, cell: null });
  };

  const handleDelete = () => {
    if (!graphRef.current || !contextMenu.cell) return;
    graphRef.current.removeCell(contextMenu.cell);
  };

  const handleCut = () => {
    if (!graphRef.current || !contextMenu.cell) return;
    graphRef.current.copy([contextMenu.cell]);
    graphRef.current.removeCell(contextMenu.cell);
  };

  const handleCopy = () => {
    if (!graphRef.current || !contextMenu.cell) return;
    graphRef.current.copy([contextMenu.cell]);
  };

  const handleDuplicate = () => {
    if (!graphRef.current || !contextMenu.cell) return;
    const clones = graphRef.current.cloneCells([contextMenu.cell]);
    const cloneArray = Object.values(clones);
    cloneArray.forEach((cell) => {
      if (cell.isNode()) {
        const pos = cell.getPosition();
        cell.setPosition(pos.x + 20, pos.y + 20);
      }
    });
    graphRef.current.addCell(cloneArray);
  };

  const handleLock = () => {
    if (!contextMenu.cell) return;
    const cell = contextMenu.cell;
    const data = cell.getData<any>() || {};
    const next = !data.locked;
    cell.setData({ ...data, locked: next });
  };

  const handleBringToFront = () => {
    if (!contextMenu.cell) return;
    contextMenu.cell.toFront();
  };

  const handleSendToBack = () => {
    if (!contextMenu.cell) return;
    contextMenu.cell.toBack();
  };

  const handleBringForward = () => {
    if (!graphRef.current || !contextMenu.cell) return;
    const cells = graphRef.current.getCells();
    const currentZ = contextMenu.cell.getZIndex() || 0;

    const higherCells = cells
      .filter(c => (c.getZIndex() || 0) > currentZ)
      .sort((a, b) => (a.getZIndex() || 0) - (b.getZIndex() || 0));

    if (higherCells.length > 0) {
      const targetZ = higherCells[0].getZIndex() || 0;
      contextMenu.cell.setZIndex(targetZ + 1);
    }
  };

  const handleSendBackward = () => {
    if (!graphRef.current || !contextMenu.cell) return;
    const cells = graphRef.current.getCells();
    const currentZ = contextMenu.cell.getZIndex() || 0;

    const lowerCells = cells
      .filter(c => (c.getZIndex() || 0) < currentZ)
      .sort((a, b) => (b.getZIndex() || 0) - (a.getZIndex() || 0));

    if (lowerCells.length > 0) {
      const targetZ = lowerCells[0].getZIndex() || 0;
      contextMenu.cell.setZIndex(targetZ - 1);
    }
  };

  return (
    <div
      ref={containerRef}
      className="canvas-container"
      data-tool={tool}
      onClick={handleCanvasClick}
    >
      {textEdit && (
        <textarea
          style={{
            position: 'absolute',
            left: textEdit.x,
            top: textEdit.y,
            width: textEdit.width,
            height: textEdit.height,
            resize: 'none',
            outline: 'none',
            border: '2px solid var(--color-accent)',
            background: 'rgba(255, 255, 255, 0.95)',
            color: textEdit.color,
            fontSize: textEdit.fontSize,
            fontFamily: textEdit.fontFamily,
            lineHeight: 1.4,
            textAlign: 'center',
            padding: '8px',
            boxSizing: 'border-box',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
          }}
          value={textEdit.value}
          onChange={(e) => setTextEdit({ ...textEdit, value: e.target.value })}
          onBlur={commitTextEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              commitTextEdit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setTextEdit(null);
            }
          }}
          autoFocus
        />
      )}

      <CanvasContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        cell={contextMenu.cell}
        onClose={handleContextMenuClose}
        onDelete={handleDelete}
        onCut={handleCut}
        onCopy={handleCopy}
        onDuplicate={handleDuplicate}
        onLock={handleLock}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
      />
    </div>
  );
}

export default Canvas;
