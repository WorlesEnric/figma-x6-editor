import { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store';
import { toolShortcuts } from '@/config/shortcuts';
import type { ToolType } from '@/types';

export function useKeyboard() {
  const { graph, setTool, tool } = useEditorStore();

  // Handle tool shortcuts
  const handleToolShortcut = useCallback(
    (key: string) => {
      const toolName = toolShortcuts[key.toLowerCase()];
      if (toolName) {
        setTool(toolName as ToolType);
        return true;
      }
      return false;
    },
    [setTool]
  );

  // Setup keyboard listeners
  useEffect(() => {
    if (!graph) return;

    // Tool shortcuts are handled in Canvas component via X6 keyboard plugin
    // This hook provides additional keyboard functionality

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Single key shortcuts (when not modifier key pressed)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        // Tool shortcuts
        if (handleToolShortcut(e.key)) {
          e.preventDefault();
          return;
        }

        // Space bar for temporary hand tool
        if (e.key === ' ' && tool !== 'hand') {
          e.preventDefault();
          // Don't change tool, just enable panning via space
        }
      }

    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [graph, tool, handleToolShortcut]);

  return {
    handleToolShortcut,
  };
}

export default useKeyboard;