var express = require("express"); // On importe express pour créer une route
var router = express.Router(); // On crée un objet routeur express

const Categorie = require("../models/categories"); // On importe le modèle de la BDD pour les catégories

//-------------------------------------------------------------------------------------------------------------------------------
// Route pour récupérer toutes les catégories
router.get("/", async (req, res) => {
  try {
    const categories = await Categorie.find(); // On cherche toutes les catégories dans la BDD
    res.json({ categories: categories }); // On renvoie les catégories au frontend
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des catégories" }); // En cas d'erreur, on renvoie un message d'erreur
  }
});
//-------------------------------------------------------------------------------------------------------------------------------

module.exports = router; // On exporte la route pour l'utiliser dans le fichier app.js
