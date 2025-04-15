// On importe express pour créer une route
var express = require("express");
// On crée un objet routeur express
var router = express.Router();
// On importe uid2 pour générer un token aléatoire et sécurisé
const uid2 = require("uid2");
// On importe bcrypt pour hasher et comparer les mots de passe
const bcrypt = require("bcrypt");
// On importe notre modèle d'utilisateur
const User = require("../models/users");



// Route POST pour s'inscrire
router.post("/sign-up", (req, res) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // On vérifie si l'email est valide

  if (!emailRegex.test(req.body.email)) {
    return res.json({ result: false, message: "Email invalide" });
  }

  User.findOne({ email: req.body.email }).then((data) => {
    if (data) {
      return res.json({ result: false, error: "Utilisateur déjà existant" });
    }
  });
  const hash = bcrypt.hashSync(req.body.password, 10);
  // token de 32 caractères aléatoire
  const token = uid2(32);

          // On crée le nouvel utilisateur
          const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            token: token,
          });

          // On enregistre le nouvel utilisateur dans la base de données
          newUser.save().then(() => {
            res.json({ result: true, token: token });
          });
        }
      });
    }
  });
});

// rout POST Quand l'utilisateur clique sur "se connecter", il envoie ses infos ici
router.post("/sign-in", (req, res) => {
  // Route POST appelée quand l'utilisateur se connecte
  User.findOne({ email: req.body.email }).then((data) => {
    console.log(data);
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      // Si l'utilisateur existe et que le mot de passe est correct (comparé au hash)
      console.log("true");
      res.json({ result: true });
    } else {
      // On vérifie si le nom d'utilisateur est déjà pris
      User.findOne({ username: req.body.username }).then((userWithUsername) => {
        if (userWithUsername) {
          res.json({ result: false, error: "Nom d'utilisateur déjà utilisé." });
        } else {
          // On hash le mot de passe
          const hash = bcrypt.hashSync(req.body.password, 10);
          // On génère un token unique
          const token = uid2(32);

          // On crée le nouvel utilisateur
          const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            token: token,
          });

          // On enregistre le nouvel utilisateur dans la base de données
          newUser.save().then(() => {
            res.json({ result: true, token: token });
          });
        }
      });
    }
  });
});

// Route POST pour se connecter
router.post("/sign-in", (req, res) => {
  // On cherche l'utilisateur avec l'email fourni
  User.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      // Si l'utilisateur existe et que le mot de passe est correct
      res.json({ result: true, token: data.token });
    } else {
      // Sinon on envoie une erreur
      res.json({ result: false, error: "Email ou mot de passe incorrect." });
    }
  });
});

module.exports = router;
