import { useSelectionStore } from '@/store';
import { PropertyEditor } from './PropertyEditor';
import { FillStrokeEditor } from './FillStrokeEditor';
import { AlignmentTools } from './AlignmentTools';
import styles from './RightPanel.module.css';

export function RightPanel() {
  const { selectedNodes, selectedEdges } = useSelectionStore();
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

  return (
    <div className={styles.panel}>
      {hasSelection ? (
        <>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>Transform</div>
            <PropertyEditor />
          </div>
          
          {selectedNodes.length > 0 && (
            <>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>Fill & Stroke</div>
                <FillStrokeEditor />
              </div>
              
              {selectedNodes.length > 1 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>Alignment</div>
                  <AlignmentTools />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <p>Select an element to edit its properties</p>
        </div>
      )}
    </div>
  );
}

export default RightPanel;