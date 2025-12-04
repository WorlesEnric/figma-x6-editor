# Figma-Style Diagram Editor with AntV X6

A modern, Figma-inspired diagram editor built with React and AntV X6. This project aims to be a draw.io alternative with a cleaner, more intuitive UX.

![Diagram Editor Preview](docs/preview.png)

## ✨ Features

### Core Editing
- **Multi-page Support** - Create and manage multiple pages/canvases within a project
- **Shape Library** - Drag-and-drop shapes from the stencil panel (basic shapes + flowchart)
- **Layer Management** - Hierarchical layer panel with visibility/lock controls
- **Property Inspector** - Edit fill, stroke, text, and transform properties
- **Undo/Redo** - Full history management with keyboard shortcuts

### Canvas Features
- **Infinite Canvas** - Pan and zoom with mouse/trackpad
- **Smart Guides** - Snaplines for precise alignment
- **Grid System** - Optional grid overlay
- **Minimap** - Navigate large diagrams easily
- **Multi-select** - Rubberband selection and shift-click

### Shapes
- **Basic Shapes** - Rectangle, Ellipse, Diamond, Triangle, Hexagon, Star, Text, Frame
- **Flowchart Shapes** - Process, Decision, Terminator, Data, Document, Database, etc.
- **Connectors** - Lines, arrows with routing
- **Custom SVG Import** - Import external SVG files as shapes

### Export
- **PNG** - High-resolution image export
- **SVG** - Vector export for scalability
- **JSON** - Project data for backup/restore

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/figma-x6-editor.git
cd figma-x6-editor

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies (optional, for mock API)
cd ../backend
npm install
```

### Development

```bash
# Terminal 1: Start the frontend
cd frontend
npm run dev
# Opens at http://localhost:3000

# Terminal 2: Start the mock backend (optional)
cd backend
npm start
# API runs at http://localhost:3001
```

### Production Build

```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
figma-x6-editor/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/          # UI Components
│   │   │   ├── App/             # Root app component
│   │   │   ├── Canvas/          # X6 graph canvas
│   │   │   ├── Toolbar/         # Top toolbar
│   │   │   ├── LeftPanel/       # Pages, layers, shapes
│   │   │   ├── RightPanel/      # Properties panel
│   │   │   ├── Minimap/         # Navigation minimap
│   │   │   └── common/          # Reusable UI components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand state management
│   │   ├── shapes/              # X6 shape definitions
│   │   ├── services/            # API & export services
│   │   ├── utils/               # Utility functions
│   │   ├── config/              # Configuration
│   │   ├── types/               # TypeScript definitions
│   │   └── styles/              # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                     # Mock API server
│   ├── server.js
│   ├── routes/
│   └── package.json
├── doc.md                       # Design document
└── README.md
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `V` | Select tool |
| `H` | Hand (pan) tool |
| `R` | Rectangle |
| `O` | Ellipse |
| `D` | Diamond |
| `L` | Line |
| `T` | Text |
| `F` | Frame |
| `⌘/Ctrl + Z` | Undo |
| `⌘/Ctrl + ⇧ + Z` | Redo |
| `⌘/Ctrl + C` | Copy |
| `⌘/Ctrl + V` | Paste |
| `⌘/Ctrl + X` | Cut |
| `⌘/Ctrl + D` | Duplicate |
| `⌘/Ctrl + A` | Select All |
| `Delete` / `Backspace` | Delete selected |
| `⌘/Ctrl + G` | Group |
| `⌘/Ctrl + ⇧ + G` | Ungroup |
| `⌘/Ctrl + ]` | Bring Forward |
| `⌘/Ctrl + [` | Send Backward |
| `⌘/Ctrl + 0` | Zoom to 100% |
| `⌘/Ctrl + 1` | Zoom to Fit |
| `⌘/Ctrl + +` | Zoom In |
| `⌘/Ctrl + -` | Zoom Out |
| `Escape` | Deselect / Cancel |
| `Space` (hold) | Pan canvas |

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **AntV X6** - Graph/diagram engine
- **Zustand** - State management
- **Lucide React** - Icons
- **CSS Modules** - Scoped styling

### Backend (Mock)
- **Express.js** - API server
- **Multer** - File uploads
- **UUID** - ID generation

## 🎨 Design Principles

1. **Figma-like UX** - Dark theme, minimal chrome, focus on canvas
2. **Performance First** - Efficient rendering for large diagrams
3. **Extensibility** - Easy to add new shape types
4. **Offline-first** - Works without backend, localStorage backup
5. **Keyboard-centric** - All actions accessible via shortcuts

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `@antv/x6` | Core graph rendering engine |
| `@antv/x6-plugin-selection` | Multi-select & rubberband |
| `@antv/x6-plugin-snapline` | Smart alignment guides |
| `@antv/x6-plugin-history` | Undo/redo |
| `@antv/x6-plugin-clipboard` | Copy/paste |
| `@antv/x6-plugin-keyboard` | Keyboard shortcuts |
| `@antv/x6-plugin-transform` | Resize/rotate handles |
| `@antv/x6-plugin-scroller` | Infinite canvas |
| `@antv/x6-plugin-minimap` | Navigation minimap |
| `@antv/x6-plugin-dnd` | Drag from stencil |
| `zustand` | Lightweight state management |

## 🔧 Configuration

### Graph Config (`src/config/graphConfig.ts`)
Customize canvas behavior, grid, connecting rules, etc.

### Theme (`src/config/theme.ts`)
Color palette, spacing, typography, shadows.

### Shortcuts (`src/config/shortcuts.ts`)
Keyboard shortcut mappings.

## 🚧 Roadmap

- [ ] Real-time collaboration (WebSocket/CRDT)
- [ ] Component library (reusable symbols)
- [ ] Auto-layout / constraints
- [ ] Comments & annotations
- [ ] Version history
- [ ] Templates gallery
- [ ] Plugin system
- [ ] Mobile/tablet support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [AntV X6](https://x6.antv.antgroup.com/) - Excellent graph engine
- [Figma](https://figma.com) - UX inspiration
- [draw.io](https://draw.io) - Feature inspiration
- [Lucide](https://lucide.dev) - Beautiful icons

---

Built with ❤️ using React and AntV X6