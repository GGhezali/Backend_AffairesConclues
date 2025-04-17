express = require("express"); // On importe express pour créer une route
var router = express.Router(); // On crée un objet routeur express
const Articles = require("../models/articles"); // recuperer le models
const { ObjectId } = require("mongodb");
// Renvoie les articles que l'utilisateur a achetés mais dont la vente n'est pas terminée
router.get("/open/:userId", (req, res) => {
  Articles.find({ acheteur: new ObjectId(req.params.userId), isDone: false })
    .populate("categorie etat auteur editeur annonceur acheteur")
    .then((articles) => {
      res.json({ result: true, articles });
    })
    .catch(() => {
      res.json({ result: false, error: "Erreur serveur." });
    });
});

// Renvoie les articles achetés et dont la vente est terminée
router.get("/closed/:userId", (req, res) => {
  Articles.find({ acheteur: new ObjectId(req.params.userId), isDone: true })
    .populate("categorie etat auteur editeur annonceur acheteur")
    .then((articles) => {
      res.json({ result: true, articles });
    })
    .catch(() => {
      res.json({ result: false, error: "Erreur serveur." });
    });
});

module.exports = router;
