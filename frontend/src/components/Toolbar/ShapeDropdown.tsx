import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store';
import { Icon } from '../common/Icon';
import type { ToolType } from '@/types';
import styles from './Toolbar.module.css';

interface ShapeOption {
  id: ToolType;
  label: string;
  icon: string;
  shortcut: string;
}

const shapeOptions: ShapeOption[] = [
  { id: 'rectangle', label: 'Rectangle', icon: 'square', shortcut: 'R' },
  { id: 'ellipse', label: 'Ellipse', icon: 'circle', shortcut: 'O' },
  { id: 'diamond', label: 'Diamond', icon: 'diamond', shortcut: 'D' },
  { id: 'triangle', label: 'Triangle', icon: 'triangle', shortcut: '' },
];

export function ShapeDropdown() {
  const { tool, setTool } = useEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find current shape if one is active
  const currentShape = shapeOptions.find((s) => s.id === tool);
  const isShapeActive = !!currentShape;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (shapeId: ToolType) => {
    setTool(shapeId);
    setIsOpen(false);
  };

  return (
    <div className={styles.shapeDropdownWrapper} ref={dropdownRef}>
      <button
        className={`${styles.shapeDropdownTrigger} ${isShapeActive ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name={currentShape?.icon || 'square'} size={16} />
        <Icon name="chevronDown" size={12} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {shapeOptions.map((shape) => (
            <button
              key={shape.id}
              className={`${styles.dropdownItem} ${tool === shape.id ? styles.active : ''}`}
              onClick={() => handleSelect(shape.id)}
            >
              <span className={styles.dropdownItemIcon}>
                <Icon name={shape.icon} size={16} />
              </span>
              <span className={styles.dropdownItemLabel}>{shape.label}</span>
              {shape.shortcut && (
                <span className={styles.dropdownItemShortcut}>{shape.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShapeDropdown;