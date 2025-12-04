import { useEffect, useState } from 'react';
import type { Cell, Node } from '@antv/x6';
import { useEditorStore, useSelectionStore } from '@/store';
import { Icon } from '../common/Icon';
import { IconButton } from '../common/Button';
import styles from './LeftPanel.module.css';

interface LayerData {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  cell: Cell;
  children?: LayerData[];
}

export function LayerTree() {
  const { graph } = useEditorStore();
  const { selectedIds, setSelection } = useSelectionStore();
  const [layers, setLayers] = useState<LayerData[]>([]);

  useEffect(() => {
    if (!graph) return;

    const updateLayers = () => {
      const cells = graph.getCells();
      const layerData: LayerData[] = [];
      const childrenMap = new Map<string, LayerData[]>();

      // First pass: create layer data for all cells
      cells.forEach((cell) => {
        const parentId = cell.getParentId?.();
        const data = cellToLayerData(cell);

        if (parentId) {
          if (!childrenMap.has(parentId)) {
            childrenMap.set(parentId, []);
          }
          childrenMap.get(parentId)!.push(data);
        } else {
          layerData.push(data);
        }
      });

      // Second pass: attach children
      layerData.forEach((layer) => {
        const children = childrenMap.get(layer.id);
        if (children) {
          layer.children = children;
        }
      });

      // Sort by zIndex (reverse so higher zIndex appears at top)
      layerData.sort((a, b) => {
        const aZ = a.cell.getZIndex() || 0;
        const bZ = b.cell.getZIndex() || 0;
        return bZ - aZ;
      });

      setLayers(layerData);
    };

    updateLayers();

    // Listen for changes
    graph.on('cell:added', updateLayers);
    graph.on('cell:removed', updateLayers);
    graph.on('cell:change:zIndex', updateLayers);
    graph.on('cell:change:visible', updateLayers);
    graph.on('cell:change:parent', updateLayers);

    return () => {
      graph.off('cell:added', updateLayers);
      graph.off('cell:removed', updateLayers);
      graph.off('cell:change:zIndex', updateLayers);
      graph.off('cell:change:visible', updateLayers);
      graph.off('cell:change:parent', updateLayers);
    };
  }, [graph]);

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
      locked: false, // X6 doesn't have built-in lock, we'll track separately
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
      'flowchart-process': 'Process',
      'flowchart-decision': 'Decision',
      'flowchart-terminator': 'Terminator',
      'flowchart-data': 'Data',
      'flowchart-document': 'Document',
      'flowchart-database': 'Database',
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
    if (layer.visible) {
      layer.cell.hide();
    } else {
      layer.cell.show();
    }
    // Force re-render
    setLayers([...layers]);
  };

  const renderLayer = (layer: LayerData, depth = 0) => {
    const isSelected = selectedIds.includes(layer.id);

    return (
      <div key={layer.id}>
        <div
          className={`${styles.layerItem} ${isSelected ? styles.selected : ''}`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={(e) => handleLayerClick(layer, e)}
        >
          <span className={styles.layerIcon}>
            <Icon name={getLayerIcon(layer.type)} size={14} />
          </span>
          <span className={styles.layerName}>{layer.name}</span>
          <div className={styles.layerActions}>
            <button
              className={`${styles.layerActionBtn} ${!layer.visible ? styles.active : ''}`}
              onClick={(e) => handleToggleVisibility(layer, e)}
              title={layer.visible ? 'Hide' : 'Show'}
            >
              <Icon name={layer.visible ? 'eye' : 'eye-off'} size={12} />
            </button>
          </div>
        </div>
        {layer.children?.map((child) => renderLayer(child, depth + 1))}
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
    <div className={styles.layerTree}>
      {layers.map((layer) => renderLayer(layer))}
    </div>
  );
}

export default LayerTree;