import request from 'supertest';
import app from '../../server.js';

describe('Database CRUD Operations Integration Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create a test user
    const userData = {
      username: `crudtest${Date.now()}`,
      email: `crudtest${Date.now()}@example.com`,
      password: 'password123'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  it('should perform full CRUD operations on tasks', async () => {
    // CREATE
    const createResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'CRUD Test Task',
        description: 'Testing CRUD operations',
        status: 'pending',
        priority: 'high'
      })
      .expect(201);

    const taskId = createResponse.body.id;
    expect(createResponse.body.title).toBe('CRUD Test Task');

    // READ - Get all tasks
    const getAllResponse = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getAllResponse.body.some(task => task.id === taskId)).toBe(true);

    // READ - Get specific task
    const getOneResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getOneResponse.body.id).toBe(taskId);
    expect(getOneResponse.body.title).toBe('CRUD Test Task');

    // UPDATE
    const updateResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Updated CRUD Task',
        status: 'completed'
      })
      .expect(200);

    expect(updateResponse.body.title).toBe('Updated CRUD Task');
    expect(updateResponse.body.status).toBe('completed');

    // DELETE
    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(deleteResponse.body.message).toContain('deleted successfully');

    // Verify deletion
    await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('should maintain data integrity across operations', async () => {
    // Create multiple tasks
    const task1 = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Task 1', priority: 'high' });

    const task2 = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Task 2', priority: 'low' });

    // Filter by priority
    const highPriorityTasks = await request(app)
      .get('/api/tasks?priority=high')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(highPriorityTasks.body.some(t => t.id === task1.body.id)).toBe(true);
    expect(highPriorityTasks.body.some(t => t.id === task2.body.id)).toBe(false);

    // Cleanup
    await request(app)
      .delete(`/api/tasks/${task1.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    await request(app)
      .delete(`/api/tasks/${task2.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);
  });
});

