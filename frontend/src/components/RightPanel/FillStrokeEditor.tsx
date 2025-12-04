import { useState, useRef, useEffect } from 'react';
import { useSelectionStore } from '@/store';
import { ColorPicker } from '../common/ColorPicker';
import styles from './RightPanel.module.css';

export function FillStrokeEditor() {
  const { commonFill, commonStroke, updateSelectedFill, updateSelectedStroke } = useSelectionStore();
  
  const [showFillPicker, setShowFillPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const fillPickerRef = useRef<HTMLDivElement>(null);
  const strokePickerRef = useRef<HTMLDivElement>(null);

  const [fillColor, setFillColor] = useState(commonFill?.color || '#ffffff');
  const [fillOpacity, setFillOpacity] = useState(commonFill?.opacity ?? 1);
  const [strokeColor, setStrokeColor] = useState(commonStroke?.color || '#333333');
  const [strokeWidth, setStrokeWidth] = useState(commonStroke?.width || 2);
  const [strokeOpacity, setStrokeOpacity] = useState(commonStroke?.opacity ?? 1);

  useEffect(() => {
    if (commonFill) {
      setFillColor(commonFill.color);
      setFillOpacity(commonFill.opacity);
    }
  }, [commonFill]);

  useEffect(() => {
    if (commonStroke) {
      setStrokeColor(commonStroke.color);
      setStrokeWidth(commonStroke.width);
      setStrokeOpacity(commonStroke.opacity);
    }
  }, [commonStroke]);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fillPickerRef.current && !fillPickerRef.current.contains(e.target as Node)) {
        setShowFillPicker(false);
      }
      if (strokePickerRef.current && !strokePickerRef.current.contains(e.target as Node)) {
        setShowStrokePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFillColorChange = (color: string) => {
    setFillColor(color);
    updateSelectedFill({ color });
  };

  const handleFillOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) / 100;
    const clamped = Math.max(0, Math.min(1, value));
    setFillOpacity(clamped);
    updateSelectedFill({ opacity: clamped });
  };

  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
    updateSelectedStroke({ color });
  };

  const handleStrokeWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setStrokeWidth(value);
      updateSelectedStroke({ width: value });
    }
  };

  const handleStrokeOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) / 100;
    const clamped = Math.max(0, Math.min(1, value));
    setStrokeOpacity(clamped);
    updateSelectedStroke({ opacity: clamped });
  };

  const handleFillColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFillColor(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      updateSelectedFill({ color: value });
    }
  };

  const handleStrokeColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStrokeColor(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      updateSelectedStroke({ color: value });
    }
  };

  if (!commonFill && !commonStroke) {
    return null;
  }

  return (
    <div>
      {/* Fill */}
      {commonFill && (
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
            Fill
          </div>
          <div className={styles.colorRow}>
            <div 
              className={styles.colorPreview}
              onClick={() => setShowFillPicker(!showFillPicker)}
              ref={fillPickerRef}
              style={{ position: 'relative' }}
            >
              <div 
                className={styles.colorSwatch} 
                style={{ 
                  backgroundColor: fillColor,
                  opacity: fillOpacity,
                }} 
              />
              {showFillPicker && (
                <div className={styles.colorPickerPopover}>
                  <ColorPicker
                    value={fillColor}
                    onChange={handleFillColorChange}
                  />
                </div>
              )}
            </div>
            <div className={styles.colorInput}>
              <input
                type="text"
                value={fillColor.toUpperCase()}
                onChange={handleFillColorInput}
                maxLength={7}
              />
            </div>
            <div className={styles.opacityInput}>
              <input
                type="number"
                value={Math.round(fillOpacity * 100)}
                onChange={handleFillOpacityChange}
                min={0}
                max={100}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stroke */}
      {commonStroke && (
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
            Stroke
          </div>
          <div className={styles.colorRow}>
            <div 
              className={styles.colorPreview}
              onClick={() => setShowStrokePicker(!showStrokePicker)}
              ref={strokePickerRef}
              style={{ position: 'relative' }}
            >
              <div 
                className={styles.colorSwatch} 
                style={{ 
                  backgroundColor: strokeColor,
                  opacity: strokeOpacity,
                }} 
              />
              {showStrokePicker && (
                <div className={styles.colorPickerPopover}>
                  <ColorPicker
                    value={strokeColor}
                    onChange={handleStrokeColorChange}
                  />
                </div>
              )}
            </div>
            <div className={styles.colorInput}>
              <input
                type="text"
                value={strokeColor.toUpperCase()}
                onChange={handleStrokeColorInput}
                maxLength={7}
              />
            </div>
            <div className={styles.opacityInput}>
              <input
                type="number"
                value={Math.round(strokeOpacity * 100)}
                onChange={handleStrokeOpacityChange}
                min={0}
                max={100}
              />
            </div>
          </div>
          <div className={styles.strokeWidthRow} style={{ marginTop: 'var(--spacing-sm)' }}>
            <span className={styles.strokeWidthLabel}>Width</span>
            <div className={styles.strokeWidthInput}>
              <input
                type="number"
                value={strokeWidth}
                onChange={handleStrokeWidthChange}
                min={0}
                max={50}
                step={1}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FillStrokeEditor;