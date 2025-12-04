import { useEffect, useState } from 'react';
import { useSelectionStore, useEditorStore } from '@/store';
import styles from './RightPanel.module.css';

export function PropertyEditor() {
  const { graph } = useEditorStore();
  const { selectedNodes, selectedEdges, transform } = useSelectionStore();
  
  const [localTransform, setLocalTransform] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    angle: 0,
  });

  useEffect(() => {
    if (transform) {
      setLocalTransform(transform);
    }
  }, [transform]);

  const handleChange = (key: keyof typeof localTransform, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const newTransform = { ...localTransform, [key]: numValue };
    setLocalTransform(newTransform);
  };

  const handleBlur = (key: keyof typeof localTransform) => {
    if (!graph || selectedNodes.length === 0) return;

    selectedNodes.forEach((node) => {
      switch (key) {
        case 'x':
        case 'y':
          node.setPosition(localTransform.x, localTransform.y);
          break;
        case 'width':
        case 'height':
          node.resize(localTransform.width, localTransform.height);
          break;
        case 'angle':
          node.rotate(localTransform.angle, { absolute: true });
          break;
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: keyof typeof localTransform) => {
    if (e.key === 'Enter') {
      handleBlur(key);
      (e.target as HTMLInputElement).blur();
    }
  };

  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

  if (!hasSelection) {
    return null;
  }

  return (
    <div>
      <div className={styles.twoColumn}>
        <div className={styles.propertyRow}>
          <span className={styles.propertyLabel}>X</span>
          <div className={styles.propertyInput}>
            <input
              type="number"
              value={Math.round(localTransform.x)}
              onChange={(e) => handleChange('x', e.target.value)}
              onBlur={() => handleBlur('x')}
              onKeyDown={(e) => handleKeyDown(e, 'x')}
            />
          </div>
        </div>
        <div className={styles.propertyRow}>
          <span className={styles.propertyLabel}>Y</span>
          <div className={styles.propertyInput}>
            <input
              type="number"
              value={Math.round(localTransform.y)}
              onChange={(e) => handleChange('y', e.target.value)}
              onBlur={() => handleBlur('y')}
              onKeyDown={(e) => handleKeyDown(e, 'y')}
            />
          </div>
        </div>
      </div>

      <div className={styles.twoColumn} style={{ marginTop: 'var(--spacing-sm)' }}>
        <div className={styles.propertyRow}>
          <span className={styles.propertyLabel}>W</span>
          <div className={styles.propertyInput}>
            <input
              type="number"
              value={Math.round(localTransform.width)}
              onChange={(e) => handleChange('width', e.target.value)}
              onBlur={() => handleBlur('width')}
              onKeyDown={(e) => handleKeyDown(e, 'width')}
              min={1}
            />
          </div>
        </div>
        <div className={styles.propertyRow}>
          <span className={styles.propertyLabel}>H</span>
          <div className={styles.propertyInput}>
            <input
              type="number"
              value={Math.round(localTransform.height)}
              onChange={(e) => handleChange('height', e.target.value)}
              onBlur={() => handleBlur('height')}
              onKeyDown={(e) => handleKeyDown(e, 'height')}
              min={1}
            />
          </div>
        </div>
      </div>

      {selectedNodes.length === 1 && (
        <div className={styles.propertyRow} style={{ marginTop: 'var(--spacing-sm)' }}>
          <span className={styles.propertyLabel}>°</span>
          <div className={styles.propertyInput}>
            <input
              type="number"
              value={Math.round(localTransform.angle)}
              onChange={(e) => handleChange('angle', e.target.value)}
              onBlur={() => handleBlur('angle')}
              onKeyDown={(e) => handleKeyDown(e, 'angle')}
              step={15}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyEditor;