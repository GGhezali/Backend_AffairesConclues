const request = require('supertest');
const app = require('./app');
const { use } = require('bcrypt/promises');

it('GET /sign-in', async () => {
 const res = await request(app).post('/sign-in').send({
   email: email,
   password: password,});
 expect(res.statusCode).toBe(200);
 expect(res.body.stock).toEqual(true);
});