const express = require('express');
const path = require('path');
const app = express();

// MIDDLEWARES
app.use(express.static('public'));

const port = 3333;

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'template/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
