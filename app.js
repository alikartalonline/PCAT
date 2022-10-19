const express = require('express');

const app = express();

const port = 3333;

app.get('/', (req, res) => {
  res.send('Server is ready2');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
