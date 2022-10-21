const express = require('express');
const path = require('path');
const ejs = require('ejs');
const { request } = require('http');

const app = express();

// TEMPLATE ENGINE
app.set('view engine', 'ejs');

// MIDDLEWARES
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// express.urlencoded() = Url'deki datayı okumamızı sağlıyor
// express.json() = Url'deki datayı json formatına dönüştürmemizi sağlıyor

// https://expressjs.com/en/api.html#express.urlencoded
// https://expressjs.com/en/5x/api.html#express.urlencoded

// https://expressjs.com/en/api.html#express.json
// https://expressjs.com/en/5x/api.html#express.json

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

// views/add.ejs dosyamızdaki form'un action="/photos" bölümündeki yönlendirmeyi burada yakalıyorum
// Daha sonrada yapması gereken işlemi söylüyorum:
// Oradan gelen bilgileri veri tabanına göndermesi
// ve daha sonra da o veritabanındaki bilgileri biz okumaya çalışacağız
// Yukarıdaki MIDDLEWARES'ler req, res döngüsü içerisinde aldığımız req'i sonlandırmamıza yardımcı oldu
// Bunları kullanmadığımız zaman sayfa sürekli yenileniyor olarak kalırdı yani req'i gönderiyorduk ama res alamadığımız için yükleniyor gif'i durmadan dönüyordu
app.post('/photos', (req, res) => {
  console.log(req.body);
  // burada console'a "req.body" yani title ve description'u yazdırdıktan sonra;
  res.redirect('/');
  // index'e ('/') yani ana sayfaya tekrardan gitmesini söylüyorum.
});

const port = 3333;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
