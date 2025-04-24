var express = require("express");
var router = express.Router();
const Article = require("../models/articles");
const Auteur = require("../models/auteurs");
const Editeur = require("../models/editeurs");
const Categorie = require("../models/categories");
const Etat = require("../models/etats");
const User = require("../models/users");
const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");
const { ObjectId } = require("mongodb");

//-------------------------------------------------------------------------------------------------------------------------------
// Route GET pour récupérer tous les articles
router.get("/", (req, res) => {
  // On utilise la méthode find() pour récupérer tous les articles dans la base de données
  // On utilise populate() pour récupérer également les informations liées aux catégories, états, auteurs, éditeurs, annonceurs, et acheteurs
  Article.find()
    .populate("categorie etat auteur editeur annonceur acheteur")
    .then((data) => {
      // Une fois les données récupérées, on les renvoie en réponse au client sous forme de JSON
      res.json({ success: true, data });
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

// Route POST pour mettre à jour la propriété isDone d'un article pour lequel la vente est terminée
router.post("/updateIsDone", (req, res) => {
  // On récupère l'id de l'article depuis le corps de la requête
  const id = req.body.id;

  // On met à jour l'article avec cet id, en définissant la propriété isDone à true pour indiquer que la vente est terminée
  Article.updateOne({ _id: id }, { isDone: true }).then(() => {
    // On récupère l'article mis à jour pour le renvoyer dans la réponse
    Article.findOne({ _id: id }).then((data) => res.json({ data }));
  });
});

//-------------------------------------------------------------------------------------------------------------------------------

// Route POST pour publier un nouvel article
router.post("/publish", async (req, res) => {
  // On cherche la catégorie, l'état, l'auteur, et l'éditeur correspondant aux données envoyées
  const foundCategory = await Categorie.findOne({ name: req.body.categorie });
  const foundEtat = await Etat.findOne({ condition: req.body.etat });
  const foundAuteur = await Auteur.findOne({ name: req.body.auteur });
  const foundEditeur = await Editeur.findOne({ name: req.body.editeur });

  // On vérifie que toutes les données nécessaires sont présentes
  if (
    foundCategory &&
    foundEtat &&
    foundAuteur &&
    foundEditeur &&
    req.body.titre &&
    req.body.description &&
    req.body.prix &&
    req.body.localisation &&
    req.body.photoUrl.length > 0 &&
    req.body.annonceur
  ) {
    // Si toutes les conditions sont remplies, on crée un nouvel article
    const newArticle = new Article({
      titre: req.body.titre,
      categorie: foundCategory._id,
      etat: foundEtat._id,
      description: req.body.description,
      auteur: foundAuteur._id,
      editeur: foundEditeur._id,
      startPrice: req.body.prix,
      currentPrice: req.body.prix,
      localisation: {
        adresse: req.body.localisation.title,
        longitude: req.body.localisation.coordinates[0],
        latitude: req.body.localisation.coordinates[1],
      },
      photoUrl: req.body.photoUrl,
      annonceur: req.body.annonceur,
      timer: new Date(), // On initialise le timer à la date actuelle
      isDone: false, // L'article est initialement non terminé
    });

    // On sauvegarde le nouvel article dans la base de données et on renvoie la réponse
    const data = await newArticle.save();
    res.json({ result: true, data });
  } else {
    // Si des données sont manquantes, on renvoie une erreur
    res.json({
      result: false,
      error: "Vous devez prendre une photo et remplir tous les champs de saisie",
    });
  }
});

//-------------------------------------------------------------------------------------------------------------------------------

// Route POST pour récupérer les articles en fonction de leur catégorie et/ou de leur paramètre de tri
router.post("/searchByCategory", (req, res) => {
  try {
    // On récupère la catégorie et le critère de tri depuis le corps de la requête
    const { category, sort } = req.body;

    // On vérifie si une catégorie est sélectionnée et s'il y a un critère de tri
    if (category !== "--All Categories--" && !sort) {
      // Si la catégorie est sélectionnée mais aucun tri n'est spécifié
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            res.json({ success: true, data });
          });
      });
    } else if (category !== "--All Categories--" && sort === "Le plus récent") {
      // Si la catégorie est sélectionnée et le tri est par "Le plus récent"
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            // On trie les articles par la date de création la plus récente
            data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (category !== "--All Categories--" && sort === "Le plus ancien") {
      // Si la catégorie est sélectionnée et le tri est par "Le plus ancien"
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            // On trie les articles par la date de création la plus ancienne
            data.sort((a, b) => a.timer.getTime() - b.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (category !== "--All Categories--" && sort === "Prix croissant") {
      // Si la catégorie est sélectionnée et le tri est par "Prix croissant"
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            // On trie les articles par prix croissant
            data.sort((a, b) => a.currentPrice - b.currentPrice);
            res.json({ success: true, data });
          });
      });
    } else if (category !== "--All Categories--" && sort === "Prix décroissant") {
      // Si la catégorie est sélectionnée et le tri est par "Prix décroissant"
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            // On trie les articles par prix décroissant
            data.sort((a, b) => b.currentPrice - a.currentPrice);
            res.json({ success: true, data });
          });
      });
    } else if (category === "--All Categories--" && !sort) {
      // Si aucune catégorie n'est sélectionnée et qu'il n'y a pas de critère de tri
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          res.json({ success: true, data });
        });
    } else if (category === "--All Categories--" && sort === "Le plus récent") {
      // Si aucune catégorie n'est sélectionnée et que le tri est par "Le plus récent"
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          // On trie les articles par la date la plus récente
          data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
          res.json({ success: true, data });
        });
    }
    // Le reste des conditions gère les autres critères de tri similaires
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la recherche" });
  }
});

