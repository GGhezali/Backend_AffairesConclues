var express = require("express"); // On importe express pour créer une route
var router = express.Router(); // On crée un objet routeur express

const Auteurs = require("../models/auteurs"); // On importe le modèle de la BDD pour les auteurs

//-------------------------------------------------------------------------------------------------------------------------------
// Route pour récupérer tous les auteurs
router.get("/", async (req, res) => {
  try {
    const auteurs = await Auteurs.find(); // On cherche tous les auteurs dans la BDD
    res.json({ auteurs }); // On renvoie les auteurs au frontend
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des auteurs" }); // En cas d'erreur, on renvoie un message d'erreur
  }
});
//-------------------------------------------------------------------------------------------------------------------------------

module.exports = router; // On exporte la route pour l'utiliser dans le fichier app.js
