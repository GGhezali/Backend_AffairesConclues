const mongoose = require("mongoose");

const categorieSchema = mongoose.Schema({
  name: String,
});

const Categorie = mongoose.model("categories", categorieSchema);

module.exports = Categorie;
