const request = require("supertest");
const app = require("./app");




it("POST /sign-up - mdp de moins de 8 caracteres", async () => {
  const res = await request(app).post("/users/sign-up").send({
    // On crée un utilisateur pour le test
    email: "demba@gmail.com",
    username: "Demba",
    password: "azerty",
  });
  expect(res.statusCode).toBe(200);
  // Vérifie que `token` est une chaîne de caractères
  expect(res.body).toEqual({ result: false, error: 'Le mot de passe doit avoir au moins 8 caractères.' });
    // On vérifie que l'utilisateur a été créé avec succès
});

it("POST /sign-up - mdp sans majuscule", async () => {
  const res = await request(app).post("/users/sign-up").send({
    // On crée un utilisateur pour le test
    email: "demba@gmail.com",
    username: "Demba",
    password: "azertyuiop",
  });
  expect(res.statusCode).toBe(200);
  // Vérifie que `token` est une chaîne de caractères
  expect(res.body).toEqual({ result: false, error: 'Le mot de passe doit contenir au moins une majuscule.' });
    // On vérifie que l'utilisateur a été créé avec succès
});




it("POST /sign-up - mdp sans chiffre", async () => {
  const res = await request(app).post("/users/sign-up").send({
    // On crée un utilisateur pour le test
    email: "demba@gmail.com",
    username: "Demba",
    password: "Azertyuiop",
  });
  expect(res.statusCode).toBe(200);
  // Vérifie que `token` est une chaîne de caractères
  expect(res.body).toEqual({ result: false, error: 'Le mot de passe doit contenir au moins un chiffre.' });
    // On vérifie que l'utilisateur a été créé avec succès
});

it("POST /sign-up - mdp sans caractère special", async () => {
  const res = await request(app).post("/users/sign-up").send({
    // On crée un utilisateur pour le test
    email: "demba@gmail.com",
    username: "Demba",
    password: "Azerty123",
  });
  expect(res.statusCode).toBe(200);
  // Vérifie que `token` est une chaîne de caractères
  expect(res.body).toEqual({ result: false, error: 'Le mot de passe doit contenir au moins un caractère spécial.' });
    // On vérifie que l'utilisateur a été créé avec succès
});

it("POST /sign-up", async () => {
  const res = await request(app).post("/users/sign-up").send({
    // On crée un utilisateur pour le test
    email: "demba@gmail.com",
    username: "Demba",
    password: "Azerty123!",
  });
  expect(res.statusCode).toBe(200);
  // Vérifie que `token` est une chaîne de caractères
  expect(res.body).toEqual({ result: true, token: expect.any(String) });
    // On vérifie que l'utilisateur a été créé avec succès
});