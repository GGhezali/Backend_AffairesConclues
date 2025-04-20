const mongoose = require("mongoose");

const localisationSchema = mongoose.Schema({
  adresse: String,
  longitude: Number,
  latitude: Number,
});

const articleSchema = mongoose.Schema({
  titre: String,
  categorie: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
  etat: { type: mongoose.Schema.Types.ObjectId, ref: "etats" },
  description: String,
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: "auteurs" },
  editeur: { type: mongoose.Schema.Types.ObjectId, ref: "editeurs" },
  startPrice: Number,
  currentPrice: Number,
  localisation: localisationSchema,
  photoUrl: [String],
  annonceur: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  acheteur: [{ type: mongoose.Schema.Types.ObjectId, ref: "users", default: null }],
  timer: Date,
  isDone: Boolean,
});

const Article = mongoose.model("articles", articleSchema);

module.exports = Article;
