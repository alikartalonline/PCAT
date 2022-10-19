const express = require('express');
const path = require('path');
const ejs = require('ejs');

const app = express();

// TEMPLATE ENGINE
app.set('view engine', 'ejs');

// MIDDLEWARES
app.use(express.static('public'));

// ROUTES
app.get('/', (req, res) => {
  // res.sendFile(path.resolve(__dirname, 'template/index.html'));
  res.render("index")
});




const port = 3333;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
