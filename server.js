const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/bookwise')));

// Send all requests to index.html
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/bookwise/index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 