const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Helper function to send response
const sendResponse = (res, statusCode, message) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
  res.end(message);
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  // Base directory for file operations
  const baseDir = path.join(__dirname, 'files');
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);

  const fileName = query.name;
  const filePath = fileName ? path.join(baseDir, fileName) : null;

  // CREATE FILE - /create?name=example.txt&content=Hello
  if (pathname === '/create' && fileName && query.content) {
    fs.writeFile(filePath, query.content, (err) => {
      if (err) return sendResponse(res, 500, 'Failed to create file.');
      sendResponse(res, 200, `File '${fileName}' created.`);
    });

  // READ FILE - /read?name=example.txt
  } else if (pathname === '/read' && fileName) {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return sendResponse(res, 404, 'File not found.');
      sendResponse(res, 200, `Content of '${fileName}':\n\n${data}`);
    });

  // DELETE FILE - /delete?name=example.txt
  } else if (pathname === '/delete' && fileName) {
    fs.unlink(filePath, (err) => {
      if (err) return sendResponse(res, 404, 'File not found or could not be deleted.');
      sendResponse(res, 200, `File '${fileName}' deleted.`);
    });

  // INVALID ROUTE
  } else {
    sendResponse(res, 400, 'Invalid request. Use /create, /read, or /delete with appropriate query parameters.');
  }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
