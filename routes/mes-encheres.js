express = require("express"); // On importe express pour créer une route
var router = express.Router(); // On crée un objet routeur express
const Articles = require("../models/articles"); // recuperer le models
const { ObjectId } = require("mongodb");// On importe "ObjectId" depuis mongodb pour convertir un id utilisateur en type ObjectId (utilisé par MongoDB)

// ==================================================================================================
// ROUTE : /open/:userId
// Méthode : GET
// Description : Cette route récupère tous les articles sur lesquels l'utilisateur a enchéri
//               (c'est-à-dire où il est l'acheteur), et dont la vente n'est **pas terminée** (isDone: false)
// ==================================================================================================
router.get("/open/:userId", (req, res) => {
  // On recherche les articles avec :
  // - "acheteur" égal à l'utilisateur (on convertit l'id passé en URL en ObjectId)
  // - "isDone" égal à false (la vente est en cours)
  Articles.find({ acheteur: new ObjectId(req.params.userId), isDone: false })
  // On utilise "populate" pour remplacer les références MongoDB par les objets complets liés à ces champs
    .populate("categorie etat auteur editeur annonceur acheteur")
    .then((articles) => {
  // Si tout se passe bien, on envoie la réponse avec les articles trouvés
      res.json({ result: true, articles });
    })
    .catch(() => {
  // Si une erreur se produit (ex: problème base de données), on envoie une erreur
      res.json({ result: false, error: "Erreur serveur." });
    });
});
// ==================================================================================================
// ROUTE : /closed/:userId
// Méthode : GET
// Description : Cette route récupère tous les articles achetés par l'utilisateur **dont la vente est terminée**
//               (isDone: true)
// ==================================================================================================
router.get("/closed/:userId", (req, res) => {
   // Recherche des articles où :
  // - "acheteur" = l'utilisateur
  // - "isDone" = true (vente terminée)
  Articles.find({ acheteur: new ObjectId(req.params.userId), isDone: true })
   // On enrichit chaque article avec les infos liées à ses champs référencés
    .populate("categorie etat auteur editeur annonceur acheteur")
    .then((articles) => {
 // Réponse réussie avec les articles terminés
      res.json({ result: true, articles });
    })
    .catch(() => {
   // Réponse d'erreur en cas de souci avec la base de données    
      res.json({ result: false, error: "Erreur serveur." });
    });
});
//-------------------------------------------------------------------------------------------------------------------------------

module.exports = router;
