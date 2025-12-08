import request from 'supertest';
import app from '../../server.js';

describe('Tasks API', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Register and login a test user
    testUser = {
      username: `tasktest${Date.now()}`,
      email: `tasktest${Date.now()}@example.com`,
      password: 'password123'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    authToken = registerResponse.body.token;
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.status).toBe(taskData.status);
      expect(response.body.priority).toBe(taskData.priority);
    });

    it('should reject task creation without title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'No title'
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should reject task creation without authentication', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task'
        })
        .expect(401);

      expect(response.body.error).toContain('Access token required');
    });

    it('should use default values for status and priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task with defaults'
        })
        .expect(201);

      expect(response.body.status).toBe('pending');
      expect(response.body.priority).toBe('medium');
    });
  });

  describe('GET /api/tasks', () => {
    let taskId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for listing',
          status: 'in-progress',
          priority: 'high'
        });
      taskId = response.body.id;
    });

    it('should get all tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=in-progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(task => {
        expect(task.status).toBe('in-progress');
      });
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(task => {
        expect(task.priority).toBe('high');
      });
    });
  });

  describe('GET /api/tasks/:id', () => {
    let taskId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for get by id',
          description: 'Test description'
        });
      taskId = response.body.id;
    });

    it('should get a specific task by id', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Task for get by id');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task to update',
          status: 'pending'
        });
      taskId = response.body.id;
    });

    it('should update a task', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task',
          status: 'completed'
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Task');
      expect(response.body.status).toBe('completed');
    });

    it('should reject invalid status value', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'invalid-status'
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task to delete'
        });
      taskId = response.body.id;
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted successfully');

      // Verify task is deleted
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

