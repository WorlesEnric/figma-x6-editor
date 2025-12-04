import { useEffect, useRef, useCallback } from 'react';
import { Graph } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { History } from '@antv/x6-plugin-history';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Transform } from '@antv/x6-plugin-transform';
import { Scroller } from '@antv/x6-plugin-scroller';
import { graphConfig } from '@/config/graphConfig';

interface UseGraphOptions {
  container: HTMLElement | null;
  onSelectionChange?: (cells: any[]) => void;
  onZoomChange?: (zoom: number) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

export function useGraph(options: UseGraphOptions) {
  const { container, onSelectionChange, onZoomChange, onHistoryChange } = options;
  const graphRef = useRef<Graph | null>(null);

  // Initialize graph
  useEffect(() => {
    if (!container) return;

    const graph = new Graph({
      container,
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
      })
    );

    graph.use(new Snapline({ enabled: true, sharp: true }));
    graph.use(new History({ enabled: true }));
    graph.use(new Clipboard({ enabled: true, useLocalStorage: true }));
    graph.use(new Keyboard({ enabled: true, global: true }));

    graph.use(
      new Transform({
        resizing: {
          enabled: true,
          minWidth: 20,
          minHeight: 20,
          orthogonal: true,
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
      })
    );

    // Event listeners
    graph.on('selection:changed', ({ selected }) => {
      onSelectionChange?.(selected);
    });

    graph.on('scale', ({ sx }) => {
      onZoomChange?.(Math.round(sx * 100));
    });

    graph.on('history:change', () => {
      onHistoryChange?.(graph.canUndo(), graph.canRedo());
    });

    graphRef.current = graph;

    return () => {
      graph.dispose();
      graphRef.current = null;
    };
  }, [container]);

  // Graph methods
  const addNode = useCallback((config: any) => {
    return graphRef.current?.addNode(config);
  }, []);

  const addEdge = useCallback((config: any) => {
    return graphRef.current?.addEdge(config);
  }, []);

  const removeCell = useCallback((cellId: string) => {
    const cell = graphRef.current?.getCellById(cellId);
    if (cell) {
      graphRef.current?.removeCell(cell);
    }
  }, []);

  const clearCells = useCallback(() => {
    graphRef.current?.clearCells();
  }, []);

  const undo = useCallback(() => {
    graphRef.current?.undo();
  }, []);

  const redo = useCallback(() => {
    graphRef.current?.redo();
  }, []);

  const zoomTo = useCallback((scale: number) => {
    graphRef.current?.zoomTo(scale / 100);
  }, []);

  const zoomToFit = useCallback(() => {
    graphRef.current?.zoomToFit({ padding: 50, maxScale: 1 });
  }, []);

  const copy = useCallback(() => {
    const cells = graphRef.current?.getSelectedCells();
    if (cells?.length) {
      graphRef.current?.copy(cells);
    }
  }, []);

  const paste = useCallback(() => {
    if (!graphRef.current?.isClipboardEmpty()) {
      const cells = graphRef.current?.paste({ offset: 20 });
      graphRef.current?.cleanSelection();
      graphRef.current?.select(cells || []);
    }
  }, []);

  const deleteSelected = useCallback(() => {
    const cells = graphRef.current?.getSelectedCells();
    if (cells?.length) {
      graphRef.current?.removeCells(cells);
    }
  }, []);

  return {
    graph: graphRef.current,
    addNode,
    addEdge,
    removeCell,
    clearCells,
    undo,
    redo,
    zoomTo,
    zoomToFit,
    copy,
    paste,
    deleteSelected,
  };
}

export default useGraph;