const supertest = require('supertest');
const app = require('../loaders/express');

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  ...jest.requireActual('@prisma/client'),
  PrismaClient: jest.requireActual('prismock').PrismockClient,
}));

const responseMetaData = {
  description: 'Task 1 description',
  status: 'OPEN',
};

describe('POST /tasks', () => {
  describe('given description and status', () => {
    test('should return a json response with the given description and status', async () => {
      const response = await supertest(app).post('/api/v1/tasks').send(responseMetaData);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
      expect(response.body.description).toBe('Task 1 description');
      expect(response.body.status).toBe('OPEN');
    });

    test('should respond with a 201 status code', async () => {
      const response = await supertest(app).post('/api/v1/tasks').send(responseMetaData);
      expect(response.statusCode).toBe(201);
    });
  });

  describe('when status is missing', () => {
    test('should create a task with OPEN status', async () => {
      const { status, ...responseData } = responseMetaData;
      const response = await supertest(app).post('/api/v1/tasks').send(responseData);
      expect(response.body.status).toBe('OPEN');
    });
  });

  describe('when description is missing', () => {
    test('should respond with a 400 status code', async () => {
      const { description, ...responseData } = responseMetaData;
      const response = await supertest(app).post('/api/v1/tasks').send(responseData);
      expect(response.statusCode).toBe(400);
    });
  });

  describe('when status is other than OPEN', () => {
    test('should respond with a 400 status code', async () => {
      const responseData = { ...responseMetaData };
      responseData.status = 'IN_PROGRESS';
      const response = await supertest(app).post('/api/v1/tasks').send(responseData);
      expect(response.statusCode).toBe(400);
    });
  });
});
