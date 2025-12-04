const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// In-memory store (shared with main server)
let store = null;

const setStore = (s) => {
  store = s;
};

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and SVGs
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Upload asset (image)
router.post('/upload', upload.single('file'), (req, res) => {
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

// Upload SVG specifically
router.post('/svg', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!req.file.mimetype.includes('svg')) {
    // Delete the uploaded file
    fs.unlinkSync(path.join(uploadDir, req.file.filename));
    return res.status(400).json({ error: 'File must be an SVG' });
  }

  // Read the SVG content
  const svgPath = path.join(uploadDir, req.file.filename);
  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  const asset = {
    id: uuidv4(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
    content: svgContent,
    createdAt: Date.now(),
  };

  store.assets.set(asset.id, asset);
  res.json({
    url: asset.url,
    id: asset.id,
    content: svgContent,
  });
});

// Get asset by ID
router.get('/:id', (req, res) => {
  const asset = store.assets.get(req.params.id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }
  res.json(asset);
});

// Delete asset
router.delete('/:id', (req, res) => {
  const asset = store.assets.get(req.params.id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  // Delete file from disk
  const filePath = path.join(uploadDir, asset.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  store.assets.delete(req.params.id);
  res.json({ success: true });
});

// List all assets
router.get('/', (req, res) => {
  const assets = Array.from(store.assets.values()).map((a) => ({
    id: a.id,
    filename: a.filename,
    originalName: a.originalName,
    mimetype: a.mimetype,
    url: a.url,
    createdAt: a.createdAt,
  }));
  res.json(assets);
});

module.exports = { router, setStore };