const mongoose = require("mongoose");

const auteurSchema = mongoose.Schema({
  name: String,
});

const Auteur = mongoose.model("auteurs", auteurSchema);

module.exports = Auteur;
