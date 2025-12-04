import { useEffect } from 'react';
import { Canvas } from '../Canvas';
import { Toolbar } from '../Toolbar/Toolbar';
import { LeftPanel } from '../LeftPanel/LeftPanel';
import { RightPanel } from '../RightPanel/RightPanel';
import { Minimap } from '../Minimap/Minimap';
import { useEditorStore, usePageStore } from '@/store';
import { registerAllShapes } from '@/shapes';
import styles from './App.module.css';

// Register all shapes on app load
registerAllShapes();

export function App() {
  const { showMinimap, graph } = useEditorStore();
  const { initialize } = usePageStore();

  useEffect(() => {
    // Initialize with a default page
    initialize();
  }, [initialize]);

  return (
    <div className={styles.app}>
      <Toolbar />
      <div className={styles.main}>
        <LeftPanel />
        <div className={styles.canvasArea}>
          <Canvas />
          {showMinimap && graph && <Minimap />}
        </div>
        <RightPanel />
      </div>
    </div>
  );
}

export default App;