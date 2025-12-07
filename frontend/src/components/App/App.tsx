import { useEffect } from 'react';
import { Canvas } from '../Canvas';
import { Toolbar } from '../Toolbar/Toolbar';
import { LeftPanel } from '../LeftPanel/LeftPanel';
import { RightPanel } from '../RightPanel/RightPanel';
import { AIChatPanel } from '../AIChatPanel';
import { useEditorStore, usePageStore } from '@/store';
import { registerAllShapes } from '@/shapes';
import styles from './App.module.css';
import { applyThemeClass, redrawGridForTheme } from '@/utils/themeUtils';

// Register all shapes on app load
registerAllShapes();

export function App() {
  const { graph, theme } = useEditorStore();
  const { initialize } = usePageStore();

  useEffect(() => {
    // Initialize with a default page
    initialize();
  }, [initialize]);

  useEffect(() => {
    applyThemeClass(theme);
    if (graph) {
      redrawGridForTheme(graph);
    }
  }, [theme, graph]);

  return (
    <div className={styles.app}>
      <Toolbar />
      <div className={styles.main}>
        <LeftPanel />
        <div className={styles.canvasArea}>
          <Canvas />
        </div>
        <RightPanel />
      </div>

      {/* AI Chat Panel - Floating Window */}
      <AIChatPanel />
    </div>
  );
}

export default App;
