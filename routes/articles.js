<<<<<<< HEAD
var express = require('express');
var router = express.Router();

module.exports = router;
=======
var express = require("express"); // On importe express pour créer une route
var router = express.Router(); // On crée un objet routeur express

//On importe toutes les BDD pour les utiliser ensuite
const Article = require("../models/articles");
const Auteur = require("../models/auteurs");
const Editeur = require("../models/editeurs");
const Categorie = require("../models/categories");
const Etat = require("../models/etats");
const User = require("../models/users");

//Route pour publier un nouvel article
//
router.post("/publish", async (req, res) => {
  const foundCategory = await Categorie.findOne({ name: req.body.categorie });
  const foundEtat = await Etat.findOne({ condition: req.body.etat });
  const foundAuteur = await Auteur.findOne({ name: req.body.auteur });
  const foundEditeur = await Editeur.findOne({ name: req.body.editeur });
  const foundAnonceur = await User.findOne({ username: req.body.annonceur });
  const foundAcheteur = await User.findOne({ username: req.body.acheteur });

  const newArticle = new Article({
    titre: req.body.titre,
    categorie: foundCategory._id,
    etat: foundEtat._id,
    description: req.body.discription,
    auteur: foundAuteur._id,
    editeur: foundEditeur._id,
    startPrice: req.body.startPrice,
    currentPrice: req.body.currentPrice,
    localisation: {
      adresse: req.body.adresse,
      longitude: req.body.longitude,
      latitude: req.body.latitude,
    },
    photoUrl: req.body.photoUrl,
    annonceur: foundAnonceur._id,
    acheteur: foundAcheteur._id,
    timer: req.body.timer,
    isDone: req.body.isDone,
  });

  // On sauvegarde l'article' dans la base de données
  newArticle.save().then((data) => {
    // On renvoie un succès et on affiche l'article poster dans le backend
    res.json({ result: true, data });
  });
});

module.exports = router;
>>>>>>> a219a6932ca859f054859e887c365db673175ade
