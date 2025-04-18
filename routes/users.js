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
const { ObjectId } = require("mongodb");

router.post("/sign-up", (req, res) => {
  // on vérifie si l'utilisateur a bien un username de 6 caractères minimum
  if (req.body.username.length < 6) {
    return res.json({
      result: false,
      error: "Le nom d'utilisateur doit avoir au moins 6 caractères.",
    });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
  // On vérifie si l'email est valide
  if (!emailRegex.test(req.body.email)) {
    return res.json({ result: false, error: "Email invalide" });
  }

  // On verifie si le mot de passe contient au moin 8 CARACTERES
  if (req.body.password.length < 8)
    return res.json({
      result: false,
      error: "Le mot de passe doit avoir au moins 8 caractères.",
    });

  // On vérifie si le mot de passe contient au moins une minuscule
  if (!/[A-Z]/.test(req.body.password))
    return res.json({
      result: false,
      error: "Le mot de passe doit contenir au moins une majuscule.",
    });

  // On vérifie si le mot de passe contient au moins un chiffre
  if (!/\d/.test(req.body.password))
    return res.json({
      result: false,
      error: "Le mot de passe doit contenir au moins un chiffre.",
    });

  // On vérifie si le mot de passe contient au moins un caractère spécial
  if (!/[^a-zA-Z0-9]/.test(req.body.password))
    return res.json({
      result: false,
      error: "Le mot de passe doit contenir au moins un caractère spécial.",
    });

  User.findOne({ email: req.body.email }).then((data) => {
    if (data) {
      return res.json({ result: false, error: "Utilisateur déjà existant" });
    }
  });
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

    donneeBancaire: null,

    telephone: null,

    bookmark: [],
  });
  // On sauvegarde le nouvel utilisateur dans la base de données
  newUser.save().then(() => {
    // On renvoie une validation et le token au frontend
    res.json({ result: true, token: token });
  });
});

// rout POST Quand l'utilisateur clique sur "se connecter", il envoie ses infos ici
router.post("/sign-in", (req, res) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // On vérifie si l'email est valide

  if (!emailRegex.test(req.body.email)) {
    return res.json({ result: false, error: "Email invalide" });
  }

  // Route POST appelée quand l'utilisateur se connecte
  User.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      // Si l'utilisateur existe et que le mot de passe est correct (comparé au hash)
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false }); // Sinon on dit que la connexion a échoué
    }
  });
});

router.post("/findUserIdByToken", (req, res) => {
  const { token } = req.body;
  User.findOne({ token: token })
    .then((data) => {
      res.json({ result: true, userId: data._id });
    })
    .catch(() => {
      res.json({ result: false, error: "Erreur serveur." });
    });
});

router.post("/findUserByToken", (req, res) => {
  const { token } = req.body;
  User.findOne({ token: token })
    .then((data) => {
      res.json({ result: true, data });
    })
    .catch(() => {
      res.json({ result: false, error: "Erreur serveur." });
    });
});

router.post("/updateInfo/:userId", (req, res) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;

  // On vérifie si l'email est valide
  if (!emailRegex.test(req.body.email)) {
    return res.json({ result: false, error: "Email invalide" });
  }

  // On verifie si le mot de passe contient au moin 8 CARACTERES
  if (req.body.password.length < 8)
    return res.json({
      result: false,
      error: "Le mot de passe doit avoir au moins 8 caractères.",
    });

  // On vérifie si le mot de passe contient au moins une minuscule
  if (!/[A-Z]/.test(req.body.password))
    return res.json({
      result: false,
      error: "Le mot de passe doit contenir au moins une majuscule.",
    });

  // On vérifie si le mot de passe contient au moins un chiffre
 // if (!/\d/.test(req.body.password))
   // return res.json({
     // result: false,
      //error: "Le mot de passe doit contenir au moins un chiffre.",
    //});

  // On vérifie si le mot de passe contient au moins un caractère spécial
  if (!/[^a-zA-Z0-9]/.test(req.body.password))
    return res.json({
      result: false,
      error: "Le mot de passe doit contenir au moins un caractère spécial.",
    });

  if (req.body.username.length < 5) {
    return res.json({
      result: false,
      error: "Le nom d'utilisateur doit avoir au moins 6 caractères.",
    });
  }

  // Vérifie si le nouvel email existe déjà
  User.find().then((users) => {
    console.log("users =>", users);
    for (let user of users) {
      // Vérifie si l'email existe déjà
      if (user._id !== req.params.userId && user.email === req.body.email) {
        return res.json({ result: false, error: "E-mail déjà existant" });
      } else {
        User.updateOne(
          { _id: new ObjectId(req.params.userId) }, // on cherche avec l'ancien email
          {
            email: req.body.email,
            username: req.body.username,
            telephone: req.body.telephone,
            donneeBancaire: req.body.donneeBancaire,
            // password: req.body.password, // on ne met pas à jour le mot de passe ici
          }
        )
          .then(() => {
            console.log("Mise à jour réussie");
            res.json({ result: true, message: "Mise à jour réussie." });
          })
          .catch((error) => {
            console.error("Erreur lors de la mise à jour", error);
            res.json({
              result: false,
              error: "Erreur lors de la mise à jour.",
            });
          });
      }
    }

  });
});
// Vérifie si la mise à jour a réussi

module.exports = router;
