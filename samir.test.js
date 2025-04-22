const request = require("supertest");
const app = require("./app");

it("POST /sign-in - connexion un utilisateur ", async () => {
  const res = await request(app).post("/users/sign-in").send({
    email: "Samir@gmail.fr",
    password: "Azerty123$",
  });
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ result: true, token: expect.any(String) });
});
