import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

// Type for all lucide icon names
type IconName = keyof typeof LucideIcons;

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

// Map of common icon names to Lucide icons
const iconMap: Record<string, IconName> = {
  // Tools
  select: 'MousePointer2',
  hand: 'Hand',
  rectangle: 'Square',
  ellipse: 'Circle',
  diamond: 'Diamond',
  triangle: 'Triangle',
  line: 'Minus',
  arrow: 'ArrowRight',
  text: 'Type',
  image: 'Image',
  frame: 'Frame',

  // Actions
  undo: 'Undo2',
  redo: 'Redo2',
  copy: 'Copy',
  paste: 'Clipboard',
  cut: 'Scissors',
  delete: 'Trash2',
  duplicate: 'CopyPlus',
  group: 'Group',
  ungroup: 'Ungroup',

  // View
  'zoom-in': 'ZoomIn',
  'zoom-out': 'ZoomOut',
  'zoom-fit': 'Maximize2',
  grid: 'Grid3x3',
  minimap: 'Map',
  snapline: 'Magnet',

  // Alignment
  'align-left': 'AlignLeft',
  'align-center': 'AlignCenter',
  'align-right': 'AlignRight',
  'align-top': 'AlignStartVertical',
  'align-middle': 'AlignCenterVertical',
  'align-bottom': 'AlignEndVertical',
  'distribute-h': 'AlignHorizontalSpaceAround',
  'distribute-v': 'AlignVerticalSpaceAround',

  // Layers
  'bring-front': 'BringToFront',
  'send-back': 'SendToBack',
  'layer-up': 'ArrowUp',
  'layer-down': 'ArrowDown',

  // UI
  chevronDown: 'ChevronDown',
  chevronRight: 'ChevronRight',
  chevronLeft: 'ChevronLeft',
  chevronUp: 'ChevronUp',
  'chevron-down': 'ChevronDown',
  'chevron-up': 'ChevronUp',
  'chevrons-down': 'ChevronsDown',
  'chevrons-up': 'ChevronsUp',
  plus: 'Plus',
  minus: 'Minus',
  close: 'X',
  check: 'Check',
  more: 'MoreHorizontal',
  moreVertical: 'MoreVertical',
  settings: 'Settings',
  search: 'Search',
  download: 'Download',
  upload: 'Upload',
  save: 'Save',
  file: 'File',
  folder: 'Folder',
  lock: 'Lock',
  unlock: 'Unlock',
  eye: 'Eye',
  'eye-off': 'EyeOff',

  // Shapes
  square: 'Square',
  circle: 'Circle',
  hexagon: 'Hexagon',
  star: 'Star',
  heart: 'Heart',

  // Flowchart
  database: 'Database',
  'file-text': 'FileText',
  layout: 'Layout',
  edit: 'Edit3',
  monitor: 'Monitor',

  // Misc
  info: 'Info',
  warning: 'AlertTriangle',
  error: 'AlertCircle',
  help: 'HelpCircle',
  link: 'Link',
  'external-link': 'ExternalLink',
  play: 'Play',
  pause: 'Pause',
  refresh: 'RefreshCw',
  user: 'User',
  smartphone: 'Smartphone',
  shield: 'Shield',
  cloud: 'Cloud',
  server: 'Server',
  router: 'Router',
  Layers: 'Layers',
};

export function Icon({ name, size = 16, ...props }: IconProps) {
  // Check if it's a mapped name or direct Lucide icon name
  const iconName = iconMap[name] || name;

  // Get the icon component
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[iconName];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent size={size} {...props} />;
}

export default Icon;