const express = require('express');
const mongoose = require('mongoose');

const ejs = require('ejs');
const path = require('path');
const Photo = require('./models/Photo');

const app = express();

// Connect DB
mongoose.connect('mongodb://127.0.0.1:27017/pcat-test-db');

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
/*
app.get('/', (req, res) => {
  // res.sendFile(path.resolve(__dirname, 'template/index.html'));
  // template kalsöründeki index.html'i göndermek için kullanıyordum bu kodu
  // ama artık gerek yok Template Engine kullanıyorum: https://www.npmjs.com/package/ejs

  res.render('index');
});
*/
app.get('/', async (req, res) => {
  // bu "photos", veritabanımdaki fotoğrafları gösterecek
  const photos = await Photo.find({});

  // ilgili template'e fotoğrafları göndermek için:
  res.render('index', {
    // photos: photos => objenin anahtar kelimesi ve değeri aynı olacağı için "photos" yazmak yeterlidir
    photos,
  });
});

app.get('/photos/:id', async (req, res) => {
  // console.log(req.params.id); // id'yi console'a yazdırdık

  const photo = await Photo.findById(req.params.id);
  // id'yi çektikten sonra ilgili template'e yönlendireceğiz (photo.ejs)
  // templete olarak 'photo'ya girecek, bu template'e aşağıda oluşturduğum photo bilgisini gönderecek.
  // photo bilgisi = id'si yardımıyla bulduğum fotoğraf
  // Bu şekilde her bir özel fotoğraf sayfasına ilgili fotoğrafın bilgisini göndermiş olacağuk
  res.render('photo', {
    photo,
  });
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
/*
app.post('/photos', (req, res) => {
  console.log(req.body);
  // burada console'a "req.body" yani title ve description'u yazdırdıktan sonra;
  res.redirect('/');
  // index'e ('/') yani ana sayfaya tekrardan gitmesini söylüyorum.
});
*/
app.post('/photos', async (req, res) => {
  await Photo.create(req.body);
  res.redirect('/');
});

const port = 3333;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
