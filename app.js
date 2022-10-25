const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

const fs = require('fs');
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
app.use(fileUpload());

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
  const photos = await Photo.find({}).sort('-dateCreated')
  // sort('-dateCreated') = sıralamayı "dateCreated"e göre yapacak ve en son yüklenen, başa gelmesi içinde başına "-" koyuyoruz!

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
  // console.log(req.files.image); // yüklediğim görselle ilgili tüm bilgilere ulaşabilirim
  // neden image? => Çünkü bizim formumuzda görselimizin name attribute'u image olduğu için (type="file" name="image")

  // await Photo.create(req.body);
  // res.redirect('/');

  const uploadDir = 'public/uploads';

  // fs.existSync() = Dosyanın/Klasörün olup, olmadığını bu şekilde kontrol ediyoruz
  // fs.mkdirSync = Klasör oluşturma
  // Neden Sync ?? = Çünkü bunu önceden yapmasını istiyorum, yani asenkron değil, aşağıda işlemlere geçsin istemiyorum.
  // Önce klasörün olup olmadığını kontrol et, ondan sonra aşağıdaki işlemlere geç!

  // Eğer bu dosya (UploadDir) yoksa (!) oluştur:
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let uploadImage = req.files.image; // görselle ilgili bilgiler
  let uploadPath = __dirname + '/public/uploads/' + uploadImage.name;
  // uploadPath = Ben bu "public" içerisinde "uploads" adında bir klasör oluşmasını istiyorum
  // ve bu "/publics/uploads/" klasörünün içine de görsellerin gitmesini istiyorum
  // ___dirname = var olan klasörün kendisini gösterir

  // Benim yüklemesini istediğim klasöre "mv" etmesi için, o klasöre eklemesi için:
  // İlk parametre olarak nereye eklemesi gerektiğini söylüyorum: uploadPath
  // İkinci parametre de istediğimiz klasöre ekleme yapacak, farklı klasöre gönderdi ve o gönderirken şurada da şunu diyorum:
  // "image: '/uploads/' + uploadImage.name," = Görselin yolunu bana bildir ki ben bu görsel yolunu sonradan veritabanına kaydedebileyim.
  // "MongoDB Compass" aracımızda <image=''> bölümüne ekleniyor yani.
  uploadImage.mv(uploadPath, async () => {
    await Photo.create({
      ...req.body,
      image: '/uploads/' + uploadImage.name,
    });
    res.redirect('/'); // işlemi tamamladıktan sonra redirect olarak ana sayfaya yönlenecek
  });
});

const port = 3333;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
