const request = require("supertest");
const app = require("./app");

// Test d'une Connexion d'un utlisateur inscrit a l'application
it("POST /sign-in - connexion un utilisateur ", async () => {
  const res = await request(app).post("/users/sign-in").send({
    email: "Samirdjo@gmail.fr",
    password: "Azerty123@",
  });
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ result: true, token: expect.any(String) });
});

// Test d'une Connexion d'un utlisateur inscrit a l'application avec un mot de passe incorrect
it("POST /sign-in - connexion un utilisateur avec un mot de passe incorrect", async () => {
  const res = await request(app).post("/users/sign-in").send({
    email: "Samirdjo@gmail.fr",
    password: "Azerty123@1", // mauvais MDP
  });
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({
    result: false,
    error: "Mot de passe ou email invalide",
  });
});
