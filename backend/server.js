const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Routes
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Upload endpoint for face images
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
      message: 'File uploaded successfully',
      filename: req.file.filename,
      path: req.file.path
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Face detection endpoint
app.post('/api/detect', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Here you would call your Python face detection script
    // For now, we'll just return a mock response
    res.json({
      detected: true,
      bbox: [100, 100, 200, 200],
      confidence: 0.95
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Training endpoint
app.post('/api/train', (req, res) => {
  const { name, employeeId } = req.body;
  
  if (!name || !employeeId) {
    return res.status(400).json({ error: 'Name and employee ID are required' });
  }

  // Here you would call your Python training script
  // For now, return a mock response
  res.json({
    success: true,
    message: `Training completed for ${name}`,
    modelId: `model_${employeeId}`
  });
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Server is also accessible on your network IP on port ${port}`);
  console.log('Press Ctrl+C to stop');
});