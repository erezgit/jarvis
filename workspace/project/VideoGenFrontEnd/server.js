import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Parse the URL
  let filePath = req.url;
  
  // Default to index.html for root path
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  // Map URL to file path
  const fullPath = path.join(__dirname, 'dist', filePath);
  console.log(`Looking for file: ${fullPath}`);
  
  // Get file extension
  const extname = path.extname(fullPath);
  
  // Set content type based on file extension
  const contentType = MIME_TYPES[extname] || 'text/plain';
  
  // Check if file exists
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File not found: ${fullPath}`);
      // File not found, try serving index.html for SPA routing
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      console.log(`Trying index.html instead: ${indexPath}`);
      
      fs.readFile(indexPath, (err, content) => {
        if (err) {
          console.error(`Error reading index.html: ${err.message}`);
          // If index.html is also not found, return 404
          res.writeHead(404);
          res.end('File not found');
          return;
        }
        
        // Serve index.html
        console.log('Serving index.html for SPA routing');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      });
      return;
    }
    
    // File exists, read and serve it
    fs.readFile(fullPath, (err, content) => {
      if (err) {
        console.error(`Error reading file: ${err.message}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
        return;
      }
      
      // Success - serve the file
      console.log(`Serving file: ${fullPath} (${contentType})`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Current directory: ${__dirname}`);
  console.log(`Static files directory: ${path.join(__dirname, 'dist')}`);
  
  // List files in the dist directory
  try {
    const files = fs.readdirSync(path.join(__dirname, 'dist'));
    console.log('Files in dist directory:', files);
  } catch (err) {
    console.error('Error listing dist directory:', err.message);
  }
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free up the port or use a different one.`);
  } else {
    console.error('Server error:', err.message);
  }
}); 