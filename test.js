// Using Node.js `require()`
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Connect DB
// mongoose.connect('mongodb://localhost/pcat-test-db');
// mongoose.connect('mongodb://localhost:27017/pcat-test-db');
// mongoose v6 ile birlikte deprecation warning artık gelmiyor.
// "useNewUrlParser" ve "useUnifiedTopology" yazmamıza gerek yok.
mongoose.connect('mongodb://127.0.0.1:27017/pcat-test-db');

// Create Schema
const PhotoSchema = new Schema({
  title: String,
  description: String,
});

// mongoose burada şunu yapacak: ikinci parametre olan yukarıdaki "PhotoSchema"yı ve birinci parametre olan "Photo" string bilgisini baz alarak bize yeni bir model oluşturacak.
const Photo = mongoose.model('Photo', PhotoSchema);

// Create a photo
// Şimdi veritabanımıza ilk veriyi oluşturacağız
Photo.create({
  title: 'Photo Title 1',
  description: 'Photo Description Lorem Ipsum 1',
}); 


// Read a photo
// Verileri console.log'a yazdıralım
Photo.find({}, (err, data) => {
  console.log(data);
}); 


// Update a photo
// id'yi MongoDB Compass aracında kendisi uniqe olarak veriyor.
// "Photos" collection'ı içinden değiştirmek istediğimin veriye bakarak ObjectId'yi buldum.
const id = '635291d26af821d138e7007c';
Photo.findByIdAndUpdate(
  id,
  {
    title: 'Photo Title 1 Updated',
    description: 'Photo Description 1 Updated',
  },
  {
    new: true,
  },
  (err, data) => {
    console.log(data);
  }
);

// new: true kodunu eklemez isek, bize console.log'da gösterdiği data "eski data" olur, güncellenmiş datayı "MongoDB Compass" aracından görebiliriz.

// Delete a photo
const id = '635291d26af821d138e7007c';
Photo.findByIdAndDelete(id, (err, data) => {
  console.log(`Content with id ${id} has been deleted successfully.`);
});
