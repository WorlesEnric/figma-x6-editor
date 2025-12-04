import { useEditorStore } from '@/store';
import { IconButton, Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { ShapeDropdown } from './ShapeDropdown';
import { ZoomControls } from './ZoomControls';
import type { ToolType } from '@/types';
import styles from './Toolbar.module.css';

export function Toolbar() {
  const {
    tool,
    setTool,
    canUndo,
    canRedo,
    undo,
    redo,
    showGrid,
    showSnaplines,
    showMinimap,
    toggleGrid,
    toggleSnaplines,
    toggleMinimap,
  } = useEditorStore();

  const handleToolChange = (newTool: ToolType) => {
    setTool(newTool);
  };

  return (
    <div className={styles.toolbar}>
      {/* Left Section: Logo + History */}
      <div className={styles.section}>
        <div className={styles.logo}>
          <Icon name="layout" size={20} />
        </div>
        
        <div className={styles.divider} />
        
        <div className={styles.toolGroup}>
          <IconButton
            icon="undo"
            onClick={undo}
            disabled={!canUndo}
            tooltip="Undo (⌘Z)"
          />
          <IconButton
            icon="redo"
            onClick={redo}
            disabled={!canRedo}
            tooltip="Redo (⌘⇧Z)"
          />
        </div>
      </div>

      {/* Center Section: Tools */}
      <div className={styles.section}>
        <div className={styles.toolGroup}>
          {/* Select Tool */}
          <IconButton
            icon="select"
            active={tool === 'select'}
            onClick={() => handleToolChange('select')}
            tooltip="Select (V)"
          />
          
          {/* Hand Tool */}
          <IconButton
            icon="hand"
            active={tool === 'hand'}
            onClick={() => handleToolChange('hand')}
            tooltip="Hand Tool (H)"
          />
        </div>

        <div className={styles.divider} />

        {/* Shape Tools */}
        <div className={styles.toolGroup}>
          <ShapeDropdown />
          
          {/* Text Tool */}
          <IconButton
            icon="text"
            active={tool === 'text'}
            onClick={() => handleToolChange('text')}
            tooltip="Text (T)"
          />
          
          {/* Frame Tool */}
          <IconButton
            icon="frame"
            active={tool === 'frame'}
            onClick={() => handleToolChange('frame')}
            tooltip="Frame (F)"
          />
        </div>

        <div className={styles.divider} />

        {/* Line/Arrow Tools */}
        <div className={styles.toolGroup}>
          <IconButton
            icon="line"
            active={tool === 'line'}
            onClick={() => handleToolChange('line')}
            tooltip="Line (L)"
          />
          <IconButton
            icon="arrow"
            active={tool === 'arrow'}
            onClick={() => handleToolChange('arrow')}
            tooltip="Arrow"
          />
        </div>
      </div>

      {/* Right Section: View Options + Zoom */}
      <div className={styles.section}>
        <div className={styles.toolGroup}>
          <IconButton
            icon="grid"
            active={showGrid}
            onClick={toggleGrid}
            tooltip="Toggle Grid"
          />
          <IconButton
            icon="snapline"
            active={showSnaplines}
            onClick={toggleSnaplines}
            tooltip="Toggle Snaplines"
          />
          <IconButton
            icon="minimap"
            active={showMinimap}
            onClick={toggleMinimap}
            tooltip="Toggle Minimap"
          />
        </div>

        <div className={styles.divider} />

        <ZoomControls />
      </div>
    </div>
  );
}

export default Toolbar;