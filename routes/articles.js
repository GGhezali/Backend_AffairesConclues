var express = require("express"); // On importe express pour créer une route
var router = express.Router(); // On crée un objet routeur express

// On importe toutes les BDD pour les utiliser ensuite
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

// Route pour récupérer les articles
router.get("/", (req, res) => {
  Article.find()
    .populate("categorie etat auteur editeur annonceur acheteur")
    .then((data) => {
      data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
      res.json({ success: true, data });
    });
});

// Route pour updater la propriété isDone d'un article pour lequel la vente est terminée
router.post("/updateIsDone", (req, res) => {
  const id = req.body.id;

  Article.updateOne({ _id: id }, { isDone: true }).then(() => {
    Article.findOne({ _id: id }).then((data) => res.json({ data }));
  });
});

// Route pour publier un nouvel article
router.post("/publish", async (req, res) => {
  const foundCategory = await Categorie.findOne({ name: req.body.categorie });
  const foundEtat = await Etat.findOne({ condition: req.body.etat });
  const foundAuteur = await Auteur.findOne({ name: req.body.auteur });
  const foundEditeur = await Editeur.findOne({ name: req.body.editeur });
  const foundAnonceur = await User.findOne({ username: req.body.annonceur });
  const foundAcheteur = await User.findOne({ username: req.body.acheteur });

  if (
    foundCategory &&
    foundEtat &&
    foundAuteur &&
    foundEditeur &&
    foundAnonceur &&
    foundAcheteur
  ) {
    const newArticle = new Article({
      titre: req.body.titre,
      categorie: new ObjectId(foundCategory._id),
      etat: new ObjectId(foundEtat._id),
      description: req.body.description,
      auteur: new ObjectId(foundAuteur._id),
      editeur: new ObjectId(foundEditeur._id),
      startPrice: req.body.price,
      currentPrice: req.body.price,
      localisation: {
        adresse: req.body.localisation.title,
        longitude: req.body.localisation.coordinates[0],
        latitude: req.body.localisation.coordinates[1],
      },
      photoUrl: req.body.photoUrl,
      annonceur: new ObjectId(foundAnonceur._id),
      acheteur: new ObjectId(foundAcheteur._id),
      timer: new Date(),
      isDone: false,
    });

    newArticle.save().then((data) => {
      res.json({ result: true, data });
    });
  } else {
    res.json({ result: false, message: "Missing fields" });
  }
});

// Route pour récupérer un article en fonction de sa catégorie ou de son tri
router.post("/searchByCategorie", (req, res) => {
  try {
    const { categorie, tri } = req.body;

    if (categorie !== "--All Categories--" && !tri) {
      Categorie.findOne({ name: categorie }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            res.json({ success: true, data });
          });
      });
    } else if (categorie !== "--All Categories--" && tri === "Le plus récent") {
      Categorie.findOne({ name: categorie }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (categorie !== "--All Categories--" && tri === "Prix croissant") {
      Categorie.findOne({ name: categorie }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.currentPrice - b.currentPrice);
            res.json({ success: true, data });
          });
      });
    } else if (categorie === "--All Categories--" && !tri) {
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          res.json({ success: true, data });
        });
    } else if (categorie === "--All Categories--" && tri === "Le plus récent") {
      Categorie.findOne({ name: categorie }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (categorie === "--All Categories--" && tri === "Prix croissant") {
      Categorie.findOne({ name: categorie }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.currentPrice - b.currentPrice);
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

// Route pour rechercher un article en fonction de son tri ou de sa catégorie
router.post("/searchByTri", (req, res) => {
  try {
    const { categorie, tri } = req.body;

    if (!categorie && tri === "Le plus récent") {
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
          res.json({ success: true, data });
        });
    } else if (!categorie && tri === "Prix croissant") {
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          data.sort((a, b) => a.currentPrice - b.currentPrice);
          res.json({ success: true, data });
        });
    } else if (categorie !== "--All Categories--" && tri === "Le plus récent") {
      Categorie.findOne({ name: categorie }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (categorie !== "--All Categories--" && tri === "Prix croissant") {
      Categorie.findOne({ name: categorie }).then((data) => {
        Article.find({ categorie: data._id })
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.currentPrice - b.currentPrice);
            res.json({ success: true, data });
          });
      });
    } else if (categorie === "--All Categories--" && tri === "Le plus récent") {
      Categorie.findOne({ name: categorie }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => b.timer.getTime() - a.timer.getTime());
            res.json({ success: true, data });
          });
      });
    } else if (categorie === "--All Categories--" && tri === "Prix croissant") {
      Categorie.findOne({ name: categorie }).then(() => {
        Article.find()
          .populate("categorie etat auteur editeur annonceur acheteur")
          .then((data) => {
            data.sort((a, b) => a.currentPrice - b.currentPrice);
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

// Route pour uploader une photo sur Cloudinary
router.post("/uploadPhoto", async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath);
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }
});

// Route pour modifier le prix actuel d'un article
router.put("/updateCurrentPrice", (req, res) => {
  try {
    const id = req.body.id;
    const newPrice = Number(req.body.newPrice);
    const newBuyer = req.body.newBuyer || null;

    User.findOne({ _id: newBuyer }).then((data) => {
      if (!data || newBuyer === null) {
        return res.status(400).json({ message: "Acheteur introuvable" });
      }

      Article.findOne({ _id: id }).then((data) => {
        if (!newPrice) {
          return res.status(400).json({ message: "Veuillez entrer un prix" });
        }
        if (data.currentPrice >= newPrice) {
          return res.status(400).json({
            message: "Le prix actuel doit être supérieur au nouveau prix",
          });
        } else {
          Article.updateOne(
            { _id: id },
            { currentPrice: newPrice, $push: { acheteur: newBuyer } }
          ).then(() => {
            Article.findOne({ _id: id }).then((data) => res.json({ data }));
          });
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du prix" });
  }
});

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

module.exports = router;
