var express = require("express"); // On importe express pour créer une route
var router = express.Router(); // On crée un objet routeur express

//On importe toutes les BDD pour les utiliser ensuite
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

//Route pour récupérer les articles--------------------------------------------------------------------------------------------------------
router.get("/", (req, res) => {
  Article.find()
    //Populate sur les champs clé étrangères pour récupérer l'info textuelle et non l'id
    .populate("categorie etat auteur editeur annonceur acheteur")
    .then((data) => {
      data.sort((a, b) => b.timer.getTime() - a.timer.getTime()); // On trie les articles du plus récent au plus ancien
      res.json({ success: true, data });
    });
});
//-----------------------------------------------------------------------------------------------------------------------------------------

// Route pour updater la propriété isDone d'un article pour lequel la vente est terminées--------------------------------------------------
router.post("/updateIsDone", (req, res) => {
  const id = req.body.id;

  Article.updateOne({ _id: id }, { isDone: true }).then(() => {
    Article.findOne({ _id: id }).then((data) => res.json({ data }));
  });
});
//-----------------------------------------------------------------------------------------------------------------------------------------

//Route pour publier un nouvel article-----------------------------------------------------------------------------------------------------
router.post("/publish", async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.files", req.files);
  console.log("In the publish route");
  //On "fetch" dans les BDD préremplies pour récupérer les id des champs
  const foundCategory = await Categorie.findOne({ name: req.body.categorie });
  const foundEtat = await Etat.findOne({ condition: req.body.etat });
  const foundAuteur = await Auteur.findOne({ name: req.body.auteur });
  const foundEditeur = await Editeur.findOne({ name: req.body.editeur });
  const foundAnonceur = await User.findOne({ _id : req.body.annonceur });

  console.log("Category", foundCategory);
  console.log("Etat", foundEtat);
  console.log("Auteur", foundAuteur);
  console.log("Editeur", foundEditeur);
  console.log("Annonceur", foundAnonceur);
  if (
    foundCategory &&
    foundEtat &&
    foundAuteur &&
    foundEditeur &&
    foundAnonceur
  ) {
    console.log("about to create a new document");
    //On construit le nouvel article en fonction des champs remplis par l'utilisateur
    const newArticle = new Article({
      titre: req.body.titre,
      categorie: foundCategory._id,
      etat: foundEtat._id,
      description: req.body.description,
      auteur: foundAuteur._id,
      editeur: foundEditeur._id,
      startPrice: req.body.price,
      currentPrice: req.body.price,
      localisation: {
        adresse: req.body.localisation.title,
        longitude: req.body.localisation.coordinates[0],
        latitude: req.body.localisation.coordinates[1],
      },
      photoUrl: req.body.photoUrl,
      annonceur: foundAnonceur._id,
      timer: new Date(), // On initialise le timer à la date actuelle
      isDone: false,
    });
    console.log("new article created");
    // On sauvegarde l'article' dans la base de données
    newArticle.save().then((data) => {
      // On renvoie un succès et on affiche l'article poster dans le backend
      console.log("data ? =>", data);
      res.json({ result: true, data });
    });
    //Si tout n'est pas rempli, on renvoie un message d'erreur
  } else {
    res.json({ result: false, message: "Missing fields" });
  }
});
//-----------------------------------------------------------------------------------------------------------------------------------------

