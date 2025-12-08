import request from 'supertest';
import app from '../../server.js';

describe('Authentication Flow Integration Tests', () => {
  it('should complete full registration and login flow', async () => {
    const userData = {
      username: `integration${Date.now()}`,
      email: `integration${Date.now()}@example.com`,
      password: 'password123'
    };

    // Register
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(registerResponse.body).toHaveProperty('token');
    expect(registerResponse.body).toHaveProperty('user');

    // Login with registered credentials
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: userData.username,
        password: userData.password
      })
      .expect(200);

    expect(loginResponse.body).toHaveProperty('token');
    expect(loginResponse.body.user.username).toBe(userData.username);
  });

  it('should use token to access protected routes', async () => {
    // Register and get token
    const userData = {
      username: `protected${Date.now()}`,
      email: `protected${Date.now()}@example.com`,
      password: 'password123'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    const token = registerResponse.body.token;

    // Use token to create a task
    const taskResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Protected Task',
        description: 'Created with auth token'
      })
      .expect(201);

    expect(taskResponse.body).toHaveProperty('id');
    expect(taskResponse.body.title).toBe('Protected Task');

    // Use token to fetch tasks
    const tasksResponse = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(tasksResponse.body)).toBe(true);
  });

  it('should reject requests with invalid token', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer invalid-token')
      .expect(403);

    expect(response.body.error).toContain('Invalid or expired token');
  });

  it('should reject requests without token', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .expect(401);

    expect(response.body.error).toContain('Access token required');
  });
});

