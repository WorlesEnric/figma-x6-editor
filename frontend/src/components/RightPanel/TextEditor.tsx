import { useState, useEffect } from 'react';
import { useSelectionStore, useEditorStore } from '@/store';
import { IconButton } from '../common/Button';
import { ColorPicker } from '../common/ColorPicker';
import { Icon } from '../common/Icon';
import styles from './RightPanel.module.css';

const fontFamilies = [
  { value: 'DM Sans, sans-serif', label: 'DM Sans' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

export function TextEditor() {
  const { graph } = useEditorStore();
  const { selectedNodes } = useSelectionStore();

  const [showColorPicker, setShowColorPicker] = useState(false);

  // Text properties state
  const [fontFamily, setFontFamily] = useState('DM Sans, sans-serif');
  const [fontSize, setFontSize] = useState(14);
  const [fontWeight, setFontWeight] = useState(400);
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textColor, setTextColor] = useState('#333333');
  const [textContent, setTextContent] = useState('');

  // Get current text properties from selected node
  useEffect(() => {
    if (selectedNodes.length === 1) {
      const node = selectedNodes[0];
      const attrs = node.getAttrs();

      if (attrs?.label) {
        const label = attrs.label as Record<string, unknown>;
        setFontFamily((label.fontFamily as string) || 'DM Sans, sans-serif');
        setFontSize((label.fontSize as number) || 14);
        setFontWeight((label.fontWeight as number) || 400);
        setFontStyle((label.fontStyle as 'normal' | 'italic') || 'normal');
        setTextAlign((label.textAnchor as string) === 'start' ? 'left' :
          (label.textAnchor as string) === 'end' ? 'right' : 'center');
        setTextColor((label.fill as string) || '#333333');
        setTextContent((label.text as string) || '');
      }
    }
  }, [selectedNodes]);

  // Check if any selected node is a text node
  const hasTextNode = selectedNodes.some(node => {
    const shape = node.shape;
    return shape === 'custom-text' || shape?.includes('text');
  });

  if (!hasTextNode || selectedNodes.length === 0) {
    return null;
  }

  const applyTextStyle = (updates: Record<string, unknown>) => {
    if (!graph) return;

    selectedNodes.forEach(node => {
      Object.entries(updates).forEach(([key, value]) => {
        node.attr(`label/${key}`, value);
      });
    });
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFontFamily(value);
    applyTextStyle({ fontFamily: value });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setFontSize(value);
      applyTextStyle({ fontSize: value });
    }
  };

  const toggleBold = () => {
    const newWeight = fontWeight === 700 ? 400 : 700;
    setFontWeight(newWeight);
    applyTextStyle({ fontWeight: newWeight });
  };

  const toggleItalic = () => {
    const newStyle = fontStyle === 'italic' ? 'normal' : 'italic';
    setFontStyle(newStyle);
    applyTextStyle({ fontStyle: newStyle });
  };

  const handleTextAlignChange = (align: 'left' | 'center' | 'right') => {
    setTextAlign(align);
    const anchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';
    applyTextStyle({ textAnchor: anchor });
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    applyTextStyle({ fill: color });
  };

  const handleTextContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextContent(value);
    applyTextStyle({ text: value });
  };

  return (
    <div>
      {/* Text Content */}
      <div className={styles.propertyRow}>
        <span className={styles.propertyLabel}>Text</span>
        <textarea
          className={styles.textArea}
          value={textContent}
          onChange={handleTextContentChange}
          placeholder="Enter text..."
          rows={3}
          style={{
            width: '100%',
            padding: 'var(--spacing-sm)',
            fontSize: 'var(--font-size-md)',
            fontFamily: 'var(--font-family)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            resize: 'vertical',
            marginTop: 'var(--spacing-xs)',
          }}
        />
      </div>

      {/* Font Family */}
      <div className={styles.propertyRow}>
        <select
          className={styles.fontSelect}
          value={fontFamily}
          onChange={handleFontFamilyChange}
        >
          {fontFamilies.map(font => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size and Weight */}
      <div className={styles.twoColumn} style={{ marginTop: 'var(--spacing-sm)' }}>
        <div className={styles.propertyRow}>
          <span className={styles.propertyLabel}>Size</span>
          <div className={styles.propertyInput}>
            <input
              type="number"
              value={fontSize}
              onChange={handleFontSizeChange}
              min={1}
              max={200}
            />
          </div>
        </div>
        <div className={styles.textStyleButtons}>
          <button
            className={`${styles.styleBtn} ${fontWeight === 700 ? styles.active : ''}`}
            onClick={toggleBold}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            className={`${styles.styleBtn} ${fontStyle === 'italic' ? styles.active : ''}`}
            onClick={toggleItalic}
            title="Italic"
          >
            <em>I</em>
          </button>
        </div>
      </div>

      {/* Text Alignment */}
      <div className={styles.alignmentRow} style={{ marginTop: 'var(--spacing-sm)' }}>
        <span className={styles.propertyLabel}>Align</span>
        <div className={styles.alignmentButtons}>
          <button
            className={`${styles.alignBtn} ${textAlign === 'left' ? styles.active : ''}`}
            onClick={() => handleTextAlignChange('left')}
            title="Align Left"
          >
            <Icon name="align-left" size={14} />
          </button>
          <button
            className={`${styles.alignBtn} ${textAlign === 'center' ? styles.active : ''}`}
            onClick={() => handleTextAlignChange('center')}
            title="Align Center"
          >
            <Icon name="align-center" size={14} />
          </button>
          <button
            className={`${styles.alignBtn} ${textAlign === 'right' ? styles.active : ''}`}
            onClick={() => handleTextAlignChange('right')}
            title="Align Right"
          >
            <Icon name="align-right" size={14} />
          </button>
        </div>
      </div>

      {/* Text Color */}
      <div className={styles.colorRow} style={{ marginTop: 'var(--spacing-sm)' }}>
        <span className={styles.propertyLabel}>Color</span>
        <div
          className={styles.colorPreview}
          onClick={() => setShowColorPicker(!showColorPicker)}
          style={{ position: 'relative' }}
        >
          <div
            className={styles.colorSwatch}
            style={{ backgroundColor: textColor }}
          />
          {showColorPicker && (
            <div className={styles.colorPickerPopover}>
              <ColorPicker
                value={textColor}
                onChange={handleTextColorChange}
              />
            </div>
          )}
        </div>
        <div className={styles.colorInput}>
          <input
            type="text"
            value={textColor.toUpperCase()}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                handleTextColorChange(val);
              }
            }}
            maxLength={7}
          />
        </div>
      </div>
    </div>
  );
}

export default TextEditor;