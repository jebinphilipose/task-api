const supertest = require('supertest');
const app = require('../loaders/express');

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

  describe('when id param is an empty string', () => {
    test('should respond with 400 and validation failed message', async () => {
      const updateMetaData = { description: 'Updated Description', status: 'IN_PROGRESS' };
      const updateResponse = await supertest(app).put('/api/v1/tasks/%20').send(updateMetaData);
      expect(updateResponse.body.code).toBe(400);
      expect(updateResponse.body.message).toBe('Validation Failed');
    });
  });
});

// Tests for getting all tasks
describe('GET /tasks', () => {
  describe('when page and limit query params are not provided', () => {
    test('should return tasks for the first page', async () => {
      const response = await supertest(app).get('/api/v1/tasks');
      expect(response.body.page).toBe(1);
      expect(response.statusCode).toBe(200);
    });
  });

  describe('when page query param is either negative or zero', () => {
    test('should repond with 400 and appropriate message', async () => {
      const response = await supertest(app).get('/api/v1/tasks?page=-1');
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe("Page can't be negative or zero");
    });
  });

  describe('when page query param is not a number', () => {
    test('should respond with 400 and validation failed message', async () => {
      const response = await supertest(app).get('/api/v1/tasks?page=random');
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('Validation Failed');
    });
  });

  describe('when limit query param is not a number', () => {
    test('should respond with 400 and validation failed message', async () => {
      const response = await supertest(app).get('/api/v1/tasks?page=1&limit=random');
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('Validation Failed');
    });
  });
});

// Tests for getting task metrics
describe('GET /tasks/metrics', () => {
  describe('when incorrect type is provided in query params', () => {
    test('should repond with 400 and validation failed message', async () => {
      const response = await supertest(app).get('/api/v1/tasks/metrics?type=random');
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('Validation Failed');
    });
  });

  describe('when type is not provided -> defaults to count-by-status', () => {
    test('should return 200 response', async () => {
      const response = await supertest(app).get('/api/v1/tasks/metrics');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('when type is count-by-status', () => {
    test('should return 200 response', async () => {
      const response = await supertest(app).get('/api/v1/tasks/metrics?type=count-by-status');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('when type is count-by-timeline', () => {
    test('should return 200 response', async () => {
      const response = await supertest(app).get('/api/v1/tasks/metrics?type=count-by-timeline');
      expect(response.statusCode).toBe(200);
    });
  });
});
