/**
 * MCP HTTP API Routes
 * Provides HTTP endpoints for MCP operations (for easier integration)
 */

const express = require('express');
const router = express.Router();
const mcpServer = require('../mcp-server');

// Get canvas state
router.get('/canvas/state', (req, res) => {
  try {
    const state = mcpServer.getCanvasState();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create shape
router.post('/canvas/shapes', (req, res) => {
  try {
    const result = mcpServer.createShape(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update shape
router.put('/canvas/shapes/:nodeId', (req, res) => {
  try {
    const result = mcpServer.updateShape({
      nodeId: req.params.nodeId,
      ...req.body,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete shape
router.delete('/canvas/shapes/:nodeId', (req, res) => {
  try {
    const result = mcpServer.deleteShape({ nodeId: req.params.nodeId });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create edge
router.post('/canvas/edges', (req, res) => {
  try {
    const result = mcpServer.createEdge(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete edge
router.delete('/canvas/edges/:edgeId', (req, res) => {
  try {
    const result = mcpServer.deleteEdge({ edgeId: req.params.edgeId });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clear canvas
router.post('/canvas/clear', (req, res) => {
  try {
    const result = mcpServer.clearCanvas();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Select nodes
router.post('/canvas/select', (req, res) => {
  try {
    const result = mcpServer.selectNodes(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get node info
router.get('/canvas/nodes/:nodeId', (req, res) => {
  try {
    const result = mcpServer.getNodeInfo({ nodeId: req.params.nodeId });
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// List available shapes
router.get('/canvas/shapes', (req, res) => {
  try {
    const result = mcpServer.listShapes();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync canvas state (for updating from frontend)
router.put('/canvas/sync', (req, res) => {
  try {
    const { nodes, edges, viewport, selectedIds } = req.body;
    mcpServer.updateCanvasState({ nodes, edges, viewport, selectedIds });
    res.json({ success: true, message: 'Canvas state synced' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

