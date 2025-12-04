import { useCallback } from 'react';
import { useEditorStore } from '@/store';

export function useHistory() {
  const { graph, canUndo, canRedo, setHistoryState } = useEditorStore();

  const undo = useCallback(() => {
    if (graph && canUndo) {
      graph.undo();
    }
  }, [graph, canUndo]);

  const redo = useCallback(() => {
    if (graph && canRedo) {
      graph.redo();
    }
  }, [graph, canRedo]);

  const clearHistory = useCallback(() => {
    if (graph) {
      graph.cleanHistory();
      setHistoryState(false, false);
    }
  }, [graph, setHistoryState]);

  // Get history stack info
  const getHistoryInfo = useCallback(() => {
    if (!graph) return { undoStackSize: 0, redoStackSize: 0 };
    
    return {
      undoStackSize: graph.getUndoStackSize?.() || 0,
      redoStackSize: graph.getRedoStackSize?.() || 0,
    };
  }, [graph]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
    getHistoryInfo,
  };
}

export default useHistory;