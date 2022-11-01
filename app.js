const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');

// controller dosyamızda oldukları için bunlara app.js içinde gerek yok artık
/*
const fs = require('fs');
const Photo = require('./models/Photo');
const path = require('path');
*/

const ejs = require('ejs');
const photoController = require('./controllers/photoControllers');
const pageController = require('./controllers/pageController');

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
app.use(
  methodOverride('_method', {
    // gerektiğinde hangi methodların Override edilmesini ayrıca belirtmemiz gerekiyor:
    methods: ['POST', 'GET'],
  })
);

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

/*
// NOT: './controllers/photoControllers' dosyasını açtığım için bu bölümü aşağıdaki bölüm ile değiştirdim.

app.get('/', async (req, res) => {
  // bu "photos", veritabanımdaki fotoğrafları gösterecek
  const photos = await Photo.find({}).sort('-dateCreated');
  // sort('-dateCreated') = sıralamayı "dateCreated"e göre yapacak ve en son yüklenen, başa gelmesi içinde başına "-" koyuyoruz!

  // ilgili template'e fotoğrafları göndermek için:
  res.render('index', {
    // photos: photos => objenin anahtar kelimesi ve değeri aynı olacağı için "photos" yazmak yeterlidir
    photos,
  });
});
*/

/*
// NOT: './controllers/photoControllers' dosyasını açtığım için bu bölümü aşağıdaki bölüm ile değiştirdim.

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
*/

// ROUTES
app.get('/', photoController.getAllPhotos);
app.get('/photos/:id', photoController.getPhoto);

/*
app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/add', (req, res) => {
  res.render('add');
});
*/

app.get('/about', pageController.getAboutPage);
app.get('/add', pageController.getAddPage);

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
/*
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
*/

app.post('/photos', photoController.createPhoto);


// "Edit The Photo" sayfası
/*
app.get('/photos/edit/:id', async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });

  res.render('edit', {
    photo,
  });
});
*/
app.get('/photos/edit/:id', pageController.getEditPage);

// Anasayfa > içerik > "Update Details" içindeki "Edit The Photo"
// bölümündeki verilerle alakalı olan fotoğrafın verilerini güncelleyeceğiz
/*
app.put('/photos/:id', async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });

  photo.title = req.body.title;
  photo.description = req.body.description;
  photo.save();

  await res.redirect(`/photos/${req.params.id}`); // id'yi params'dan yakalıyoruz
});
*/
app.put('/photos/:id', photoController.updatePhoto);

/*
app.delete('/photos/:id', async (req, res) => {
  //console.log(req.params.id) // silmek istediğim id'yi yakaladım ve console'a yazdırdım

  const photo = await Photo.findOne({ _id: req.params.id });
  let deleteImage = __dirname + '/public' + photo.image;
  // _id'si parametreden gelen ["app.delete('/photos/:id'..."] req.params.id olan fotoğrafı bul diyoruz

  fs.unlinkSync(deleteImage);
  // senkron işlem yapmasını istiyorum çünkü buradaki silme işlemini yapmadan  (public/uploads klasörünün içindeki image'i silmek) bir alttaki satıra geçmesini istemiyorum
  await Photo.findByIdAndRemove(req.params.id); // içeriği siliyoruz
  res.redirect(`/`); // silme işlemi olunca direkt olarak anasayfaya dön
});
*/
app.delete('/photos/:id', photoController.deletePhoto);

const port = 3333;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
