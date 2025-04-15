// On importe express pour créer une route
var express = require("express");
// On crée un objet routeur express
var router = express.Router();
// On importe uid2 pour generer un token aléatoire et securisé pour verifier l'identité de l'utilisateur lors de navigation
const uid2 = require("uid2");
// On importe bcrypt pour sécuriser/hasher le mot de passe et le verifier, lors de conexion, mdp sera comparer avec celui enregistrer avvec methode compareSync
const bcrypt = require("bcrypt");
// On importe notre modèle/schema d'utilisateur
const User = require("../models/users");

router.post("/sign-up", (req, res) => {
  
  const hash = bcrypt.hashSync(req.body.password, 10);
  // token de 32 caractères aléatoire
  const token = uid2(32);

  const newUser = new User({
    // On récupère le nom d'utilisateur depuis le formulaire
    username: req.body.username,
    email: req.body.email,
    // On enregistre le mot de passe haché
    password: hash,
    //on enregistre le token
    token: uid2(32),
  });
  // On sauvegarde le nouvel utilisateur dans la base de données
  newUser.save().then(() => {
    // On renvoie une validation et le token au frontend
    res.json({ result: true, token: token });
  });
});

// rout POST Quand l'utilisateur clique sur "se connecter", il envoie ses infos ici
router.post("/sign-in", (req, res) => {
  // Route POST appelée quand l'utilisateur se connecte
  User.findOne({ email: req.body.email}).then((data) => {
    console.log(data)
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      // Si l'utilisateur existe et que le mot de passe est correct (comparé au hash)
      console.log('true')
      res.json({ result: true });
    } else {
      res.json({ result: false }); // Sinon on dit que la connexion a échoué
      console.log('false')
    }
  });
});



module.exports = router;
