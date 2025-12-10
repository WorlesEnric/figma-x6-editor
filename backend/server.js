// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({ storage });

// In-memory data store
const store = {
  projects: new Map(),
  assets: new Map(),
};

// Initialize with a default project
const defaultProjectId = uuidv4();
const defaultPageId = uuidv4();

store.projects.set(defaultProjectId, {
  id: defaultProjectId,
  name: 'Untitled Project',
  pages: [
    {
      id: defaultPageId,
      name: 'Page 1',
      data: null,
      thumbnail: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  currentPageId: defaultPageId,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============== Project Routes ==============

// List all projects
app.get('/api/projects', (req, res) => {
  const projects = Array.from(store.projects.values()).map((p) => ({
    id: p.id,
    name: p.name,
    thumbnail: p.pages[0]?.thumbnail,
    updatedAt: p.updatedAt,
  }));
  res.json(projects);
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
  const project = store.projects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// Create project
app.post('/api/projects', (req, res) => {
  const { name } = req.body;
  const pageId = uuidv4();
  const project = {
    id: uuidv4(),
    name: name || 'Untitled Project',
    pages: [
      {
        id: pageId,
        name: 'Page 1',
        data: null,
        thumbnail: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    currentPageId: pageId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  store.projects.set(project.id, project);
  res.json(project);
});

// Update project
app.patch('/api/projects/:id', (req, res) => {
  const project = store.projects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const updates = req.body;
  Object.assign(project, updates, { updatedAt: Date.now() });
  store.projects.set(project.id, project);

  res.json(project);
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  if (!store.projects.has(req.params.id)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  store.projects.delete(req.params.id);
  res.json({ success: true });
});

// Save project pages
app.put('/api/projects/:id/pages', (req, res) => {
  const project = store.projects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  project.pages = req.body.pages;
  project.updatedAt = Date.now();
  store.projects.set(project.id, project);

  res.json({ success: true });
});

// Get single page
app.get('/api/projects/:projectId/pages/:pageId', (req, res) => {
  const project = store.projects.get(req.params.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const page = project.pages.find((p) => p.id === req.params.pageId);
  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }

  res.json(page);
});

// Save page data
app.put('/api/projects/:projectId/pages/:pageId/data', (req, res) => {
  const project = store.projects.get(req.params.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const pageIndex = project.pages.findIndex((p) => p.id === req.params.pageId);
  if (pageIndex === -1) {
    return res.status(404).json({ error: 'Page not found' });
  }

  project.pages[pageIndex].data = req.body;
  project.pages[pageIndex].updatedAt = Date.now();
  project.updatedAt = Date.now();
  store.projects.set(project.id, project);

  res.json({ success: true });
});

// ============== Asset Routes ==============

// Upload asset (image)
app.post('/api/assets/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const asset = {
    id: uuidv4(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
    createdAt: Date.now(),
  };

  store.assets.set(asset.id, asset);
  res.json({ url: asset.url, id: asset.id });
});

// Upload SVG
app.post('/api/assets/svg', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!req.file.mimetype.includes('svg')) {
    return res.status(400).json({ error: 'File must be an SVG' });
  }

  const asset = {
    id: uuidv4(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
    createdAt: Date.now(),
  };

  store.assets.set(asset.id, asset);
  res.json({ url: asset.url, id: asset.id });
});

// Get asset
app.get('/api/assets/:id', (req, res) => {
  const asset = store.assets.get(req.params.id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }
  res.json(asset);
});

// Delete asset
app.delete('/api/assets/:id', (req, res) => {
  const asset = store.assets.get(req.params.id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  // Delete file
  const filePath = path.join(__dirname, 'uploads', asset.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  store.assets.delete(req.params.id);
  res.json({ success: true });
});


// ============== MCP Routes ==============

const mcpRoutes = require('./routes/mcp');
app.use('/api/mcp', mcpRoutes);

// ============== Health Check ==============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock backend server running at http://localhost:${PORT}`);
  console.log(`Default project ID: ${defaultProjectId}`);
});