const request = require("supertest");
const app = require("./app");

// Test pour vérifier la route GET /categories
// Ce test envoie une requête GET à l'endpoint /categories
// et vérifie le code de statut de la réponse et la structure du corps de la réponse

it('GET /categories', async () => {
    const res = await request(app).get('/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
        categories: expect.any(Array), // Vérifie que `categories` est un tableau
    });
});

// Test pour vérifier la route POST /findUserByToken
// Ce test envoie une requête POST à l'endpoint /findUserByToken avec un token dans le corps de la requête
// et vérifie le code de statut de la réponse et la structure du corps de la réponse

// Si le token correspond à un utilisateur valide
it('POST /findUserByExistingToken', async () => {
    const res = await request(app).post('/users/findUserByToken').send({ 
        token: '4-8oYfyFIBRXStqg-q8hnW9JuduzzLAd',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
        data: {
            _id: expect.any(String),
            email: expect.any(String),
            username: expect.any(String),
            token: expect.any(String),
            password: expect.any(String),
            donneeBancaire: expect.any(String),
            telephone: expect.any(String),
            bookmark: expect.any(Array),
            __v: expect.any(Number),
        },
        result: true,
    });
});

// Si le token ne correspond pas à un utilisateur valide
it('POST /findUserByRandomToken', async () => {
    const res = await request(app).post('/users/findUserByToken').send({ 
        token: 'RandomToken',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
        data: null,
        result: true,
    });
});