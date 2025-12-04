import { useEditorStore } from '@/store';
import { alignNodes, distributeNodes, type AlignType, type DistributeType } from '@/utils/graphUtils';
import { Icon } from '../common/Icon';
import styles from './RightPanel.module.css';

export function AlignmentTools() {
  const { graph } = useEditorStore();

  const handleAlign = (type: AlignType) => {
    if (graph) {
      alignNodes(graph, type);
    }
  };

  const handleDistribute = (type: DistributeType) => {
    if (graph) {
      distributeNodes(graph, type);
    }
  };

  return (
    <div className={styles.alignmentGrid}>
      {/* Horizontal alignment */}
      <div className={styles.alignmentGroup}>
        <button
          className={styles.alignBtn}
          onClick={() => handleAlign('left')}
          title="Align left"
        >
          <Icon name="align-left" size={14} />
        </button>
        <button
          className={styles.alignBtn}
          onClick={() => handleAlign('center')}
          title="Align center"
        >
          <Icon name="align-center" size={14} />
        </button>
        <button
          className={styles.alignBtn}
          onClick={() => handleAlign('right')}
          title="Align right"
        >
          <Icon name="align-right" size={14} />
        </button>
      </div>

      {/* Vertical alignment */}
      <div className={styles.alignmentGroup}>
        <button
          className={styles.alignBtn}
          onClick={() => handleAlign('top')}
          title="Align top"
        >
          <Icon name="align-top" size={14} />
        </button>
        <button
          className={styles.alignBtn}
          onClick={() => handleAlign('middle')}
          title="Align middle"
        >
          <Icon name="align-middle" size={14} />
        </button>
        <button
          className={styles.alignBtn}
          onClick={() => handleAlign('bottom')}
          title="Align bottom"
        >
          <Icon name="align-bottom" size={14} />
        </button>
      </div>

      {/* Distribution */}
      <div className={styles.alignmentGroup}>
        <button
          className={styles.alignBtn}
          onClick={() => handleDistribute('horizontal')}
          title="Distribute horizontally"
        >
          <Icon name="distribute-h" size={14} />
        </button>
        <button
          className={styles.alignBtn}
          onClick={() => handleDistribute('vertical')}
          title="Distribute vertically"
        >
          <Icon name="distribute-v" size={14} />
        </button>
      </div>
    </div>
  );
}

export default AlignmentTools;