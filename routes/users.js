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

//-------------------------------------------------------------------------------------------------------------------------------
// Route POST appelée quand l'utilisateur clique sur "s'inscrire" pour créer un compte
router.post("/sign-up", (req, res) => {
  // on vérifie si l'utilisateur a bien un username de 6 caractères minimum
  if (req.body.username.length < 5) {
    return res.json({
      result: false,
      error: "Le nom d'utilisateur doit avoir au moins 5 caractères.",
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

  // On vérifie si le mot de passe contient au moins une majuscule

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
    return res.json({ result: true, token: token });
  });
});

//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route GET appelée quand l'utilisateur clique sur "se connecter" pour récupérer les informations d'un utilisateur
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
      res.json({ result: false, error: "Mot de passe ou email invalide" }); // Sinon on dit que la connexion a échoué
    }
  });
});
//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route POST appelée pour récupérer l'Id de l'utilisateur à partir du token
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

//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route POST appelée pour récupérer les informations de l'utilisateur à partir du token
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
//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route PUT appelée pour mettre à jour les informations de l'utilisateur
router.put("/updateInfo/:userId", async (req, res) => {
  let hash = "";
  try {
    //On construit un objet avec les données de la requête
    const { userId } = req.params;
    const { email, username, telephone, donneeBancaire, password } = req.body;

    // Validation de l'email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return res.json({ result: false, error: "Email invalide" });
    }

    // Vérifie si l'utilisateur existe avec le userId fourni
    const user = await User.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.json({ result: false, error: "Utilisateur introuvable" });
    }
    //Hello
    // Vérifie si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.json({ result: false, error: "E-mail déjà utilisé" });
      }
    }
    if (username.length < 5) {
      return res.json({
        result: false,
        error: "Le nom d'utilisateur doit avoir au moins 5 caractères.",
      });
    }
    if (password.length > 0) {
      // On verifie si le mot de passe contient au moin 8 CARACTERES
      if (password.length < 8)
        return res.json({
          result: false,
          error: "Le mot de passe doit avoir au moins 8 caractères.",
        });

      // On vérifie si le mot de passe contient au moins une minuscule
      if (!/[A-Z]/.test(password))
        return res.json({
          result: false,
          error: "Le mot de passe doit contenir au moins une majuscule.",
        });

      // On vérifie si le mot de passe contient au moins un chiffre
      if (!/\d/.test(password))
        return res.json({
          result: false,
          error: "Le mot de passe doit contenir au moins un chiffre.",
        });

      // On vérifie si le mot de passe contient au moins un caractère spécial
      if (!/[^a-zA-Z0-9]/.test(password))
        return res.json({
          result: false,
          error: "Le mot de passe doit contenir au moins un caractère spécial.",
        });
      hash = bcrypt.hashSync(password, 10);
    }

    if (donneeBancaire.length !== 16) {
      return res.json({ result: false, error: "Numéro de carte invalide" });
    }

    // Mise à jour des informations
    const updatedUser = await User.updateOne(
      { _id: new ObjectId(userId) },
      {
        email: email,
        username: username,
        password: hash || user.password,
        // On ne met pas à jour le mot de passe si le champ est vide
        telephone: telephone,
        donneeBancaire: donneeBancaire,
      }
    );
    //On verifie si la mise à jour a réussi
    if (updatedUser.modifiedCount > 0) {
      return res.json({ result: true, message: "Mise à jour réussie." });
    }
    //On verifie si l'utilisateur a modifié ses informations
    else {
      return res.json({
        result: false,
        error: "Aucune modification effectuée.",
      });
    }
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur: " + error.message });
  }
});
//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route PUT appelée pour mettre à jour la liste des articles favoris de l'utilisateur
router.put("/updateBookmark/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { articleId } = req.body;

    // Vérifie si l'utilisateur existe avec le userId fourni
    const user = await User.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.json({ result: false, error: "Utilisateur introuvable" });
    }

    // Vérifie si l'article est déjà dans les favoris
    // Si l'article est déjà dans les favoris, on l'enlève
    const isBookmarked = user.bookmark.includes(articleId);
    if (isBookmarked) {
      await User.updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { bookmark: articleId } }
      );
      return res.json({ result: true, message: "Article retiré des favoris." });
    }
    // Si l'article n'est pas déjà dans les favoris, on l'ajoute
    await User.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { bookmark: articleId } }
    );

    res.json({ result: true, message: "Article ajouté aux favoris." });
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur: " + error.message });
  }
});
//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route pour récupérer les articles favoris d'un utilisateur
router.get("/getBookmarks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Vérifie si l'utilisateur existe avec le userId fourni
    const user = await User.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.json({ result: false, error: "Utilisateur introuvable" });
    }

    // Récupère les articles favoris de l'utilisateur
    const bookmarks = user.bookmark;
    res.json({ result: true, bookmarks });
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur: " + error.message });
  }
});
//-------------------------------------------------------------------------------------------------------------------------------
// Route GET pour récupérer les données d'un utilisateur à partir de son ID
router.get("/getUserById/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Vérifie si l'utilisateur existe avec le userId fourni
    const user = await User.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.json({ result: false, error: "Utilisateur introuvable" });
    }
    // Récupère les données de l'utilisateur
    const userData = {
      email: user.email,
      username: user.username,
      donneeBancaire: user.donneeBancaire,
      telephone: user.telephone,
      bookmark: user.bookmark,
    };
    res.json({ result: true, userData });
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur: " + error.message });
  }
});
//-------------------------------------------------------------------------------------------------------------------------------

module.exports = router;
