import { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { useSelectionStore, useEditorStore } from '@/store';
import { Icon } from '../common/Icon';
import styles from './RightPanel.module.css';

// Helper to convert hex to rgba object for react-color if needed, 
// but SketchPicker handles hex strings well. For 'transparent', we need a special object.
const getColorObject = (colorString: string) => {
  if (colorString === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  return colorString;
};

const fontFamilies = [
  { value: 'DM Sans, sans-serif', label: 'DM Sans', google: true },
  { value: 'Inter, sans-serif', label: 'Inter', google: true },
  { value: 'Roboto, sans-serif', label: 'Roboto', google: true },
  { value: 'Open Sans, sans-serif', label: 'Open Sans', google: true },
  { value: 'Lato, sans-serif', label: 'Lato', google: true },
  { value: 'Montserrat, sans-serif', label: 'Montserrat', google: true },
  { value: 'Poppins, sans-serif', label: 'Poppins', google: true },
  { value: 'Raleway, sans-serif', label: 'Raleway', google: true },
  { value: 'Merriweather, serif', label: 'Merriweather', google: true },
  { value: 'Arial, sans-serif', label: 'Arial', google: false },
  { value: 'Helvetica, sans-serif', label: 'Helvetica', google: false },
  { value: 'Times New Roman, serif', label: 'Times New Roman', google: false },
  { value: 'Courier New, monospace', label: 'Courier New', google: false },
  { value: 'Georgia, serif', label: 'Georgia', google: false },
  { value: 'Verdana, sans-serif', label: 'Verdana', google: false },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS', google: false },
];

export function TextEditor() {
  const { graph } = useEditorStore();
  const { selectedNodes } = useSelectionStore();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  // Text properties state
  const [fontFamily, setFontFamily] = useState('DM Sans, sans-serif');
  const [fontSize, setFontSize] = useState(14);
  const [fontWeight, setFontWeight] = useState(400);
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textDecoration, setTextDecoration] = useState<string>('none');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [verticalAlign, setVerticalAlign] = useState<'baseline' | 'super' | 'sub'>('baseline');
  const [textColor, setTextColor] = useState('#333333');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textContent, setTextContent] = useState('');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  // Load Google Fonts dynamically
  useEffect(() => {
    const selectedFont = fontFamilies.find(f => f.value === fontFamily);
    if (selectedFont && selectedFont.google) {
      const fontName = selectedFont.label;
      const linkId = `font-${fontName.replace(/\s+/g, '-')}`;

      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [fontFamily]);

  // Get current text properties from selected node
  useEffect(() => {
    if (selectedNodes.length === 1) {
      const node = selectedNodes[0];
      const attrs = node.getAttrs();

      let labelAttrs: Record<string, unknown> = {};

      if (attrs && attrs.label) {
        if (typeof attrs.label === 'string') {
          labelAttrs = { text: attrs.label };
        } else if (typeof attrs.label === 'object') {
          labelAttrs = attrs.label as Record<string, unknown>;
        }
      } else if (attrs && attrs.text) {
        // Fallback for some shapes that might use 'text' property
        if (typeof attrs.text === 'object') {
          labelAttrs = attrs.text as Record<string, unknown>;
        } else {
          labelAttrs = { text: attrs.text };
        }
      }

      setFontFamily((labelAttrs.fontFamily as string) || 'DM Sans, sans-serif');
      setFontSize((labelAttrs.fontSize as number) || 14);
      setFontWeight((labelAttrs.fontWeight as number) || 400);
      setFontStyle((labelAttrs.fontStyle as 'normal' | 'italic') || 'normal');
      setTextDecoration((labelAttrs.textDecoration as string) || 'none');

      // Determine text align based on textAnchor
      const anchor = labelAttrs.textAnchor as string;
      if (anchor === 'start') setTextAlign('left');
      else if (anchor === 'end') setTextAlign('right');
      else setTextAlign('center');

      setVerticalAlign((labelAttrs.verticalAlign as 'baseline' | 'super' | 'sub') || 'baseline');
      setTextColor((labelAttrs.fill as string) || '#333333');
      setBackgroundColor((labelAttrs.backgroundColor as string) || 'transparent');
      setLineHeight((labelAttrs.lineHeight as number) || 1.2);
      setLetterSpacing((labelAttrs.letterSpacing as number) || 0);
      setDirection((labelAttrs.direction as 'ltr' | 'rtl') || 'ltr');
      setTextContent((labelAttrs.text as string) || '');
    }
  }, [selectedNodes]);

  if (selectedNodes.length === 0) {
    return null;
  }

  const applyTextStyle = (updates: Record<string, unknown>) => {
    if (!graph) return;

    selectedNodes.forEach(node => {
      const attrs = node.getAttrs();

      // Determine the correct path and handling for updates
      if (attrs && attrs.label !== undefined) {
        // If label is a string, we need to convert it to an object to support styling
        if (typeof attrs.label === 'string') {
          node.setAttrByPath('label', { text: attrs.label });
        }

        // Now apply updates to 'label' object
        Object.entries(updates).forEach(([key, value]) => {
          node.attr(`label/${key}`, value as any);
        });
      } else if (attrs && attrs.text !== undefined) {
        // Fallback for shapes using 'text' (like standard X6 text shape sometimes)
        if (typeof attrs.text === 'string') {
          node.setAttrByPath('text', { text: attrs.text });
        }

        Object.entries(updates).forEach(([key, value]) => {
          node.attr(`text/${key}`, value as any);
        });
      } else {
        // Assuming default to label if neither exists clearly (or new node)
        // Check if we can just setAttrByPath directly or if we need to init label
        Object.entries(updates).forEach(([key, value]) => {
          node.attr(`label/${key}`, value as any);
        });
      }
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

    // X6 geometry: 
    // left: refX=0 (or small padding), textAnchor='start'
    // center: refX=0.5, textAnchor='middle'
    // right: refX=1.0 (or 100% - padding), textAnchor='end'

    let textAnchor, refX;

    if (align === 'left') {
      textAnchor = 'start';
      refX = 5; // 5px padding from left
    } else if (align === 'right') {
      textAnchor = 'end';
      refX = '98%'; // 98% from left (2% padding from right)
    } else {
      textAnchor = 'middle';
      refX = 0.5; // Center
    }

    applyTextStyle({ textAnchor, refX });
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    applyTextStyle({ fill: color });
  };



  const toggleUnderline = () => {
    const decorations = textDecoration.split(' ').filter(d => d !== 'none');
    const hasUnderline = decorations.includes('underline');

    let newDecorations: string[];
    if (hasUnderline) {
      newDecorations = decorations.filter(d => d !== 'underline');
    } else {
      newDecorations = [...decorations, 'underline'];
    }

    const newDecoration = newDecorations.length > 0 ? newDecorations.join(' ') : 'none';
    setTextDecoration(newDecoration);
    applyTextStyle({ textDecoration: newDecoration });
  };

  const toggleStrikethrough = () => {
    const decorations = textDecoration.split(' ').filter(d => d !== 'none');
    const hasStrike = decorations.includes('line-through');

    let newDecorations: string[];
    if (hasStrike) {
      newDecorations = decorations.filter(d => d !== 'line-through');
    } else {
      newDecorations = [...decorations, 'line-through'];
    }

    const newDecoration = newDecorations.length > 0 ? newDecorations.join(' ') : 'none';
    setTextDecoration(newDecoration);
    applyTextStyle({ textDecoration: newDecoration });
  };

  const handleVerticalAlignChange = (align: 'baseline' | 'super' | 'sub') => {
    setVerticalAlign(align);
    applyTextStyle({ verticalAlign: align });
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    applyTextStyle({ backgroundColor: color });
  };

  const handleLineHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setLineHeight(value);
      applyTextStyle({ lineHeight: value });
    }
  };

  const handleLetterSpacingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setLetterSpacing(value);
      applyTextStyle({ letterSpacing: value });
    }
  };

  const toggleBulletList = () => {
    const lines = textContent.split('\n');
    // Check if all non-empty lines are already bulleted
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    if (nonEmptyLines.length === 0) return;

    const isList = nonEmptyLines.every(line => line.trim().startsWith('• '));

    const newText = lines.map(line => {
      if (line.trim().length === 0) return line;
      if (isList) {
        return line.replace(/^•\s+/, '');
      } else {
        return `• ${line}`;
      }
    }).join('\n');

    setTextContent(newText);
    applyTextStyle({ text: newText });
  };

  const toggleOrderedList = () => {
    const lines = textContent.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    if (nonEmptyLines.length === 0) return;

    const isList = nonEmptyLines.every(line => /^\d+\.\s+/.test(line.trim()));

    const newText = lines.map((line, index) => {
      if (line.trim().length === 0) return line;
      if (isList) {
        return line.replace(/^\d+\.\s+/, '');
      } else {
        // Calculate the actual index in the list (skipping empty lines if we want, but simple index is fine for now)
        // To be strictly correct with line numbers, we might want to just maintain line index.
        return `${index + 1}. ${line}`;
      }
    }).join('\n');

    setTextContent(newText);
    applyTextStyle({ text: newText });
  };

  return (
    <div>
      {/* 字体区 */}
      <div className={styles.section} style={{ padding: '0 0 var(--spacing-sm) 0', border: 'none' }}>
        <div className={styles.toolbarLabel}>字体</div>

        {/* 字体选择 & 字号 */}
        <div className={styles.toolbarRow}>
          <select
            className={styles.fontSelectCompact}
            value={fontFamily}
            onChange={handleFontFamilyChange}
            style={{ flex: 1, marginRight: '4px' }}
          >
            {fontFamilies.map(font => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* 样式按钮组 Row 1: Bold, Italic, Underline, Strikethrough | Font Size */}
        <div className={styles.toolbarRow}>
          <div className={styles.toolbarGroup}>
            <button
              className={`${styles.toolbarButton} ${fontWeight === 700 ? styles.active : ''}`}
              onClick={toggleBold}
              title="粗体 (Bold)"
            >
              <Icon name="Bold" size={14} />
            </button>
            <button
              className={`${styles.toolbarButton} ${fontStyle === 'italic' ? styles.active : ''}`}
              onClick={toggleItalic}
              title="斜体 (Italic)"
            >
              <Icon name="Italic" size={14} />
            </button>
            <button
              className={`${styles.toolbarButton} ${textDecoration.includes('underline') ? styles.active : ''}`}
              onClick={toggleUnderline}
              title="下划线 (Underline)"
            >
              <Icon name="Underline" size={14} />
            </button>
            <button
              className={`${styles.toolbarButton} ${textDecoration.includes('line-through') ? styles.active : ''}`}
              onClick={toggleStrikethrough}
              title="删除线 (Strikethrough)"
            >
              <Icon name="Strikethrough" size={14} />
            </button>
          </div>

          <div className={styles.separator} />

          <div className={styles.toolbarGroup} style={{ flex: 1 }}>
            <input
              type="number"
              className={styles.toolbarInput}
              value={fontSize}
              onChange={handleFontSizeChange}
              min={1}
              max={200}
              style={{ width: '100%', textAlign: 'center' }}
              title="字号 (Font Size)"
            />
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginLeft: '4px' }}>px</span>
          </div>
        </div>

        {/* 对齐方式 Row 2 */}
        <div className={styles.toolbarRow}>
          <div className={styles.toolbarGroup} style={{ flex: 1, justifyContent: 'space-between' }}>
            <button
              className={`${styles.toolbarButton} ${textAlign === 'left' ? styles.active : ''}`}
              onClick={() => handleTextAlignChange('left')}
              title="左对齐"
            >
              <Icon name="AlignLeft" size={14} />
            </button>
            <button
              className={`${styles.toolbarButton} ${textAlign === 'center' ? styles.active : ''}`}
              onClick={() => handleTextAlignChange('center')}
              title="居中对齐"
            >
              <Icon name="AlignCenter" size={14} />
            </button>
            <button
              className={`${styles.toolbarButton} ${textAlign === 'right' ? styles.active : ''}`}
              onClick={() => handleTextAlignChange('right')}
              title="右对齐"
            >
              <Icon name="AlignRight" size={14} />
            </button>
          </div>

          <div className={styles.separator} />

          <div className={styles.toolbarGroup}>
            <button
              className={`${styles.toolbarButton} ${verticalAlign === 'super' ? styles.active : ''}`}
              onClick={() => handleVerticalAlignChange('super')}
              title="上标"
            >
              <Icon name="Superscript" size={14} />
            </button>
            <button
              className={`${styles.toolbarButton} ${verticalAlign === 'sub' ? styles.active : ''}`}
              onClick={() => handleVerticalAlignChange('sub')}
              title="下标"
            >
              <Icon name="Subscript" size={14} />
            </button>
          </div>
        </div>

        {/* 列表与间距 Row 3 */}
        <div className={styles.toolbarRow}>
          <div className={styles.toolbarGroup}>
            <button
              className={styles.toolbarButton}
              title="无序列表"
              onClick={toggleBulletList}
            >
              <Icon name="List" size={14} />
            </button>
            <button
              className={styles.toolbarButton}
              title="有序列表"
              onClick={toggleOrderedList}
            >
              <Icon name="ListOrdered" size={14} />
            </button>
          </div>

          <div className={styles.separator} />

          <div className={styles.toolbarGroup} style={{ flex: 1, gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
              <Icon name="MoveVertical" size={12} color="var(--color-text-tertiary)" />
              <input
                type="number"
                className={styles.toolbarInput}
                value={lineHeight}
                onChange={handleLineHeightChange}
                step={0.1}
                min={0.5}
                max={3}
                style={{ width: '100%' }}
                title="行高"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
              <Icon name="MoveHorizontal" size={12} color="var(--color-text-tertiary)" /> {/* Spacing icon */}
              <input
                type="number"
                className={styles.toolbarInput}
                value={letterSpacing}
                onChange={handleLetterSpacingChange}
                step={0.5}
                style={{ width: '100%' }}
                title="字间距"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 颜色 Row 4 */}
      <div className={styles.toolbarLabel} style={{ marginTop: '12px' }}>颜色</div>
      <div className={styles.toolbarRow}>
        {/* 字体颜色 */}
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            className={styles.colorButton}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="字体颜色"
          >
            <div
              className={styles.colorIndicator}
              style={{ backgroundColor: textColor }}
            />
            <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{textColor}</span>
            <Icon name="ChevronDown" size={12} style={{ marginLeft: 'auto' }} />
          </button>
          {showColorPicker && (
            <div className={styles.colorPickerPopover}>
              <SketchPicker
                color={textColor}
                onChange={(color) => {
                  // Use hex if alpha is 1, otherwise use rgba string
                  const newColor = color.rgb.a === 1
                    ? color.hex
                    : `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
                  handleTextColorChange(newColor);
                }}
              />
              <div style={{ marginTop: '8px', textAlign: 'right' }}>
                <button
                  className={styles.toolbarButton}
                  style={{ width: 'auto', padding: '0 8px', fontSize: '12px', border: '1px solid var(--color-border)' }}
                  onClick={() => setShowColorPicker(false)}
                >
                  关闭
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: '8px' }} />

        {/* 背景颜色 */}
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            className={styles.colorButton}
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            title="背景颜色"
          >
            <div
              className={`${styles.colorIndicator} ${backgroundColor === 'transparent' ? styles.colorIndicatorTransparent : ''}`}
              style={{ backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor }}
            />
            <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              {backgroundColor === 'transparent' ? '无' : backgroundColor}
            </span>
            <Icon name="ChevronDown" size={12} style={{ marginLeft: 'auto' }} />
          </button>
          {showBgColorPicker && (
            <div className={styles.colorPickerPopover} style={{ right: 0, left: 'auto' }}>
              <SketchPicker
                color={getColorObject(backgroundColor)}
                onChange={(color) => {
                  const newColor = color.rgb.a === 0 && backgroundColor === 'transparent'
                    ? 'transparent'
                    : (color.rgb.a === 1 ? color.hex : `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`);
                  handleBackgroundColorChange(newColor);
                }}
              />
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  className={styles.toolbarButton}
                  style={{ width: 'auto', padding: '0 8px', fontSize: '12px', border: '1px solid var(--color-border)' }}
                  onClick={() => {
                    handleBackgroundColorChange('transparent');
                    // Don't close immediately to allow user to see effect or switch back
                  }}
                >
                  设为透明
                </button>
                <button
                  className={styles.toolbarButton}
                  style={{ width: 'auto', padding: '0 8px', fontSize: '12px', border: '1px solid var(--color-border)' }}
                  onClick={() => setShowBgColorPicker(false)}
                >
                  关闭
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 文本方向 & 更多 */}
      <div className={styles.toolbarRow} style={{ marginTop: '8px' }}>
        <div className={styles.toolbarGroup}>
          <button
            className={`${styles.toolbarButton} ${direction === 'ltr' ? styles.active : ''}`}
            onClick={() => {
              setDirection('ltr');
              applyTextStyle({ direction: 'ltr' });
            }}
            title="从左到右"
          >
            <Icon name="MoveRight" size={14} /> {/* LTR Icon fallback */}
          </button>
          <button
            className={`${styles.toolbarButton} ${direction === 'rtl' ? styles.active : ''}`}
            onClick={() => {
              setDirection('rtl');
              applyTextStyle({ direction: 'rtl' });
            }}
            title="从右到左"
          >
            <Icon name="MoveLeft" size={14} /> {/* RTL Icon fallback */}
          </button>
        </div>
      </div>

    </div>
  );
}

export default TextEditor;