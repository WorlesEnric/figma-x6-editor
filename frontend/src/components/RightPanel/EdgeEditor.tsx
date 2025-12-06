import { useState, useEffect } from 'react';
import { useSelectionStore, useEditorStore } from '@/store';
import { ColorPicker } from '../common/ColorPicker';
import styles from './RightPanel.module.css';

const edgeStyles = [
    {
        value: 'custom-line',
        label: 'Line',
        preview: (
            <svg viewBox="0 0 40 10" fill="none" stroke="currentColor" strokeWidth="0.4">
                <line x1="2" y1="5" x2="38" y2="5" />
            </svg>
        )
    },
    {
        value: 'custom-arrow',
        label: 'Arrow',
        preview: (
            <svg viewBox="0 0 40 10" fill="none" stroke="currentColor" strokeWidth="0.4">
                <line x1="2" y1="5" x2="34" y2="5" />
                <path d="M30 2 L38 5 L30 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        value: 'custom-double-arrow',
        label: 'Double Arrow',
        preview: (
            <svg viewBox="0 0 40 10" fill="none" stroke="currentColor" strokeWidth="0.4">
                <line x1="6" y1="5" x2="34" y2="5" />
                <path d="M10 2 L2 5 L10 8 M30 2 L38 5 L30 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        value: 'custom-dashed-line',
        label: 'Dashed Line',
        preview: (
            <svg viewBox="0 0 40 10" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="4,2">
                <line x1="2" y1="5" x2="38" y2="5" />
            </svg>
        )
    },
    {
        value: 'custom-dotted-line',
        label: 'Dotted Line',
        preview: (
            <svg viewBox="0 0 40 10" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1,2" strokeLinecap="round">
                <line x1="2" y1="5" x2="38" y2="5" />
            </svg>
        )
    },
    {
        value: 'custom-dashed-arrow',
        label: 'Dashed Arrow',
        preview: (
            <svg viewBox="0 0 40 10" fill="none" stroke="currentColor" strokeWidth="0.4">
                <line x1="2" y1="5" x2="34" y2="5" strokeDasharray="4,2" />
                <path d="M30 2 L38 5 L30 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        value: 'custom-curved-arrow',
        label: 'Curved Arrow',
        preview: (
            <svg viewBox="0 0 40 16" fill="none" stroke="currentColor" strokeWidth="0.4">
                <path d="M2 12 C14 12, 14 4, 34 4" />
                <path d="M30 1 L38 4 L30 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        value: 'custom-thick-arrow',
        label: 'Thick Arrow',
        preview: (
            <svg viewBox="0 0 40 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                <line x1="2" y1="5" x2="32" y2="5" />
                <path d="M32 2 L38 5 L32 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        value: 'custom-diamond-arrow',
        label: 'Diamond Arrow',
        preview: (
            <svg viewBox="0 0 40 10" fill="none" stroke="currentColor" strokeWidth="0.4">
                <line x1="2" y1="5" x2="32" y2="5" />
                <path d="M32 5 L35 2 L38 5 L35 8 Z" fill="currentColor" stroke="none" />
            </svg>
        )
    },
    {
        value: 'custom-circle-arrow',
        label: 'Circle Arrow',
        preview: (
            <svg viewBox="0 0 40 10" fill="none" stroke="currentColor" strokeWidth="0.4">
                <line x1="2" y1="5" x2="32" y2="5" />
                <circle cx="35" cy="5" r="3" fill="currentColor" stroke="none" />
            </svg>
        )
    },
];

export function EdgeEditor() {
    const { graph } = useEditorStore();
    const { selectedEdges } = useSelectionStore();

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [strokeColor, setStrokeColor] = useState('#808080');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [edgeStyle, setEdgeStyle] = useState('custom-arrow');

    // Get current edge properties
    useEffect(() => {
        if (selectedEdges.length === 1) {
            const edge = selectedEdges[0];
            const attrs = edge.getAttrs();

            if (attrs?.line) {
                const line = attrs.line as Record<string, unknown>;
                setStrokeColor((line.stroke as string) || '#808080');
                setStrokeWidth((line.strokeWidth as number) || 2);
            }

            // Get edge shape/style
            setEdgeStyle(edge.shape || 'custom-arrow');
        }
    }, [selectedEdges]);

    if (selectedEdges.length === 0) {
        return null;
    }

    const applyEdgeStyle = (updates: Record<string, unknown>) => {
        if (!graph) return;

        selectedEdges.forEach(edge => {
            Object.entries(updates).forEach(([key, value]) => {
                edge.attr(`line / ${key} `, value as any);
            });
        });
    };

    const handleColorChange = (color: string) => {
        setStrokeColor(color);
        applyEdgeStyle({ stroke: color });
    };

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setStrokeWidth(value);
            applyEdgeStyle({ strokeWidth: value });
        }
    };

    const handleStyleChange = (newStyle: string) => {
        setEdgeStyle(newStyle);

        if (!graph) return;

        // Change edge shape/type
        // We need to collect new edges to select them after the operation
        const newEdges: any[] = [];

        graph.batchUpdate(() => {
            selectedEdges.forEach(edge => {
                // Get the registered edge definition
                const EdgeClass = graph.getCellById(edge.id);
                if (EdgeClass) {
                    // Update edge to new style by recreating it
                    // IMPORTANT: Use getSource/getTarget to preserve ports and exact connection points!
                    const source = edge.getSource();
                    const target = edge.getTarget();
                    const vertices = edge.getVertices();

                    if (source && target) {
                        // Remove old edge
                        graph.removeEdge(edge);

                        // Create new edge with new style
                        const newEdge = graph.addEdge({
                            shape: newStyle,
                            source: source,
                            target: target,
                            vertices: vertices, // Preserve paths
                            attrs: {
                                line: {
                                    stroke: strokeColor,
                                    strokeWidth: strokeWidth, // UI logic: use current width (default 2), not forced 1
                                },
                            },
                        });
                        newEdges.push(newEdge);
                    }
                }
            });
        });

        // Select the new edges to keep the panel open
        if (newEdges.length > 0) {
            graph.select(newEdges);
        }
    };

    return (
        <div>
            {/* Edge Style - Visual Grid */}
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <span className={styles.propertyLabel} style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                    Arrow Style
                </span>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 'var(--spacing-xs)',
                }}>
                    {edgeStyles.map(style => (
                        <button
                            key={style.value}
                            onClick={() => handleStyleChange(style.value)}
                            title={style.label}
                            style={{
                                padding: 'var(--spacing-sm)',
                                border: edgeStyle === style.value
                                    ? '2px solid var(--color-accent)'
                                    : '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                background: edgeStyle === style.value
                                    ? 'var(--color-accent-muted)'
                                    : 'var(--color-bg-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '32px',
                                transition: 'all 0.2s',
                                color: 'var(--color-text-primary)',
                            }}
                            onMouseEnter={(e) => {
                                if (edgeStyle !== style.value) {
                                    e.currentTarget.style.background = 'var(--color-bg-hover)';
                                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (edgeStyle !== style.value) {
                                    e.currentTarget.style.background = 'var(--color-bg-secondary)';
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                }
                            }}
                        >
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                                {style.preview}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stroke Width */}
            <div className={styles.propertyRow} style={{ marginTop: 'var(--spacing-sm)' }}>
                <span className={styles.propertyLabel}>Width</span>
                <div className={styles.propertyInput}>
                    <input
                        type="number"
                        value={strokeWidth}
                        onChange={handleWidthChange}
                        min={1}
                        max={20}
                    />
                </div>
            </div>

            {/* Stroke Color */}
            <div className={styles.colorRow} style={{ marginTop: 'var(--spacing-sm)' }}>
                <span className={styles.propertyLabel}>Color</span>
                <div
                    className={styles.colorPreview}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    style={{ position: 'relative' }}
                >
                    <div
                        className={styles.colorSwatch}
                        style={{ backgroundColor: strokeColor }}
                    />
                    {showColorPicker && (
                        <div className={styles.colorPickerPopover}>
                            <ColorPicker
                                value={strokeColor}
                                onChange={handleColorChange}
                            />
                        </div>
                    )}
                </div>
                <div className={styles.colorInput}>
                    <input
                        type="text"
                        value={strokeColor.toUpperCase()}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                                handleColorChange(val);
                            }
                        }}
                        maxLength={7}
                    />
                </div>
            </div>
        </div>
    );
}

export default EdgeEditor;
