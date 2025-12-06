import { useEffect, useState, useRef } from 'react';
import type { Cell, Node } from '@antv/x6';
import { useEditorStore, useSelectionStore } from '@/store';
import { Icon } from '../common/Icon';
import styles from './LeftPanel.module.css';

interface LayerData {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  cell: Cell;
  children?: LayerData[];
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  layer: LayerData | null;
}

export function LayerTree() {
  const { graph } = useEditorStore();
  const { selectedIds } = useSelectionStore();
  const [layers, setLayers] = useState<LayerData[]>([]);
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    layer: null,
  });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!graph) return;

    const updateLayers = () => {
      const cells = graph.getCells();

      // Filter only nodes (not edges) and create layer data
      const nodes = cells.filter(cell => cell.isNode());
      const allLayers: LayerData[] = nodes.map(cell => cellToLayerData(cell));

      // Sort by zIndex (ascending) for processing
      allLayers.sort((a, b) => a.zIndex - b.zIndex);

      // Helper function to check if a node overlaps with another (Figma-style)
      const isContainedIn = (inner: Cell, outer: Cell): boolean => {
        if (!inner.isNode() || !outer.isNode()) return false;

        const innerBBox = inner.getBBox();
        const outerBBox = outer.getBBox();

        // Check if inner overlaps with outer (not necessarily completely within)
        // This matches Figma's behavior where partial overlap creates parent-child relationship
        const overlapsHorizontally =
          innerBBox.x < outerBBox.x + outerBBox.width &&
          innerBBox.x + innerBBox.width > outerBBox.x;

        const overlapsVertically =
          innerBBox.y < outerBBox.y + outerBBox.height &&
          innerBBox.y + innerBBox.height > outerBBox.y;

        return overlapsHorizontally && overlapsVertically && inner.id !== outer.id;
      };

      // Build hierarchy based on spatial containment
      const layerMap = new Map<string, LayerData>();
      const childrenMap = new Map<string, LayerData[]>();
      const rootLayers: LayerData[] = [];

      allLayers.forEach(layer => {
        layerMap.set(layer.id, layer);
      });

      // For each layer, find its parent (the layer with highest zIndex that contains it)
      allLayers.forEach(layer => {
        let parentLayer: LayerData | null = null;
        let parentZIndex = -Infinity;

        // Look for potential parents (layers with lower zIndex that contain this layer)
        allLayers.forEach(potentialParent => {
          if (
            potentialParent.zIndex < layer.zIndex &&
            potentialParent.zIndex > parentZIndex &&
            isContainedIn(layer.cell, potentialParent.cell)
          ) {
            parentLayer = potentialParent;
            parentZIndex = potentialParent.zIndex;
          }
        });

        const parent = parentLayer; // Store in const for type narrowing
        if (parent !== null) {
          // Add as child
          const parentId = (parent as LayerData).id;
          if (!childrenMap.has(parentId)) {
            childrenMap.set(parentId, []);
          }
          childrenMap.get(parentId)!.push(layer);
        } else {
          // Add as root layer
          rootLayers.push(layer);
        }
      });

      // Attach children to their parents and sort them
      layerMap.forEach((layer, id) => {
        const children = childrenMap.get(id);
        if (children) {
          // Sort children by zIndex (descending - higher zIndex on top)
          children.sort((a, b) => b.zIndex - a.zIndex);
          layer.children = children;
        }
      });

      // Sort root layers by zIndex (descending - higher zIndex on top)
      rootLayers.sort((a, b) => b.zIndex - a.zIndex);

      // Auto-expand all layers with children
      const newExpandedLayers = new Set<string>();
      const addExpandedLayers = (layers: LayerData[]) => {
        layers.forEach(layer => {
          if (layer.children && layer.children.length > 0) {
            newExpandedLayers.add(layer.id);
            addExpandedLayers(layer.children);
          }
        });
      };
      addExpandedLayers(rootLayers);
      setExpandedLayers(newExpandedLayers);

      setLayers(rootLayers);
    };

    updateLayers();

    // Listen for changes
    graph.on('cell:added', updateLayers);
    graph.on('cell:removed', updateLayers);
    graph.on('cell:change:zIndex', updateLayers);
    graph.on('cell:change:visible', updateLayers);
    graph.on('cell:change:parent', updateLayers);
    graph.on('cell:change:attrs', updateLayers);
    graph.on('node:moved', updateLayers); // Update when node position changes
    graph.on('node:resized', updateLayers); // Update when node is resized

    return () => {
      graph.off('cell:added', updateLayers);
      graph.off('cell:removed', updateLayers);
      graph.off('cell:change:zIndex', updateLayers);
      graph.off('cell:change:visible', updateLayers);
      graph.off('cell:change:parent', updateLayers);
      graph.off('cell:change:attrs', updateLayers);
      graph.off('node:moved', updateLayers);
      graph.off('node:resized', updateLayers);
    };
  }, [graph]);

  // Close context menu when clicking outside
  useEffect(() => {
    if (!contextMenu.visible) return;

    let cleanupFn: (() => void) | null = null;

    // Add a small delay to prevent the right-click event from immediately closing the menu
    const timer = setTimeout(() => {
      const handleClick = (e: MouseEvent) => {
        if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as HTMLElement)) {
          setContextMenu({ visible: false, x: 0, y: 0, layer: null });
        }
      };

      document.addEventListener('mousedown', handleClick);

      cleanupFn = () => {
        document.removeEventListener('mousedown', handleClick);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
      if (cleanupFn) cleanupFn();
    };
  }, [contextMenu.visible]);

  const cellToLayerData = (cell: Cell): LayerData => {
    const isNode = cell.isNode();
    const shape = cell.shape;
    const label = isNode
      ? (cell as Node).getAttrByPath('label/text') as string
      : undefined;

    return {
      id: cell.id,
      name: label || getShapeName(shape),
      type: shape,
      visible: cell.isVisible(),
      locked: false,
      zIndex: cell.getZIndex() || 0,
      cell,
    };
  };

  const getShapeName = (shape: string): string => {
    const names: Record<string, string> = {
      'custom-rect': 'Rectangle',
      'custom-rounded-rect': 'Rounded Rect',
      'custom-ellipse': 'Ellipse',
      'custom-diamond': 'Diamond',
      'custom-triangle': 'Triangle',
      'custom-hexagon': 'Hexagon',
      'custom-star': 'Star',
      'custom-text': 'Text',
      'custom-frame': 'Frame',
      'custom-line': 'Line',
      'custom-arrow': 'Arrow',
      'custom-actor': 'Actor',
      'flowchart-process': 'Process',
      'flowchart-decision': 'Decision',
      'flowchart-terminator': 'Terminator',
      'flowchart-data': 'Data',
      'flowchart-document': 'Document',
      'flowchart-database': 'Database',
      'network-cloud': 'Cloud',
      'network-server': 'Server',
      'network-database': 'Database',
      'network-router': 'Router',
      'network-firewall': 'Firewall',
      'network-pc': 'PC',
      'network-phone': 'Phone',
      'uml-class': 'Class',
      'uml-interface': 'Interface',
      'uml-actor': 'Actor',
      'uml-usecase': 'Use Case',
      edge: 'Connector',
    };
    return names[shape] || shape;
  };

  const getLayerIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'custom-rect': 'square',
      'custom-rounded-rect': 'square',
      'custom-ellipse': 'circle',
      'custom-diamond': 'diamond',
      'custom-triangle': 'triangle',
      'custom-text': 'text',
      'custom-frame': 'frame',
      'custom-line': 'line',
      'custom-arrow': 'arrow',
      'custom-actor': 'user',
      'network-cloud': 'cloud',
      'network-server': 'server',
      'network-database': 'database',
      'network-router': 'router',
      'network-firewall': 'shield',
      'network-pc': 'monitor',
      'network-phone': 'smartphone',
      'uml-class': 'layout',
      'uml-interface': 'circle',
      'uml-actor': 'user',
      'uml-usecase': 'circle',
      edge: 'arrow',
    };
    return icons[type] || 'square';
  };

  const handleLayerClick = (layer: LayerData, e: React.MouseEvent) => {
    if (!graph) return;

    if (e.shiftKey) {
      // Add to selection
      const current = graph.getSelectedCells();
      if (selectedIds.includes(layer.id)) {
        graph.unselect(layer.cell);
      } else {
        graph.select([...current, layer.cell]);
      }
    } else {
      // Single select
      graph.cleanSelection();
      graph.select(layer.cell);
    }
  };

  const handleToggleVisibility = (layer: LayerData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!graph) return;

    const cell = graph.getCellById(layer.id);
    if (!cell) return;

    if (cell.isVisible()) {
      cell.hide();
    } else {
      cell.show();
    }
  };

  const handleContextMenu = (layer: LayerData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      layer,
    });
  };

  const bringToFront = () => {
    if (!graph || !contextMenu.layer) return;
    contextMenu.layer.cell.toFront();
    setContextMenu({ visible: false, x: 0, y: 0, layer: null });
  };

  const sendToBack = () => {
    if (!graph || !contextMenu.layer) return;
    contextMenu.layer.cell.toBack();
    setContextMenu({ visible: false, x: 0, y: 0, layer: null });
  };

  const bringForward = () => {
    if (!graph || !contextMenu.layer) return;
    const cells = graph.getCells();
    const currentZ = contextMenu.layer.cell.getZIndex() || 0;

    // Find the next higher zIndex
    const higherCells = cells
      .filter(c => (c.getZIndex() || 0) > currentZ)
      .sort((a, b) => (a.getZIndex() || 0) - (b.getZIndex() || 0));

    if (higherCells.length > 0) {
      const targetZ = higherCells[0].getZIndex() || 0;
      contextMenu.layer.cell.setZIndex(targetZ + 1);
    }

    setContextMenu({ visible: false, x: 0, y: 0, layer: null });
  };

  const sendBackward = () => {
    if (!graph || !contextMenu.layer) return;
    const cells = graph.getCells();
    const currentZ = contextMenu.layer.cell.getZIndex() || 0;

    // Find the next lower zIndex
    const lowerCells = cells
      .filter(c => (c.getZIndex() || 0) < currentZ)
      .sort((a, b) => (b.getZIndex() || 0) - (a.getZIndex() || 0));

    if (lowerCells.length > 0) {
      const targetZ = lowerCells[0].getZIndex() || 0;
      contextMenu.layer.cell.setZIndex(targetZ - 1);
    }

    setContextMenu({ visible: false, x: 0, y: 0, layer: null });
  };

  const getLayerIndex = (layer: LayerData): number => {
    // Calculate layer index (1-based, from top to bottom)
    // Top layer (highest zIndex) gets the highest number
    return layers.findIndex(l => l.id === layer.id) + 1;
  };

  const toggleExpand = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
  };

  const renderLayer = (layer: LayerData, depth = 0) => {
    const isSelected = selectedIds.includes(layer.id);
    const layerIndex = getLayerIndex(layer);
    const hasChildren = layer.children && layer.children.length > 0;
    const isExpanded = expandedLayers.has(layer.id);

    return (
      <div key={layer.id}>
        <div
          className={`${styles.layerItem} ${isSelected ? styles.selected : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            paddingTop: '6px',
            paddingBottom: '6px',
            paddingLeft: `${8 + depth * 20}px`, // Increased indentation for tree structure
            paddingRight: '8px',
            borderRadius: '4px',
            margin: '1px 0',
          }}
          onClick={(e) => handleLayerClick(layer, e)}
          onContextMenu={(e) => handleContextMenu(layer, e)}
        >
          {/* Expand/Collapse Arrow */}
          <div
            style={{
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: hasChildren ? 'pointer' : 'default',
              opacity: hasChildren ? 1 : 0,
            }}
            onClick={(e) => hasChildren ? toggleExpand(layer.id, e) : undefined}
          >
            {hasChildren && (
              <Icon
                name={isExpanded ? 'chevron-down' : 'chevron-right'}
                size={12}
                style={{ color: 'var(--color-text-tertiary)' }}
              />
            )}
          </div>

          {/* Layer Thumbnail */}
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '3px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name={getLayerIcon(layer.type)} size={12} style={{ color: 'var(--color-text-secondary)' }} />
          </div>

          {/* Layer Name */}
          <span
            className={styles.layerName}
            style={{
              flex: 1,
              fontSize: '13px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {layer.name}
          </span>

          {/* Layer Index Badge */}
          <span
            style={{
              fontSize: '10px',
              color: 'var(--color-text-tertiary)',
              fontWeight: '500',
              minWidth: '18px',
              textAlign: 'center',
              background: 'var(--color-bg-tertiary)',
              borderRadius: '3px',
              padding: '2px 4px',
              fontFamily: 'monospace',
            }}
          >
            {layerIndex}
          </span>

          {/* Visibility Toggle */}
          <div className={styles.layerActions}>
            <button
              className={`${styles.layerActionBtn} ${!layer.visible ? styles.active : ''}`}
              onClick={(e) => handleToggleVisibility(layer, e)}
              title={layer.visible ? 'Hide' : 'Show'}
              style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={layer.visible ? 'eye' : 'eye-off'} size={12} />
            </button>
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {layer.children!.map((child) => renderLayer(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (layers.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Icon name="Layers" size={32} />
        <p>No layers yet</p>
        <p style={{ fontSize: 'var(--font-size-xs)' }}>
          Add shapes to the canvas to see them here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.layerTree}>
        {layers.map((layer) => renderLayer(layer))}
      </div>

      {contextMenu.visible && contextMenu.layer && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '4px',
            zIndex: 10000,
            minWidth: '180px',
          }}
        >
          <button
            onClick={bringToFront}
            style={{
              width: '100%',
              padding: '8px 12px',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icon name="chevrons-up" size={14} />
            置顶到最上层
          </button>
          <button
            onClick={bringForward}
            style={{
              width: '100%',
              padding: '8px 12px',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icon name="chevron-up" size={14} />
            上移一层
          </button>
          <button
            onClick={sendBackward}
            style={{
              width: '100%',
              padding: '8px 12px',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icon name="chevron-down" size={14} />
            下移一层
          </button>
          <button
            onClick={sendToBack}
            style={{
              width: '100%',
              padding: '8px 12px',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icon name="chevrons-down" size={14} />
            置底到最下层
          </button>
        </div>
      )}
    </>
  );
}

export default LayerTree;
