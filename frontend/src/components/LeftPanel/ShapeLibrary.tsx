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
      case 'custom-actor':
        return (
          <svg viewBox="0 0 30 45" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="15" cy="6" r="4" />
            <line x1="15" y1="10" x2="15" y2="25" />
            <line x1="5" y1="15" x2="25" y2="15" />
            <line x1="15" y1="25" x2="5" y2="40" />
            <line x1="15" y1="25" x2="25" y2="40" />
          </svg>
        );
      case 'custom-text':
        return (
          <svg viewBox="0 0 40 40" fill="currentColor">
            <text x="8" y="28" fontSize="24" fontFamily="sans-serif">T</text>
          </svg>
        );
      case 'custom-dashed-rect':
        return (
          <svg viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2">
            <rect x="2" y="2" width="36" height="26" rx="3" />
          </svg>
        );
      case 'custom-parallelogram':
        return (
          <svg viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="10,2 38,2 30,28 2,28" />
          </svg>
        );
      case 'custom-trapezoid':
        return (
          <svg viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="8,2 32,2 38,28 2,28" />
          </svg>
        );
      case 'custom-cylinder':
        return (
          <svg viewBox="0 0 32 40" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="16" cy="8" rx="14" ry="6" />
            <path d="M 2 8 L 2 32 Q 2 38 16 38 Q 30 38 30 32 L 30 8" />
          </svg>
        );
      case 'custom-cloud':
        return (
          <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M 10 24 Q 4 24 4 18 Q 4 14 8 12 Q 8 6 14 4 Q 20 2 24 6 Q 30 4 34 8 Q 40 8 42 14 Q 46 16 44 22 Q 42 26 38 26 Z" />
          </svg>
        );
      case 'custom-callout':
        return (
          <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M 4 4 L 44 4 L 44 24 L 12 24 L 8 30 L 10 24 L 4 24 Z" />
          </svg>
        );
      case 'custom-pentagon':
        return (
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="20,2 38,16 32,38 8,38 2,16" />
          </svg>
        );
      case 'custom-arrow-right':
        return (
          <svg viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="2,6 28,6 28,2 38,12 28,22 28,18 2,18" />
          </svg>
        );
      case 'custom-document':
        return (
          <svg viewBox="0 0 32 40" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M 2 2 L 30 2 L 30 32 Q 22 36 16 32 Q 10 28 2 32 Z" />
          </svg>
        );
      case 'custom-note':
        return (
          <svg viewBox="0 0 32 40" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M 2 2 L 24 2 L 32 10 L 32 38 L 2 38 Z M 24 2 L 24 10 L 32 10" />
          </svg>
        );
      case 'custom-cube':
        return (
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M 2 8 L 2 24 L 16 32 L 30 24 L 30 8 L 16 0 Z M 2 8 L 16 16 M 16 16 L 16 32 M 16 16 L 30 8" />
          </svg>
        );
      case 'custom-plus':
        return (
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M 12 2 L 20 2 L 20 12 L 30 12 L 30 20 L 20 20 L 20 30 L 12 30 L 12 20 L 2 20 L 2 12 L 12 12 Z" />
          </svg>
        );
      case 'custom-frame':
        return (
          <svg viewBox="0 0 40 30" fill="none" stroke="#0d99ff" strokeWidth="1.5" strokeDasharray="4 2">
            <rect x="2" y="2" width="36" height="26" rx="2" />
            <text x="4" y="0" fontSize="8" fill="#0d99ff" fontWeight="600">Frame</text>
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
      // Network Shapes
      case 'network-cloud':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2">
            <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#E3F2FD" />
          </svg>
        );
      case 'network-server':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
            <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#E8F5E9" />
          </svg>
        );
      case 'network-database':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#FFF3E0" />
          </svg>
        );
      case 'network-router':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#9C27B0" strokeWidth="2">
            <path d="M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-2.4 2.4l.8-.8C17.8 6.7 17 6.4 16 6.4s-1.8.3-2.6 1.1l.8.8c.4-.4 1-.7 1.8-.7s1.4.3 1.8.7zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z" fill="#F3E5F5" />
          </svg>
        );
      case 'network-firewall':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth="2">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="#FFEBEE" />
          </svg>
        );
      case 'network-pc':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#607D8B" strokeWidth="2">
            <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" fill="#E3F2FD" />
          </svg>
        );
      case 'network-phone':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2">
            <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" fill="#E0F2F1" />
          </svg>
        );
      // UML Shapes
      case 'uml-class':
        return (
          <svg viewBox="0 0 40 30" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="36" height="26" fill="#fff" />
            <line x1="2" y1="10" x2="38" y2="10" />
            <line x1="2" y1="20" x2="38" y2="20" />
          </svg>
        );
      case 'uml-interface':
        return (
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="20" cy="20" r="15" fill="#fff" />
            <text x="20" y="20" textAnchor="middle" dy=".3em" fontSize="10">I</text>
          </svg>
        );
      case 'uml-actor':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="4" r="2" />
            <path d="M12 6v6m0 0l-3-3m3 3l3-3m-3 3v4m0 0l-2 3m2-3l2 3" />
          </svg>
        );
      case 'uml-usecase':
        return (
          <svg viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="20" cy="10" rx="18" ry="8" fill="#fff" />
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