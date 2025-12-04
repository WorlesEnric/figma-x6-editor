import { useState, useEffect, useRef } from 'react';
import { colorPalette, getRecentColors, addRecentColor, hexToRgb } from '@/utils/colorUtils';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  showOpacity?: boolean;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
}

export function ColorPicker({
  value,
  onChange,
  showOpacity = false,
  opacity = 1,
  onOpacityChange,
}: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHexInput(value.toUpperCase());
  }, [value]);

  useEffect(() => {
    setRecentColors(getRecentColors());
  }, []);

  const handleColorClick = (color: string) => {
    onChange(color);
    addRecentColor(color);
    setRecentColors(getRecentColors());
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    
    // Add # if not present
    if (val && !val.startsWith('#')) {
      val = '#' + val;
    }
    
    setHexInput(val);
    
    // Validate and apply
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onChange(val);
      addRecentColor(val);
      setRecentColors(getRecentColors());
    }
  };

  const handleHexInputBlur = () => {
    // Reset to current value if invalid
    if (!/^#[0-9A-F]{6}$/i.test(hexInput)) {
      setHexInput(value.toUpperCase());
    }
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseInt(e.target.value) / 100;
    onOpacityChange?.(newOpacity);
  };

  // Preset colors grid
  const presetColors = [
    '#FFFFFF', '#F5F5F5', '#E5E5E5', '#D4D4D4', '#A3A3A3', '#737373', '#525252', '#404040',
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899',
    '#FCA5A5', '#FDBA74', '#FDE047', '#86EFAC', '#5EEAD4', '#93C5FD', '#C4B5FD', '#F9A8D4',
    '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#0D9488', '#2563EB', '#7C3AED', '#DB2777',
  ];

  return (
    <div className={styles.colorPicker}>
      {/* Hex Input */}
      <div className={styles.hexInputRow}>
        <div 
          className={styles.currentColor}
          style={{ backgroundColor: value, opacity }}
        />
        <input
          ref={inputRef}
          type="text"
          className={styles.hexInput}
          value={hexInput}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          maxLength={7}
          placeholder="#000000"
        />
        {showOpacity && (
          <input
            type="number"
            className={styles.opacityInput}
            value={Math.round(opacity * 100)}
            onChange={handleOpacityChange}
            min={0}
            max={100}
          />
        )}
      </div>

      {/* Preset Colors */}
      <div className={styles.colorGrid}>
        {presetColors.map((color) => (
          <button
            key={color}
            className={`${styles.colorSwatch} ${color === value ? styles.active : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
            title={color}
          />
        ))}
      </div>

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Recent</div>
          <div className={styles.recentColors}>
            {recentColors.slice(0, 8).map((color, index) => (
              <button
                key={`${color}-${index}`}
                className={`${styles.colorSwatch} ${styles.small} ${color === value ? styles.active : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorClick(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Opacity Slider */}
      {showOpacity && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Opacity</div>
          <div className={styles.opacitySlider}>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(opacity * 100)}
              onChange={handleOpacityChange}
              className={styles.slider}
            />
            <span className={styles.opacityValue}>{Math.round(opacity * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPicker;