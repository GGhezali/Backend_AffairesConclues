var express = require("express"); // On importe express pour créer une route
var router = express.Router(); // On crée un objet routeur express

const Editeurs = require("../models/editeurs"); // On importe le modèle de la BDD pour les editeurs

//-------------------------------------------------------------------------------------------------------------------------------
// Route pour récupérer tous les editeurs
router.get("/", async (req, res) => {
  try {
    const editeurs = await Editeurs.find(); // On cherche tous les editeurs dans la BDD
    res.json({ editeurs }); // On renvoie les editeurs au frontend
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des editeurs" }); // En cas d'erreur, on renvoie un message d'erreur
  }
});
//-------------------------------------------------------------------------------------------------------------------------------

module.exports = router; // On exporte la route pour l'utiliser dans le fichier app.js