//-------------------------------------------------------------------------------------------------------------------------------

// Route pour rechercher les articles selon leur titre ou auteur
router.post("/search", async (req, res) => {
  const { title, author, category } = req.body;
  try {
    const filter = {};
    // Si une catégorie est spécifiée, on l'ajoute au filtre
    if (category && category !== "--All Categories--") {
      const foundCategory = await Categorie.findOne({ name: category });
      if (foundCategory) {
        filter.categorie = foundCategory._id;
      }
    }

    // Récupérer tous les articles correspondant au filtre
    const articles = await Article.find(filter).populate(
      "categorie etat auteur editeur annonceur acheteur"
    );

    // Filtrer les articles par titre et auteur si des critères sont fournis
    const filteredArticles = articles.filter((article) => {
      const matchesTitle = title
        ? article.titre.toLowerCase().includes(title.toLowerCase())
        : true;
      const matchesAuthor = author
        ? article.auteur &&
          article.auteur.name.toLowerCase().includes(author.toLowerCase())
        : true;
      return matchesTitle || matchesAuthor;
    });

    res.json({ success: true, data: filteredArticles });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la recherche" });
  }
});

//-------------------------------------------------------------------------------------------------------------------------------

// Route pour télécharger une photo sur Cloudinary
router.post("/uploadPhoto", async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`; // On crée un chemin temporaire pour la photo
  const resultMove = await req.files.photoFromFront.mv(photoPath); // On déplace la photo dans ce chemin

  if (!resultMove) {
    // Si le déplacement de la photo s'est bien passé, on l'envoie sur Cloudinary
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath); // On supprime la photo temporaire après l'upload

    // On renvoie l'URL de la photo stockée sur Cloudinary
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    // Si un problème est survenu lors du déplacement de la photo, on renvoie une erreur
    res.json({ result: false, error: resultMove });
  }
});

//-------------------------------------------------------------------------------------------------------------------------------

// Route pour modifier le prix actuel d'un article
router.put("/updateCurrentPrice", (req, res) => {
  try {
    const id = req.body.id; // L'id de l'article à mettre à jour
    const newPrice = Number(req.body.newPrice); // Le nouveau prix de l'article
    const newBuyer = req.body.newBuyer || null; // L'acheteur de l'article

    // On vérifie si l'acheteur existe
    User.findOne({ _id: newBuyer }).then((data) => {
      // Si l'acheteur est trouvé, on continue avec la mise à jour du prix
      Article.findOne({ _id: id }).then((data) => {
        if (!newPrice) {
          return res.status(400).json({ message: "Veuillez entrer un prix" });
        }
        if (data.currentPrice + 0.49 >= newPrice) {
          return res.status(400).json({
            message: "Le prix actuel doit respecter la mise minimale",
          });
        } else {
          // On met à jour le prix de l'article et on ajoute l'acheteur dans la liste des acheteurs
          Article.updateOne(
            { _id: id },
            { currentPrice: newPrice, $push: { acheteur: newBuyer } }
          ).then(() => {
            // On renvoie l'article mis à jour
            Article.findOne({ _id: id }).then((data) =>
              res.json({ data, message: "Prix mis à jour avec succès" })
            );
          });
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du prix" });
  }
});

//-------------------------------------------------------------------------------------------------------------------------------

// Route pour récupérer les articles d'un utilisateur
router.get("/mes-publications/:userId", (req, res) => {
  const userId = req.params.userId; // L'ID de l'utilisateur dans l'URL

  // On récupère les articles de cet utilisateur qui ne sont pas encore terminés
  Article.find({ annonceur: userId, isDone: false })
    .populate("categorie etat auteur editeur annonceur acheteur") // On peupler les informations associées à l'article
    .then((articles) => {
      res.json({ success: true, data: articles });
    })
    .catch((error) => {
      console.error("Erreur dans /mes-publications :", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

// Route GET pour récupérer les articles d'un vendeur avec un ID spécifique
router.get("/findVendorArticles/:userId", (req, res) => {
  // On cherche les articles correspondant à l'ID du vendeur
  Article.find({ annonceur: new ObjectId(req.params.userId) })
    .populate("categorie etat auteur editeur annonceur acheteur")
    .then((articles) => {
      res.json({ result: true, articles });
    })
    .catch(() => {
      res.json({ result: false, error: "Erreur serveur." });
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

// Route pour récupérer un article en fonction de son ID
router.get("/findArticleById/:id", (req, res) => {
  const id = req.params.id; // L'ID de l'article à rechercher
  Article.findOne({ _id: new ObjectId(id) })
    .populate("categorie etat auteur editeur annonceur acheteur")
    .then((data) => {
      res.json({ result: true, data });
    })
    .catch(() => {
      res.json({ result: false, error: "Erreur serveur." });
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

// Route pour supprimer un article en fonction de son ID
router.delete("/deleteArticle/:id", (req, res) => {
  const id = req.params.id; // L'ID de l'article à supprimer
  Article.deleteOne({ _id: new ObjectId(id) }) // On supprime l'article de la base de données
    .then(() => {
      res.json({ result: true });
    })
    .catch(() => {
      res.json({ result: false, error: "Erreur serveur." });
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

module.exports = router;
