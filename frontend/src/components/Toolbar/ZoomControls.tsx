import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store';
import { IconButton } from '../common/Button';
import styles from './Toolbar.module.css';

const zoomPresets = [
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: '100%', value: 100 },
  { label: '150%', value: 150 },
  { label: '200%', value: 200 },
  { label: '300%', value: 300 },
  { label: 'Fit', value: -1 },
];

export function ZoomControls() {
  const { zoom, setZoom, zoomIn, zoomOut, zoomToFit, zoomTo100 } = useEditorStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleZoomSelect = (value: number) => {
    if (value === -1) {
      zoomToFit();
    } else {
      setZoom(value);
    }
    setShowDropdown(false);
  };

  return (
    <div className={styles.zoomControls}>
      <IconButton
        icon="zoom-out"
        onClick={zoomOut}
        tooltip="Zoom Out (⌘-)"
      />
      
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <div
          className={styles.zoomValue}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {Math.round(zoom)}%
        </div>
        
        {showDropdown && (
          <div className={styles.zoomDropdown}>
            {zoomPresets.map((preset) => (
              <button
                key={preset.value}
                className={styles.zoomOption}
                onClick={() => handleZoomSelect(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <IconButton
        icon="zoom-in"
        onClick={zoomIn}
        tooltip="Zoom In (⌘+)"
      />
    </div>
  );
}

export default ZoomControls;