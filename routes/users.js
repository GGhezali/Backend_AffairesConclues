var express = require("express"); // On importe express pour créer une route
var router = express.Router(); // On crée un objet routeur express
const uid2 = require("uid2"); // On importe uid2 pour créer un token aléatoire
const bcrypt = require("bcrypt"); // On importe bcrypt pour sécuriser le mot de passe
const User = require("../models/users"); // On importe notre modèle d'utilisateur

router.post("/sign-up", (req, res) => {
  const hash = bcrypt.hashSync("password", 10);
});
const token = uid2(32); // On génère un token de 32 caractères aléatoire

const newUser = new User({
  username: req.body.username, // On récupère le nom d'utilisateur depuis le formulaire
  email: req.body.email,
  password: hash, // On stocke le mot de passe haché
  token: uid2(32), //on stocke le token
});

newUser.save().then(() => {
  // On sauvegarde le nouvel utilisateur dans la base de données
  // On sauvegarde le nouvel utilisateur dans la base de données
  res.json({ result: true, token: token }); // On renvoie un succès et le token au frontend
});

router.post("/sign-in", (req, res) => {
  // Route POST appelée quand l'utilisateur se connecte
  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      // Si l'utilisateur existe et que le mot de passe est correct (comparé au hash)
      res.json({ result: true });
    } else {
      res.json({ result: false }); // Sinon on dit que la connexion a échoué
    }
  });
});

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
