# Figma-Style Diagram Editor - Design Document

## Overview

This project implements a Figma-inspired diagram editor using AntV X6 as the graph rendering engine. The goal is to create a draw.io alternative with modern UX patterns borrowed from Figma.

## Architecture

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Graph Engine**: AntV X6 v2.18+
- **State Management**: Zustand (lightweight, hook-based)
- **Styling**: CSS Modules with CSS Variables for theming
- **Build Tool**: Vite
- **Backend**: Express.js mock server (for development)

### Project Structure

```
figma-x6-editor/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/          # UI Components
│   │   │   ├── App/             # Root application component
│   │   │   ├── Canvas/          # X6 graph canvas wrapper
│   │   │   ├── Toolbar/         # Top toolbar with tools & actions
│   │   │   ├── LeftPanel/       # Pages, layers, shape library
│   │   │   ├── RightPanel/      # Properties, fill/stroke, alignment
│   │   │   ├── Minimap/         # Navigation minimap
│   │   │   └── common/          # Reusable UI primitives
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand state stores
│   │   ├── shapes/              # X6 shape definitions
│   │   ├── services/            # API & export services
│   │   ├── utils/               # Utility functions
│   │   ├── config/              # Configuration files
│   │   ├── types/               # TypeScript type definitions
│   │   └── styles/              # Global styles & CSS variables
│   └── public/                  # Static assets
└── backend/                     # Mock API server
```

---

## Component Design

### 1. Canvas Component (`src/components/Canvas/`)

**Purpose**: Wraps the AntV X6 graph instance and manages its lifecycle.

#### Files:
- **`Canvas.tsx`**: Main canvas component
  - Initializes X6 Graph with configuration
  - Registers all X6 plugins (selection, snapline, history, clipboard, keyboard, transform)
  - Handles graph events (selection, zoom, cell changes)
  - Syncs graph state with Zustand stores
  - Manages page switching (save/restore graph data)
  
- **`Canvas.css`**: Canvas-specific styles
  - Full viewport sizing
  - Cursor states for different tools
  - Selection box styling

- **`index.ts`**: Module exports

#### Key Features:
- Auto-save current page data before switching
- Restore page data when switching pages
- Track zoom level changes
- Emit selection changes to store
- Handle keyboard shortcuts via X6 Keyboard plugin

---

### 2. Toolbar Component (`src/components/Toolbar/`)

**Purpose**: Top navigation bar with tool selection, actions, and view controls.

#### Files:
- **`Toolbar.tsx`**: Main toolbar layout
  - Left section: Logo, project name, undo/redo
  - Center section: Tool selection (select, hand, shapes)
  - Right section: View options, zoom controls, export

- **`ShapeDropdown.tsx`**: Shape selection dropdown
  - Displays available shapes in a dropdown menu
  - Shows shape previews with icons
  - Keyboard shortcut hints
  - Sets active drawing tool on selection

- **`ZoomControls.tsx`**: Zoom management UI
  - Zoom in/out buttons
  - Current zoom percentage display
  - Preset zoom levels dropdown (25%, 50%, 100%, 200%, Fit)

---

### 3. Common Components (`src/components/common/`)

**Purpose**: Reusable UI primitives used across the application.

#### Files:

- **`Button.tsx`**: Button component
  - Variants: default, primary, ghost, danger
  - Sizes: sm, md, lg
  - Icon support (left/right position)
  - Loading state
  - IconButton variant for icon-only buttons

- **`Input.tsx`**: Text input component
  - Number input with increment/decrement
  - Label support
  - Prefix/suffix slots
  - Error state

- **`ColorPicker.tsx`**: Color selection component
  - Color palette grid
  - Recent colors section
  - Custom hex input
  - Opacity slider
  - Preview swatch

- **`Dropdown.tsx`**: Dropdown menu component
  - Trigger element support
  - Menu items with icons & shortcuts
  - Dividers between groups
  - Nested submenus
  - Click-outside to close

- **`Tabs.tsx`**: Tab navigation component
  - Horizontal tab bar
  - Active tab indicator
  - Tab change callback

- **`Icon.tsx`**: Icon wrapper component
  - Maps icon names to Lucide React icons
  - Consistent sizing
  - Color inheritance

---

### 4. Hooks (`src/hooks/`)

**Purpose**: Custom React hooks for graph interaction and state management.

#### Files:

- **`useGraph.ts`**: Graph instance management
  - Creates and configures X6 Graph
  - Registers plugins
  - Provides graph methods
  - Cleanup on unmount

- **`useSelection.ts`**: Selection state management
  - Tracks selected cells
  - Provides selection methods
  - Syncs with X6 selection plugin
  - Computes common properties

