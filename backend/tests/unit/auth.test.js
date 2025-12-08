import request from 'supertest';
import app from '../../server.js';

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(userData.username);
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should reject registration with short password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should reject registration with duplicate username', async () => {
      const timestamp = Date.now();
      const userData = {
        username: `duplicateuser${timestamp}`,
        email: `test1${timestamp}@example.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, email: `test2${timestamp}@example.com` })
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeAll(async () => {
      testUser = {
        username: `logintest${Date.now()}`,
        email: `logintest${Date.now()}@example.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(testUser.username);
    });

    it('should reject login with invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });
});

