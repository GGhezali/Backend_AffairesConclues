var express = require("express"); // On importe express pour créer une route
var router = express.Router(); // On crée un objet routeur express

//On importe toutes les BDD pour les utiliser ensuite
const Article = require("../models/articles");
const Auteur = require("../models/auteurs");
const Editeur = require("../models/editeurs");
const Categorie = require("../models/categories");
const Etat = require("../models/etats");
const User = require("../models/users");

//Route pour récupérer les articles

router.get("/", (req, res) => {
  Article.find()
    //Populate sur les champs clé étrangères pour récupérer l'info textuelle et non l'id
    .populate("categorie etat auteur editeur annonceur acheteur")
    .then((data) => {
      res.json({ success: true, data });
    });
});

// Route pour updater la propriété isDone d'un article pour lequel la vente est terminées

router.post("/updateIsDone", (req, res) => {
  const id = req.body.id;

  Article.updateOne({ _id: id }, { isDone: true }).then(() => {
    Article.findOne({ _id: id }).then((data) => res.json({ data }));
  });
});

//Route pour publier un nouvel article
router.post("/publish", async (req, res) => {
  //On "fetch" dans les BDD préremplies pour récupérer les id des champs
  const foundCategory = await Categorie.findOne({ name: req.body.categorie });
  const foundEtat = await Etat.findOne({ condition: req.body.etat });
  const foundAuteur = await Auteur.findOne({ name: req.body.auteur });
  const foundEditeur = await Editeur.findOne({ name: req.body.editeur });
  const foundAnonceur = await User.findOne({ username: req.body.annonceur });
  const foundAcheteur = await User.findOne({ username: req.body.acheteur });

  //On check que tous les champs sont remplis avant de créer l'article
  if (foundCategory, foundEtat, foundAuteur, foundEditeur, foundAnonceur, foundAcheteur) {
    //On construit le nouvel article en fonction des champs remplis par l'utilisateur
    const newArticle = new Article({
      titre: req.body.titre,
      categorie: foundCategory._id,
      etat: foundEtat._id,
      description: req.body.description,
      auteur: foundAuteur._id,
      editeur: foundEditeur._id,
      startPrice: req.body.startPrice,
      currentPrice: req.body.currentPrice,
      localisation: {
        adresse: req.body.adresse,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
      },
      photoUrl: req.body.photoUrl,
      annonceur: foundAnonceur._id,
      acheteur: foundAcheteur._id,
      timer: req.body.timer,
      isDone: req.body.isDone,
    });

    // On sauvegarde l'article' dans la base de données
    newArticle.save().then((data) => {
      // On renvoie un succès et on affiche l'article poster dans le backend
      res.json({ result: true, data });
    });
    //Si tout n'est pas rempli, on renvoie un message d'erreur
  } else {
    res.json({ result: false, message: "Missing fields" });
  }

});

