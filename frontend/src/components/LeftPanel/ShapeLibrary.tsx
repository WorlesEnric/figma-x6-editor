import { useState, useRef } from 'react';
import { Dnd } from '@antv/x6-plugin-dnd';
import { useEditorStore } from '@/store';
import { shapeCategories } from '@/shapes';
import { Icon } from '../common/Icon';
import styles from './LeftPanel.module.css';

export function ShapeLibrary() {
  const { graph } = useEditorStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['basic', 'flowchart'])
  );
  const dndRef = useRef<Dnd | null>(null);

  // Initialize DnD plugin
  if (graph && !dndRef.current) {
    dndRef.current = new Dnd({
      target: graph,
      scaled: true,
      animation: true,
      validateNode: () => true,
    });
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDragStart = (
    e: React.MouseEvent,
    shape: string,
    width: number,
    height: number
  ) => {
    if (!graph || !dndRef.current) return;

    const node = graph.createNode({
      shape,
      width,
      height,
    });

    dndRef.current.start(node, e.nativeEvent);
  };

  const getShapePreview = (shapeName: string) => {
    // Return SVG preview based on shape type
    switch (shapeName) {
      case 'custom-rect':
        return (
          <svg viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="36" height="26" rx="3" />
          </svg>
        );
      case 'custom-rounded-rect':
        return (
          <svg viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="36" height="26" rx="10" />
          </svg>
        );
      case 'custom-ellipse':
        return (
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="20" cy="20" rx="17" ry="17" />
          </svg>
        );
      case 'custom-diamond':
        return (
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="20,2 38,20 20,38 2,20" />
          </svg>
        );
      case 'custom-triangle':
        return (
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="20,2 38,38 2,38" />
          </svg>
        );
      case 'custom-hexagon':
        return (
          <svg viewBox="0 0 40 36" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="10,2 30,2 38,18 30,34 10,34 2,18" />
          </svg>
        );
      case 'custom-star':
        return (
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="20,2 24,15 38,15 27,23 31,37 20,28 9,37 13,23 2,15 16,15" />
          </svg>
        );
      case 'custom-text':
        return (
          <svg viewBox="0 0 40 40" fill="currentColor">
            <text x="8" y="28" fontSize="24" fontFamily="sans-serif">T</text>
          </svg>
        );
      case 'custom-frame':
        return (
          <svg viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2">
            <rect x="2" y="2" width="36" height="26" rx="2" />
          </svg>
        );
      case 'flowchart-process':
        return (
          <svg viewBox="0 0 40 30" fill="none" stroke="#1890FF" strokeWidth="2">
            <rect x="2" y="2" width="36" height="26" rx="2" fill="#E8F4FD" />
          </svg>
        );
      case 'flowchart-decision':
        return (
          <svg viewBox="0 0 40 40" fill="none" stroke="#FA8C16" strokeWidth="2">
            <polygon points="20,2 38,20 20,38 2,20" fill="#FFF7E6" />
          </svg>
        );
      case 'flowchart-terminator':
        return (
          <svg viewBox="0 0 40 26" fill="none" stroke="#52C41A" strokeWidth="2">
            <rect x="2" y="2" width="36" height="22" rx="11" fill="#F6FFED" />
          </svg>
        );
      case 'flowchart-data':
        return (
          <svg viewBox="0 0 40 30" fill="none" stroke="#722ED1" strokeWidth="2">
            <polygon points="8,2 38,2 32,28 2,28" fill="#F9F0FF" />
          </svg>
        );
      case 'flowchart-document':
        return (
          <svg viewBox="0 0 40 36" fill="none" stroke="#EB2F96" strokeWidth="2">
            <path d="M2,2 L38,2 L38,26 Q28,34 20,26 Q12,18 2,26 Z" fill="#FFF0F6" />
          </svg>
        );
      case 'flowchart-database':
        return (
          <svg viewBox="0 0 36 44" fill="none" stroke="#13C2C2" strokeWidth="2">
            <ellipse cx="18" cy="8" rx="15" ry="6" fill="#E6FFFB" />
            <path d="M3,8 L3,36 Q3,42 18,42 Q33,42 33,36 L33,8" fill="#E6FFFB" />
          </svg>
        );
      case 'flowchart-connector':
        return (
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="20" cy="20" r="15" fill="#ffffff" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="4" width="32" height="32" rx="2" />
          </svg>
        );
    }
  };

  return (
    <div className={styles.shapeLibrary}>
      {shapeCategories.map((category) => (
        <div key={category.id} className={styles.shapeCategory}>
          <div
            className={styles.categoryHeader}
            onClick={() => toggleCategory(category.id)}
          >
            <Icon
              name={expandedCategories.has(category.id) ? 'chevronDown' : 'chevronRight'}
              size={12}
            />
            {category.name}
          </div>
          {expandedCategories.has(category.id) && (
            <div className={styles.shapeGrid}>
              {category.shapes.map((shape) => (
                <div
                  key={shape.shape}
                  className={styles.shapeItem}
                  title={shape.name}
                  onMouseDown={(e) =>
                    handleDragStart(e, shape.shape, shape.defaultWidth, shape.defaultHeight)
                  }
                >
                  {getShapePreview(shape.shape)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ShapeLibrary;