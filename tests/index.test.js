const supertest = require('supertest');
const app = require('../loaders/express');

describe('GET /ready', () => {
  test('test health check API', async () => {
    const response = await supertest(app).get('/api/v1/ready');
    expect(response.text).toBe('API is up and running!');
  });
});

describe('404 Response', () => {
  test('test bad url path', async () => {
    const response = await supertest(app).get('/api/v1/xyz');
    expect(response.body.code).toBe(404);
  });
});
