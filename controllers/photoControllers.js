// Gelen isteklere karşı ilgili yönlendirmeleri yapacağız

const Photo = require("../models/Photo");
const fs = require("fs");

// Mesela tüm fotoğrafları listelediğim için fonksiyon ismine "getAllPhotos" dedim
// burada vereceğimiz isimler böyle anlamlı olmak zorunda!

exports.getAllPhotos = async (req, res) => {
  // page dediğimiz linkteki girilen sayfa hangisiyle o sayfa açılacak, "1" ise anasayfa demek
  const page = req.query.pages || 1;    // console.log(pages) => "page" hata aldım, "pages" olmalı.
  const photosPerPage = 3; // Sayfada kaç tane foto gösterilmesini istiyoruz

  const totalPhotos = await Photo.find().countDocuments(); // Toplam foto sayımız yani 10 dönmesi lazım bize.

  // o anki sayfa ne ise, o fotoğrafları göstersin
  // bunun için "skip" ve "limit" methodundan faydalanacağız
  // Biz her sayfada 2 adet foto gösteriyorsak, ikinci sayfada bize 1 ve 2'yi pas geçip, 3 ve 4'ü gösterecek.
  // Pas geçmesi için ".skip((page - 1) * photosPerPage)" fonksiyonunu yazıyoruz
  // her sayfada kaç tane göstermesini de ".limit()" ile ayarlıyoruz
  const photos = await Photo.find({})
    .sort('-dateCreated')
    .skip((page-1) * photosPerPage)
    .limit(photosPerPage);

  // current: o andaki sayfaya karşılık geliyor
  // pages: toplam sayfa
  res.render("index", {
    // photos: photos => objenin anahtar kelimesi ve değeri aynı olacağı için "photos" yazmak yeterlidir
    photos: photos,
    current: page,
    pages: Math.ceil(totalPhotos / photosPerPage), // örneğin sayfa sayısını "2,5" yerine "3" yapacak.
  });

  /*
  console.log(req.query);
  // örnek tarayıcıya "http://localhost:3333/?user=test&pass=1234" yazdık ve
  // console'a şu bilgiler düştü: { user: 'test', pass: '1234' }

  // bu "photos", veritabanımdaki fotoğrafları gösterecek
  const photos = await Photo.find({}).sort('-dateCreated');
  // sort('-dateCreated') = sıralamayı "dateCreated"e göre yapacak ve en son yüklenen, başa gelmesi içinde başına "-" koyuyoruz!

  // ilgili template'e fotoğrafları göndermek için:
  res.render('index', {
    // photos: photos => objenin anahtar kelimesi ve değeri aynı olacağı için "photos" yazmak yeterlidir
    photos,
  });
  */
};

exports.getPhoto = async (req, res) => {
  // console.log(req.params.id); // id'yi console'a yazdırdık

  const photo = await Photo.findById(req.params.id);
  // id'yi çektikten sonra ilgili template'e yönlendireceğiz (photo.ejs)
  // templete olarak 'photo'ya girecek, bu template'e aşağıda oluşturduğum photo bilgisini gönderecek.
  // photo bilgisi = id'si yardımıyla bulduğum fotoğraf
  // Bu şekilde her bir özel fotoğraf sayfasına ilgili fotoğrafın bilgisini göndermiş olacağuk
  res.render("photo", {
    photo,
  });
};

exports.createPhoto = async (req, res) => {
  // console.log(req.files.image); // yüklediğim görselle ilgili tüm bilgilere ulaşabilirim
  // neden image? => Çünkü bizim formumuzda görselimizin name attribute'u image olduğu için (type="file" name="image")

  // await Photo.create(req.body);
  // res.redirect('/');

  const uploadDir = "public/uploads";

  // fs.existSync() = Dosyanın/Klasörün olup, olmadığını bu şekilde kontrol ediyoruz
  // fs.mkdirSync = Klasör oluşturma
  // Neden Sync ?? = Çünkü bunu önceden yapmasını istiyorum, yani asenkron değil, aşağıda işlemlere geçsin istemiyorum.
  // Önce klasörün olup olmadığını kontrol et, ondan sonra aşağıdaki işlemlere geç!

  // Eğer bu dosya (UploadDir) yoksa (!) oluştur:
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let uploadImage = req.files.image; // görselle ilgili bilgiler
  let uploadPath = __dirname + "/../public/uploads/" + uploadImage.name;
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
      image: "/uploads/" + uploadImage.name,
    });
    res.redirect("/"); // işlemi tamamladıktan sonra redirect olarak ana sayfaya yönlenecek
  });
};

exports.updatePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });

  photo.title = req.body.title;
  photo.description = req.body.description;
  photo.save();

  await res.redirect(`/photos/${req.params.id}`); // id'yi params'dan yakalıyoruz
};

exports.deletePhoto = async (req, res) => {
  //console.log(req.params.id) // silmek istediğim id'yi yakaladım ve console'a yazdırdım

  const photo = await Photo.findOne({ _id: req.params.id });
  let deleteImage = __dirname + "/../public" + photo.image;
  // _id'si parametreden gelen ["app.delete('/photos/:id'..."] req.params.id olan fotoğrafı bul diyoruz

  fs.unlinkSync(deleteImage);
  // senkron işlem yapmasını istiyorum çünkü buradaki silme işlemini yapmadan  (public/uploads klasörünün içindeki image'i silmek) bir alttaki satıra geçmesini istemiyorum
  await Photo.findByIdAndRemove(req.params.id); // içeriği siliyoruz
  res.redirect(`/`); // silme işlemi olunca direkt olarak anasayfaya dön
};
