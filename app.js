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
  // res.sendFile(path.resolve(__dirname, 'template/index.html')); // template kalsöründeki index.html'i göndermek için kullanıyordum bu kodu ama artık gerek yok Template Engine kullanıyorum: https://www.npmjs.com/package/ejs

  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/add', (req, res) => {
  res.render('add');
});

const port = 3333;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
