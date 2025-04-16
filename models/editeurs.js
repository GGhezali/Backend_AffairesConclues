const mongoose = require("mongoose");

const editeurSchema = mongoose.Schema({
  name: String,
});

const Editeur = mongoose.model("editeurs", editeurSchema);

module.exports = Editeur;
