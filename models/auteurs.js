const mongoose = require("mongoose");

const auteurSchema = mongoose.Schema({
  auteur: String,
});

const Auteur = mongoose.model("auteurs", auteurSchema);

module.exports = Auteur;
