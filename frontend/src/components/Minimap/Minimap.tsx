import { useEffect, useRef } from 'react';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { useEditorStore } from '@/store';
import styles from './Minimap.module.css';

export function Minimap() {
  const { graph } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<MiniMap | null>(null);

  useEffect(() => {
    if (!graph || !containerRef.current) return;

    // Initialize minimap
    if (!minimapRef.current) {
      minimapRef.current = new MiniMap({
        container: containerRef.current,
        width: 200,
        height: 140,
        padding: 10,
        scalable: true,
        minScale: 0.01,
        maxScale: 2,
        graphOptions: {
          async: true,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          createCellView: (cell) => {
            // Simplified view for minimap
            if (cell.isEdge()) {
              return null;
            }
            return undefined;
          },
        },
      });
      graph.use(minimapRef.current);
    }

    return () => {
      // Cleanup is handled by X6
    };
  }, [graph]);

  return (
    <div className={styles.minimapContainer}>
      <div ref={containerRef} className={styles.minimap} />
    </div>
  );
}

export default Minimap;