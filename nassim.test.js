const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const Article = require("./models/articles");
const router = require("./routes/articles");

const app = express();
app.use(express.json());
app.use("/articles", router);

//Ce test s'assure que le paramètre "isDone" d'un article pour lequel la vente est terminée passe bien de false à true

describe("POST /articles/updateIsDone", () => {
  let article;

  //Setup le test en se connectant à un serveur mongoose et une database test 
  beforeAll(async () => {
    const url = "mongodb+srv://nassimhiber:JPBZKXVgtPrYU7JN@cluster0.umlu0.mongodb.net/test"; // Utilisation d'une base de données de test
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

    // Création d'un article de test
    article = new Article({ titre: "Livre Test", isDone: false });
    await article.save();
  });
//Supprime la database test et ferme la connexion au serveur
  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });
//Doit mettre à jour le paramètre "isDone" de l'article test
  it("devrait mettre à jour le champ isDone à true et retourner l'article mis à jour", async () => {
    const response = await request(app)
      .post("/articles/updateIsDone")
      .send({ id: article._id });
//On devrait recevoir un retour 200 ainsi que le respet des propriétés comme indiqué (un livre sous format {titre: String, isDone: booleen})
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("isDone", true);
    expect(response.body.data).toHaveProperty("titre", "Livre Test");
  });
});
