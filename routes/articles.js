var express = require("express"); // On importe express pour créer une route
var router = express.Router(); // On crée un objet routeur express

const Article = require("../models/articles");
const Auteur = require("../models/auteurs");
const Categorie = require("../models/categories");

router.post("/publish", (req, res) => {

    let categorie;
    Categorie.findOne({name: req.body.categorie})
        .then(data => {
            
        })

console.log(categorie)

  const newArticle = new Article({
    titre: req.body.titre,
    categorie: categorie,
    // etat: { type: mongoose.Schema.Types.ObjectId, ref: "etats" },
    description: req.body.discription,
    // auteur: { type: mongoose.Schema.Types.ObjectId, ref: "auteurs" },
    // editeur: { type: mongoose.Schema.Types.ObjectId, ref: "editeurs" },
    startPrice: req.body.startPrice,
    currentPrice: req.body.currentPrice,
    localisation: {
        adresse: req.body.adresse,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
    },
    photoUrl: req.body.photoUrl,
    // annonceur: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    // acheteur: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    timer: req.body.timer,
    isSold: req.body.isSold,
  });
  newArticle.save().then((data) => {
    // On sauvegarde l'article' dans la base de données
    res.json({ result: true, data }); // On renvoie un succès et le token au frontend
  });
});

module.exports = router;