router.post('/searchByCategorie', (req, res) => {
  try {
    const { categorie, tri } = req.body; // On récupère la catégorie envoyée par le frontend

    if (categorie !== '--All Categories--' && !tri) { // Si la catégorie est définie et qu'il n'y a pas de tri
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then((data) => {
          Article.find({ categorie: data._id }) // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              res.json({ success: true, data }); // On renvoie les articles trouvés
            })
        });
    } else if (categorie !== '--All Categories--' && tri === 'Le plus récent') { // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then((data) => {
          Article.find({ categorie: data._id }) // On cherche les articles qui correspondent à la catégorie
            .then((data) => {
              data.sort((a, b) => b.timer.getTime() - a.timer.getTime()); // On trie les articles par date de création
              res.json({ success: true, data }); // On renvoie les articles trouvés
            })
        });
    } else if (categorie !== '--All Categories--' && tri === 'Prix croissant') { // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then((data) => {
          Article.find({ categorie: data._id }) // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              data.sort((a, b) => a.currentPrice - b.currentPrice); // On trie les articles par prix croissant
              res.json({ success: true, data }); // On renvoie les articles trouvés
            })
        });
    } else if (categorie === '--All Categories--' && !tri) {
      Article.find() // On cherche les articles qui correspondent à la catégorie
        .populate("categorie etat auteur editeur annonceur acheteur")
        .then((data) => {
          res.json({ success: true, data }); // On renvoie les articles trouvés

        });
    } else if (categorie === '--All Categories--' && tri === 'Le plus récent') { // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then(() => {
          Article.find() // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              data.sort((a, b) => b.timer.getTime() - a.timer.getTime()); // On trie les articles par date de création
              res.json({ success: true, data }); // On renvoie les articles trouvés
            })
        });
    } else if (categorie === '--All Categories--' && tri === 'Prix croissant') { // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then(() => {
          Article.find() // On cherche les articles qui correspondent à la catégorie
            .populate("categorie etat auteur editeur annonceur acheteur")
            .then((data) => {
              data.sort((a, b) => a.currentPrice - b.currentPrice); // On trie les articles par prix croissant
              res.json({ success: true, data }); // On renvoie les articles trouvés
            })
        });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la recherche" }); // En cas d'erreur, on renvoie un message d'erreur
  };
})

router.post('/searchByTri', (req, res) => {
  try {
    const { categorie, tri } = req.body; // On récupère la catégorie envoyée par le frontend

    if (!categorie && tri === 'Le plus récent') { // Si la catégorie est définie et qu'il n'y a pas de tri
      Article.find()
        .then((data) => {
          data.sort((a, b) => b.timer.getTime() - a.timer.getTime()); // On trie les articles par date de création
          res.json({ success: true, data }); // On renvoie les articles trouvés
        });
    } else if (!categorie && tri === 'Prix croissant') { // Si la catégorie et le tri sont définis
      Article.find()
        .then((data) => {
          data.sort((a, b) => a.currentPrice - b.currentPrice); // On trie les articles par prix croissant
          res.json({ success: true, data }); // On renvoie les articles trouvés
        });
    } else if (categorie !== '--All Categories--' && tri === 'Le plus récent') { // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then((data) => {
          Article.find({ categorie: data._id }) // On cherche les articles qui correspondent à la catégorie
            .then((data) => {
              data.sort((a, b) => b.timer.getTime() - a.timer.getTime()); // On trie les articles par date de création
              res.json({ success: true, data }); // On renvoie les articles trouvés
            })
        });
    } else if (categorie !== '--All Categories--' && tri === 'Prix croissant') { // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then((data) => {
          Article.find({ categorie: data._id }) // On cherche les articles qui correspondent à la catégorie
            .then((data) => {
              data.sort((a, b) => a.currentPrice - b.currentPrice); // On trie les articles par prix croissant
              res.json({ success: true, data }); // On renvoie les articles trouvés
            })
        });
    } else if (categorie === '--All Categories--' && tri === 'Le plus récent') { // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then(() => {
          Article.find() // On cherche les articles qui correspondent à la catégorie
            .then((data) => {
              data.sort((a, b) => b.timer.getTime() - a.timer.getTime()); // On trie les articles par date de création
              res.json({ success: true, data }); // On renvoie les articles trouvés
            })
        });
    } else if (categorie === '--All Categories--' && tri === 'Prix croissant') { // Si la catégorie et le tri sont définis
      Categorie.findOne({ name: categorie }) // On cherche la catégorie dans la BDD
        .then(() => {
          Article.find() // On cherche les articles qui correspondent à la catégorie
            .then((data) => {
              data.sort((a, b) => a.currentPrice - b.currentPrice); // On trie les articles par prix croissant
              res.json({ success: true, data }); // On renvoie les articles trouvés
            })
        });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la recherche" }); // En cas d'erreur, on renvoie un message d'erreur
  };
})

module.exports = router;
