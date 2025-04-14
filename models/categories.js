const mongoose = require('mongoose');

const categorieSchema = mongoose.Schema({
categorie: String,
});

const Categorie = mongoose.model('categories', categorieSchema);

module.exports = Categorie;