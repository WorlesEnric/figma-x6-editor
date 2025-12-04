export interface Shortcut {
    key: string;
    label: string;
    displayKey: string;
  }
  
  export const shortcuts: Record<string, Shortcut> = {
    // Tools
    select: { key: 'v', label: 'Select', displayKey: 'V' },
    hand: { key: 'h', label: 'Hand', displayKey: 'H' },
    rectangle: { key: 'r', label: 'Rectangle', displayKey: 'R' },
    ellipse: { key: 'o', label: 'Ellipse', displayKey: 'O' },
    line: { key: 'l', label: 'Line', displayKey: 'L' },
    text: { key: 't', label: 'Text', displayKey: 'T' },
    frame: { key: 'f', label: 'Frame', displayKey: 'F' },
    
    // Edit
    undo: { key: 'ctrl+z', label: 'Undo', displayKey: '⌘Z' },
    redo: { key: 'ctrl+shift+z', label: 'Redo', displayKey: '⌘⇧Z' },
    copy: { key: 'ctrl+c', label: 'Copy', displayKey: '⌘C' },
    paste: { key: 'ctrl+v', label: 'Paste', displayKey: '⌘V' },
    cut: { key: 'ctrl+x', label: 'Cut', displayKey: '⌘X' },
    duplicate: { key: 'ctrl+d', label: 'Duplicate', displayKey: '⌘D' },
    delete: { key: 'backspace', label: 'Delete', displayKey: '⌫' },
    selectAll: { key: 'ctrl+a', label: 'Select All', displayKey: '⌘A' },
    
    // Grouping
    group: { key: 'ctrl+g', label: 'Group', displayKey: '⌘G' },
    ungroup: { key: 'ctrl+shift+g', label: 'Ungroup', displayKey: '⌘⇧G' },
    
    // View
    zoomIn: { key: 'ctrl+=', label: 'Zoom In', displayKey: '⌘+' },
    zoomOut: { key: 'ctrl+-', label: 'Zoom Out', displayKey: '⌘-' },
    zoomToFit: { key: 'ctrl+1', label: 'Zoom to Fit', displayKey: '⌘1' },
    zoomTo100: { key: 'ctrl+0', label: 'Zoom to 100%', displayKey: '⌘0' },
    
    // Layers
    bringForward: { key: 'ctrl+]', label: 'Bring Forward', displayKey: '⌘]' },
    sendBackward: { key: 'ctrl+[', label: 'Send Backward', displayKey: '⌘[' },
    bringToFront: { key: 'ctrl+shift+]', label: 'Bring to Front', displayKey: '⌘⇧]' },
    sendToBack: { key: 'ctrl+shift+[', label: 'Send to Back', displayKey: '⌘⇧[' },
    
    // Misc
    escape: { key: 'escape', label: 'Cancel', displayKey: 'Esc' },
  };
  
  // Cross-platform key display
  export const getDisplayKey = (shortcut: Shortcut): string => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    if (isMac) {
      return shortcut.displayKey;
    }
    
    // Convert Mac symbols to Windows/Linux
    return shortcut.displayKey
      .replace('⌘', 'Ctrl+')
      .replace('⇧', 'Shift+')
      .replace('⌥', 'Alt+')
      .replace('⌫', 'Del');
  };
  
  export const toolShortcuts: Record<string, string> = {
    v: 'select',
    h: 'hand',
    r: 'rectangle',
    o: 'ellipse',
    l: 'line',
    t: 'text',
    f: 'frame',
    d: 'diamond',
    a: 'arrow',
  };