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
  Article.find()
    .populate("categorie etat auteur editeur annonceur acheteur")
    .then((data) => {
      res.json({ success: true, data });
    });
});
//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route POST pour mettre à jour la propriété isDone d'un article pour lequel la vente est terminée
router.post("/updateIsDone", (req, res) => {
  const id = req.body.id;

  Article.updateOne({ _id: id }, { isDone: true }).then(() => {
    Article.findOne({ _id: id }).then((data) => res.json({ data }));
  });
});
//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route POST pour publier un nouvel article
router.post("/publish", async (req, res) => {
  const foundCategory = await Categorie.findOne({ name: req.body.categorie });
  const foundEtat = await Etat.findOne({ condition: req.body.etat });
  const foundAuteur = await Auteur.findOne({ name: req.body.auteur });
  const foundEditeur = await Editeur.findOne({ name: req.body.editeur });

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
    //On construit le nouvel article en fonction des champs remplis par l'utilisateur
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
      isDone: false,
    });

    const data = await newArticle.save();
    res.json({ result: true, data });
  } else {
    res.json({
      result: false,
      error:
        "Vous devez prendre une photo et remplir tous les champs de saisie",
    });
  }
});
//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route POST pour récupérer les articleq en fonction de leur catégorie et/ou de son paramètre de tri
router.post("/searchByCategory", (req, res) => {
  try {
    const { category, sort } = req.body;

    if (category !== "--All Categories--" && !sort) {
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            res.json({ success: true, data });
          });
      });
    } else if (category !== "--All Categories--" && sort === "Le plus récent") {
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (category !== "--All Categories--" && sort === "Le plus ancien") {
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.timer.getTime() - b.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (category !== "--All Categories--" && sort === "Prix croissant") {
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.currentPrice - b.currentPrice);
            res.json({ success: true, data });
          });
      });
    } else if (
      category !== "--All Categories--" &&
      sort === "Prix décroissant"
    ) {
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.currentPrice - a.currentPrice);
            res.json({ success: true, data });
          });
      });
    } else if (category === "--All Categories--" && !sort) {
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          res.json({ success: true, data });
        });
    } else if (category === "--All Categories--" && sort === "Le plus récent") {
      Categorie.findOne({ name: category }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (category === "--All Categories--" && sort === "Le plus ancien") {
      Categorie.findOne({ name: category }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.timer.getTime() - b.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (category === "--All Categories--" && sort === "Prix croissant") {
      Categorie.findOne({ name: category }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.currentPrice - b.currentPrice);
            res.json({ success: true, data });
          });
      });
    } else if (
      category === "--All Categories--" &&
      sort === "Prix décroissant"
    ) {
      Categorie.findOne({ name: category }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.currentPrice - a.currentPrice);
            res.json({ success: true, data });
          });
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la recherche" });
  }
});
//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route POST pour rechercher les articles en fonction de leur paramètre de tri et/ou de leur catégorie
router.post("/searchBySort", (req, res) => {
  try {
    const { category, sort } = req.body;

    if (!category && sort === "Le plus récent") {
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
          res.json({ success: true, data });
        });
    } else if (!category && sort === "Le plus ancien") {
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          data.sort((a, b) => a.timer.getTime() - b.timer.getTime());
          res.json({ success: true, data });
        });
    } else if (!category && sort === "Prix croissant") {
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          data.sort((a, b) => a.currentPrice - b.currentPrice);
          res.json({ success: true, data });
        });
    } else if (!category && sort === "Prix décroissant") {
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          data.sort((a, b) => b.currentPrice - a.currentPrice);
          res.json({ success: true, data });
        });
    } else if (category !== "--All Categories--" && sort === "Le plus récent") {
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (category !== "--All Categories--" && sort === "Le plus ancien") {
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.timer.getTime() - b.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (category !== "--All Categories--" && sort === "Prix croissant") {
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.currentPrice - b.currentPrice);
            res.json({ success: true, data });
          });
      });
    } else if (
      category !== "--All Categories--" &&
      sort === "Prix décroissant"
    ) {
      Categorie.findOne({ name: category }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.currentPrice - a.currentPrice);
            res.json({ success: true, data });
          });
      });
    } else if (category === "--All Categories--" && sort === "Le plus récent") {
      Categorie.findOne({ name: category }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (category === "--All Categories--" && sort === "Le plus ancien") {
      Categorie.findOne({ name: category }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.timer.getTime() - b.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (category === "--All Categories--" && sort === "Prix croissant") {
      Categorie.findOne({ name: category }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.currentPrice - b.currentPrice);
            res.json({ success: true, data });
          });
      });
    } else if (
      category === "--All Categories--" &&
      sort === "Prix décroissant"
    ) {
      Categorie.findOne({ name: category }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.currentPrice - a.currentPrice);
            res.json({ success: true, data });
          });
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la recherche" });
  }
});
//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route pour rechercher les articles selon leur titre ou auteur
router.post("/search", async (req, res) => {
  const { title, author, category } = req.body;
  try {
    const filter = {};
    if (category && category !== "--All Categories--") {
      const foundCategory = await Categorie.findOne({ name: category });
      if (foundCategory) {
        filter.categorie = foundCategory._id;
      }
    }
    // Récupérer tous les articles avec les champs peuplés
    const articles = await Article.find(filter).populate(
      "categorie etat auteur editeur annonceur acheteur"
    );

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

//-------------------------------------------------------------------------------------------------------------------------------
// Route POST pour télécharger une photo sur Cloudinary
router.post("/uploadPhoto", async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath);
    console.log(resultCloudinary.secure_url);

    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }
});
//-----------------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route pour modifier le prix actuel d'un article
router.put("/updateCurrentPrice", (req, res) => {
  try {
    const id = req.body.id;
    const newPrice = Number(req.body.newPrice);
    const newBuyer = req.body.newBuyer || null;

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
          Article.updateOne(
            { _id: id },
            { currentPrice: newPrice, $push: { acheteur: newBuyer } }
          ).then(() => {
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

//-------------------------------------------------------------------------------------------------------------------------------
// Route pour récupérer les articles d'un utilisateur
router.get("/mes-publications/:userId", (req, res) => {
  // On récupère l'id de l'utilisateur dans l'url
  const userId = req.params.userId;

  Article.find({ annonceur: userId, isDone: false }) // On cherche les articles de l'utilisateur qui ne sont pas terminés

    .populate("categorie etat auteur editeur annonceur acheteur") // On populate les champs pour avoir les données complètes
    .then((articles) => {
      res.json({ success: true, data: articles });
    })
    .catch((error) => {
      console.error("Erreur dans /mes-publications :", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    });
});
//-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// Route GET pour récupérer les articles d'un vendeur avec un ID spécifique
router.get("/findVendorArticles/:userId", (req, res) => {
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

//-------------------------------------------------------------------------------------------------------------------------------
//Route pour récupérer un article en fonction de son ID
router.get("/findArticleById/:id", (req, res) => {
  const id = req.params.id;
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

//-------------------------------------------------------------------------------------------------------------------------------
//Route pour supprimer un article en fonction de son ID
router.delete("/deleteArticle/:id", (req, res) => {
  const id = req.params.id;
  Article.deleteOne({ _id: new ObjectId(id) })
    .then(() => {
      res.json({ result: true });
    })
    .catch(() => {
      res.json({ result: false, error: "Erreur serveur." });
    });
});
//-------------------------------------------------------------------------------------------------------------------------------

module.exports = router;
