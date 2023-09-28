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

// Tests for creating a task
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

// Tests for updating a task
describe('PUT /tasks/:id', () => {
  describe('given description or status and a task id', () => {
    test('should return the updated task with given description or status', async () => {
      // create a task
      const response = await supertest(app).post('/api/v1/tasks').send(responseMetaData);
      const taskId = response.body.id;
      // update the task
      const updateMetaData = { description: 'Updated Description', status: 'IN_PROGRESS' };
      const updateResponse = await supertest(app).put(`/api/v1/tasks/${taskId}`).send(updateMetaData);
      expect(updateResponse.body.description).toBe('Updated Description');
      expect(updateResponse.body.status).toBe('IN_PROGRESS');
      expect(updateResponse.statusCode).toBe(200);
    });
  });

  describe('when both description and status are missing', () => {
    test('should respond with 400 and appropriate message', async () => {
      // create a task
      const response = await supertest(app).post('/api/v1/tasks').send(responseMetaData);
      const taskId = response.body.id;
      // update the task
      const updateMetaData = {};
      const updateResponse = await supertest(app).put(`/api/v1/tasks/${taskId}`).send(updateMetaData);
      expect(updateResponse.body.code).toBe(400);
      expect(updateResponse.body.message).toBe('Empty body - Please input description or status');
    });
  });

  describe('when task is not found', () => {
    test('should respond with 400 and message of not found', async () => {
      const taskId = 'random_id';
      const updateMetaData = { description: 'Updated Description', status: 'IN_PROGRESS' };
      const updateResponse = await supertest(app).put(`/api/v1/tasks/${taskId}`).send(updateMetaData);
      expect(updateResponse.body.code).toBe(400);
      expect(updateResponse.body.message).toBe('Record to update not found');
    });
  });
});
