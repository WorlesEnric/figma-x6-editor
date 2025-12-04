import { useCallback } from 'react';
import { useEditorStore, useSelectionStore } from '@/store';
import type { Cell, Node, Edge } from '@antv/x6';

export function useSelection() {
  const { graph } = useEditorStore();
  const {
    selectedIds,
    selectedCells,
    selectedNodes,
    selectedEdges,
    bounds,
    setSelection,
    clearSelection,
    addToSelection,
    removeFromSelection,
  } = useSelectionStore();

  // Select a single cell
  const select = useCallback(
    (cell: Cell | string) => {
      if (!graph) return;
      
      const cellObj = typeof cell === 'string' ? graph.getCellById(cell) : cell;
      if (cellObj) {
        graph.cleanSelection();
        graph.select(cellObj);
      }
    },
    [graph]
  );

  // Add cell to selection
  const addToCurrentSelection = useCallback(
    (cell: Cell | string) => {
      if (!graph) return;
      
      const cellObj = typeof cell === 'string' ? graph.getCellById(cell) : cell;
      if (cellObj) {
        const current = graph.getSelectedCells();
        graph.select([...current, cellObj]);
      }
    },
    [graph]
  );

  // Remove cell from selection
  const removeFromCurrentSelection = useCallback(
    (cellId: string) => {
      if (!graph) return;
      
      const cell = graph.getCellById(cellId);
      if (cell) {
        graph.unselect(cell);
      }
    },
    [graph]
  );

  // Clear all selection
  const deselect = useCallback(() => {
    if (!graph) return;
    graph.cleanSelection();
  }, [graph]);

  // Select all cells
  const selectAll = useCallback(() => {
    if (!graph) return;
    const cells = graph.getCells();
    graph.select(cells);
  }, [graph]);

  // Invert selection
  const invertSelection = useCallback(() => {
    if (!graph) return;
    
    const allCells = graph.getCells();
    const selectedIds = new Set(graph.getSelectedCells().map((c) => c.id));
    const toSelect = allCells.filter((c) => !selectedIds.has(c.id));
    
    graph.cleanSelection();
    graph.select(toSelect);
  }, [graph]);

  // Check if a cell is selected
  const isSelected = useCallback(
    (cellId: string) => {
      return selectedIds.includes(cellId);
    },
    [selectedIds]
  );

  // Get selection count
  const selectionCount = selectedCells.length;
  const hasSelection = selectionCount > 0;
  const hasSingleSelection = selectionCount === 1;
  const hasMultipleSelection = selectionCount > 1;

  return {
    // State
    selectedIds,
    selectedCells,
    selectedNodes,
    selectedEdges,
    bounds,
    selectionCount,
    hasSelection,
    hasSingleSelection,
    hasMultipleSelection,
    
    // Actions
    select,
    addToCurrentSelection,
    removeFromCurrentSelection,
    deselect,
    selectAll,
    invertSelection,
    isSelected,
    setSelection,
    clearSelection,
  };
}

export default useSelection;