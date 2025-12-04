import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import styles from './Dropdown.module.css';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
  children?: DropdownItem[];
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = 'left',
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate position when opening
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 200; // Approximate menu width
      
      let left = rect.left;
      if (align === 'right') {
        left = rect.right - menuWidth;
      }
      
      // Keep menu within viewport
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 8;
      }
      if (left < 8) {
        left = 8;
      }
      
      setPosition({
        top: rect.bottom + 4,
        left,
      });
    }
  }, [isOpen, align]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    setIsOpen(false);
  };

  const renderItem = (item: DropdownItem) => {
    if (item.divider) {
      return <div key={item.id} className={styles.divider} />;
    }

    return (
      <button
        key={item.id}
        className={`${styles.item} ${item.disabled ? styles.disabled : ''}`}
        onClick={() => handleItemClick(item)}
        disabled={item.disabled}
      >
        {item.icon && (
          <span className={styles.itemIcon}>
            <Icon name={item.icon} size={14} />
          </span>
        )}
        <span className={styles.itemLabel}>{item.label}</span>
        {item.shortcut && (
          <span className={styles.itemShortcut}>{item.shortcut}</span>
        )}
        {item.children && (
          <span className={styles.itemArrow}>
            <Icon name="chevronRight" size={12} />
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={className}>
      <div 
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>
      
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className={styles.menu}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {items.map(renderItem)}
        </div>,
        document.body
      )}
    </div>
  );
}

// Simple dropdown menu (non-portal version for embedded use)
interface SimpleDropdownProps {
  items: DropdownItem[];
  onClose?: () => void;
}

export function DropdownMenu({ items, onClose }: SimpleDropdownProps) {
  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    onClose?.();
  };

  return (
    <div className={styles.menuInline}>
      {items.map((item) => {
        if (item.divider) {
          return <div key={item.id} className={styles.divider} />;
        }

        return (
          <button
            key={item.id}
            className={`${styles.item} ${item.disabled ? styles.disabled : ''}`}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
          >
            {item.icon && (
              <span className={styles.itemIcon}>
                <Icon name={item.icon} size={14} />
              </span>
            )}
            <span className={styles.itemLabel}>{item.label}</span>
            {item.shortcut && (
              <span className={styles.itemShortcut}>{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Dropdown;