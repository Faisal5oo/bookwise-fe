const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'dist/bookwise')));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/bookwise/index.html'));
});

const port = 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at:`);
  console.log(`- http://localhost:${port}`);
  console.log(`- http://127.0.0.1:${port}`);
}); 