- **`useHistory.ts`**: Undo/redo functionality
  - Wraps X6 History plugin
  - Tracks canUndo/canRedo state
  - Provides undo/redo methods

- **`useKeyboard.ts`**: Keyboard shortcut handling
  - Registers global shortcuts
  - Tool switching (V, H, R, O, L, T, F)
  - Actions (Ctrl+Z, Ctrl+Y, Delete, etc.)
  - View controls (Ctrl+0, Ctrl+1)

---

### 5. TextEditor Component (`src/components/RightPanel/TextEditor.tsx`)

**Purpose**: Edit text properties of selected text nodes.

#### Features:
- Font family selection
- Font size input
- Font weight (bold) toggle
- Font style (italic) toggle
- Text alignment (left, center, right)
- Text color picker
- Line height adjustment

---

## State Management Design

### EditorStore (`src/store/editorStore.ts`)
```typescript
{
  graph: Graph | null,        // X6 instance
  tool: ToolType,             // Current active tool
  zoom: number,               // Zoom percentage
  showGrid: boolean,          // Grid visibility
  showSnaplines: boolean,     // Snapline visibility
  showMinimap: boolean,       // Minimap visibility
  isDrawing: boolean,         // Drawing mode active
  isPanning: boolean,         // Panning mode active
  canUndo: boolean,           // History state
  canRedo: boolean,           // History state
}
```

### PageStore (`src/store/pageStore.ts`)
```typescript
{
  project: Project | null,    // Current project
  pages: Page[],              // All pages
  currentPageId: string,      // Active page ID
  currentPage: Page | null,   // Active page data
}
```

### SelectionStore (`src/store/selectionStore.ts`)
```typescript
{
  selectedIds: string[],      // Selected cell IDs
  selectedCells: Cell[],      // Selected cell references
  selectedNodes: Node[],      // Selected nodes only
  selectedEdges: Edge[],      // Selected edges only
  bounds: SelectionBounds,    // Selection bounding box
  commonFill: FillStyle,      // Shared fill properties
  commonStroke: StrokeStyle,  // Shared stroke properties
  transform: Transform,       // Position/size/rotation
}
```

---

## Missing Files to Implement

### 1. `src/components/Canvas/Canvas.tsx`
Main canvas component that:
- Creates X6 Graph instance
- Registers all plugins
- Handles graph events
- Manages page data loading/saving

### 2. `src/components/Canvas/Canvas.css`
Styling for:
- Canvas container
- Cursor states per tool
- Selection visuals

### 3. `src/components/Canvas/index.ts`
Module exports

### 4. `src/components/common/ColorPicker.tsx`
Color picker with:
- Preset color palette
- Recent colors
- Hex input
- Opacity control

### 5. `src/components/common/Dropdown.tsx`
Dropdown menu with:
- Portal rendering
- Keyboard navigation
- Click-outside handling

### 6. `src/components/common/Input.tsx`
Input components for:
- Text input
- Number input with controls

### 7. `src/components/common/Tabs.tsx`
Tab component for:
- Left panel navigation
- Simple horizontal tabs

### 8. `src/components/common/index.ts`
Common component exports

### 9. `src/components/Toolbar/Toolbar.tsx`
Main toolbar with:
- Tool buttons
- Action buttons
- View toggles

### 10. `src/components/Toolbar/ShapeDropdown.tsx`
Shape selector dropdown

### 11. `src/components/RightPanel/TextEditor.tsx`
Text property editor

### 12. `src/hooks/*.ts`
All custom hooks for graph interaction

### 13. `src/utils/svgUtils.ts`
SVG parsing and manipulation utilities

### 14. `src/backend/` files
Mock server routes and data

---

## Feature Implementation Priority

1. **Core Canvas** - Graph rendering and interaction
2. **Basic Shapes** - Rectangle, ellipse, text creation
3. **Selection & Transform** - Select, move, resize, rotate
4. **Property Panel** - Fill, stroke, text editing
5. **Page Management** - Multiple pages support
6. **Layer Management** - Z-order, visibility, locking
7. **History** - Undo/redo
8. **Keyboard Shortcuts** - Standard editing shortcuts
9. **Export** - PNG, SVG, JSON export
10. **SVG Import** - Custom shape import

---

## Design Principles

1. **Figma-like UX**: Dark theme, minimal chrome, focus on canvas
2. **Performance**: Lazy loading, virtualized lists for large diagrams
3. **Extensibility**: Easy to add new shape types
4. **Offline-first**: Works without backend, localStorage backup
5. **Keyboard-centric**: All actions accessible via shortcuts