//Route pour récupérer un article en fonction de sa catégorie ou de son tri---------------------------------------------------------------
router.post("/searchByCategorie", (req, res) => {
  try {
    const { categorie, tri } = req.body; // On récupère la catégorie envoyée par le frontend

    if (categorie !== "--All Categories--" && !tri) {
      // Si la catégorie est définie et qu'il n'y a pas de tri
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then((data) => {
          Article.find({ categorie: data._id }) // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              res.json({ success: true, data }); // On renvoie les articles trouvés
            });
        });
    } else if (categorie !== "--All Categories--" && tri === "Le plus récent") {
      // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then((data) => {
          Article.find({ categorie: data._id }) // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              data.sort((a, b) => b.timer.getTime() - a.timer.getTime()); // On trie les articles par date de création
              res.json({ success: true, data }); // On renvoie les articles trouvés
            });
        });
    } else if (categorie !== "--All Categories--" && tri === "Prix croissant") {
      // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then((data) => {
          Article.find({ categorie: data._id }) // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              data.sort((a, b) => a.currentPrice - b.currentPrice); // On trie les articles par prix croissant
              res.json({ success: true, data }); // On renvoie les articles trouvés
            });
        });
    } else if (categorie === "--All Categories--" && !tri) {
      Article.find() // On cherche les articles qui correspondent à la catégorie
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          res.json({ success: true, data }); // On renvoie les articles trouvés
        });
    } else if (categorie === "--All Categories--" && tri === "Le plus récent") {
      // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then(() => {
          Article.find() // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              data.sort((a, b) => b.timer.getTime() - a.timer.getTime()); // On trie les articles par date de création
              res.json({ success: true, data }); // On renvoie les articles trouvés
            });
        });
    } else if (categorie === "--All Categories--" && tri === "Prix croissant") {
      // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then(() => {
          Article.find() // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              data.sort((a, b) => a.currentPrice - b.currentPrice); // On trie les articles par prix croissant
              res.json({ success: true, data }); // On renvoie les articles trouvés
            });
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la recherche" }); // En cas d'erreur, on renvoie un message d'erreur
  }
});
//-----------------------------------------------------------------------------------------------------------------------------------------

//Route pour rechercher un article en fonction de son tri ou de sa catégorie---------------------------------------------------------------
router.post("/searchByTri", (req, res) => {
  try {
    const { categorie, tri } = req.body; // On récupère la catégorie envoyée par le frontend

    if (!categorie && tri === "Le plus récent") {
      // Si la catégorie est définie et qu'il n'y a pas de tri
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          data.sort((a, b) => b.timer.getTime() - a.timer.getTime()); // On trie les articles par date de création
          res.json({ success: true, data }); // On renvoie les articles trouvés
        });
    } else if (!categorie && tri === "Prix croissant") {
      // Si la catégorie et le tri sont définis
      Article.find()
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          data.sort((a, b) => a.currentPrice - b.currentPrice); // On trie les articles par prix croissant
          res.json({ success: true, data }); // On renvoie les articles trouvés
        });
    } else if (categorie !== "--All Categories--" && tri === "Le plus récent") {
      // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then((data) => {
          Article.find({ categorie: data._id }) // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              data.sort((a, b) => b.timer.getTime() - a.timer.getTime()); // On trie les articles par date de création
              res.json({ success: true, data }); // On renvoie les articles trouvés
            });
        });
    } else if (categorie !== "--All Categories--" && tri === "Prix croissant") {
      // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then((data) => {
          Article.find({ categorie: data._id }) // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              data.sort((a, b) => a.currentPrice - b.currentPrice); // On trie les articles par prix croissant
              res.json({ success: true, data }); // On renvoie les articles trouvés
            });
        });
    } else if (categorie === "--All Categories--" && tri === "Le plus récent") {
      // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then(() => {
          Article.find() // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              data.sort((a, b) => b.timer.getTime() - a.timer.getTime()); // On trie les articles par date de création
              res.json({ success: true, data }); // On renvoie les articles trouvés
            });
        });
    } else if (categorie === "--All Categories--" && tri === "Prix croissant") {
      // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then(() => {
          Article.find() // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              data.sort((a, b) => a.currentPrice - b.currentPrice); // On trie les articles par prix croissant
              res.json({ success: true, data }); // On renvoie les articles trouvés
            });
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la recherche" }); // En cas d'erreur, on renvoie un message d'erreur
  }
});

//-----------------------------------------------------------------------------------------------------------------------------------------

// Route pour uploader une photo sur Cloudinary--------------------------------------------------------------------------------------------
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

// Route pour modifier le prix actuel d'un article-----------------------------------------------------------------------------------------
router.put("/updateCurrentPrice", (req, res) => {
  try {
    const id = req.body.id;
    const newPrice = Number(req.body.newPrice);
    const newBuyer = req.body.newBuyer || null;

    User.findOne({ _id: newBuyer }).then((data) => {
      // Vérification si l'acheteur existe
      if (!data || newBuyer === null) {
        return res.status(400).json({ message: "Acheteur introuvable" });
      }

      // Si l'acheteur est trouvé, on continue avec la mise à jour du prix
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

//-----------------------------------------------------------------------------------------------------------------------------------------

module.exports = router;
