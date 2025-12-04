const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory store (shared with main server)
let store = null;

const setStore = (s) => {
  store = s;
};

// List all projects
router.get('/', (req, res) => {
  const projects = Array.from(store.projects.values()).map((p) => ({
    id: p.id,
    name: p.name,
    thumbnail: p.pages[0]?.thumbnail,
    updatedAt: p.updatedAt,
  }));
  res.json(projects);
});

// Get single project
router.get('/:id', (req, res) => {
  const project = store.projects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// Create project
router.post('/', (req, res) => {
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
router.patch('/:id', (req, res) => {
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
router.delete('/:id', (req, res) => {
  if (!store.projects.has(req.params.id)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  store.projects.delete(req.params.id);
  res.json({ success: true });
});

// Save project pages
router.put('/:id/pages', (req, res) => {
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
router.get('/:projectId/pages/:pageId', (req, res) => {
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

// Add page to project
router.post('/:id/pages', (req, res) => {
  const project = store.projects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const { name } = req.body;
  const newPage = {
    id: uuidv4(),
    name: name || `Page ${project.pages.length + 1}`,
    data: null,
    thumbnail: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  project.pages.push(newPage);
  project.updatedAt = Date.now();
  store.projects.set(project.id, project);

  res.json(newPage);
});

// Delete page from project
router.delete('/:projectId/pages/:pageId', (req, res) => {
  const project = store.projects.get(req.params.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (project.pages.length <= 1) {
    return res.status(400).json({ error: 'Cannot delete the last page' });
  }

  const pageIndex = project.pages.findIndex((p) => p.id === req.params.pageId);
  if (pageIndex === -1) {
    return res.status(404).json({ error: 'Page not found' });
  }

  project.pages.splice(pageIndex, 1);

  // Update current page if deleted
  if (project.currentPageId === req.params.pageId) {
    project.currentPageId = project.pages[0].id;
  }

  project.updatedAt = Date.now();
  store.projects.set(project.id, project);

  res.json({ success: true });
});

// Save page data
router.put('/:projectId/pages/:pageId/data', (req, res) => {
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

// Update page thumbnail
router.put('/:projectId/pages/:pageId/thumbnail', (req, res) => {
  const project = store.projects.get(req.params.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const pageIndex = project.pages.findIndex((p) => p.id === req.params.pageId);
  if (pageIndex === -1) {
    return res.status(404).json({ error: 'Page not found' });
  }

  project.pages[pageIndex].thumbnail = req.body.thumbnail;
  store.projects.set(project.id, project);

  res.json({ success: true });
});

module.exports = { router, setStore };