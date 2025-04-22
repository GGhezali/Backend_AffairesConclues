/**
 * Importing the `supertest` library to perform HTTP assertions and testing.
 * `request` is used to simulate HTTP requests to the application during testing.
 */
const request = require("supertest");

/**
 * The main application instance imported from the './app' module.
 * This is the Express application that will be tested.
 */
const app = require("./app");

/**
 * Test case for the POST /findUserIdByToken endpoint.
 * This test sends a POST request with a token in the request body
 * and verifies the response status code and body structure.
 */
it("POST /findUserIdByToken", async () => {
  const res = await request(app).post("/users/findUserIdByToken").send({
    token: "mdw0XTEk4s7w-3Ad6ksjHRUvUbXyW4LV",
  });

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({
    result: true,
    userId: expect.any(String), // Vérifie que `userId` est une chaîne de caractères
  });
});

/** or :
describe('POST /findUserIdByToken', () => {
  it('should return userId when a valid token is provided', async () => {
    const res = await request(app).post('/findUserIdByToken').send({
      token: "mdw0XTEk4s7w-3Ad6ksjHRUvUbXyW4LV",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: true,
      userId: expect.any(String), // Vérifie que `userId` est une chaîne de caractères
    });
  });
*/

it("POST /findUserIdByToken", async () => {
  const res = await request(app).post("/users/findUserIdByToken").send({
    token: "invalid_token",
  });

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({
    result: false,
    error: "Erreur serveur.",
  });
});
