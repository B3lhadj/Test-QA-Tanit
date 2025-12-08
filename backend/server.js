import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Initialize database
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', 
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (user) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
        [username, email, hashedPassword], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }
          const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
          res.status(201).json({ 
            message: 'User created successfully',
            token,
            user: { id: this.lastID, username, email }
          });
        }
      );
    });
  }
);

app.post('/api/auth/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ 
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    });
  }
);

// Task Routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  const { status, priority } = req.query;
  let query = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [req.user.id];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(tasks);
  });
});

app.get('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  });
});

app.post('/api/tasks',
  authenticateToken,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status = 'pending', priority = 'medium' } = req.body;

    db.run(
      'INSERT INTO tasks (title, description, status, priority, user_id) VALUES (?, ?, ?, ?, ?)',
      [title, description, status, priority, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create task' });
        }
        db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, task) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch created task' });
          }
          res.status(201).json(task);
        });
      }
    );
  }
);

app.put('/api/tasks/:id',
  authenticateToken,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, req.user.id);

    db.run(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values,
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update task' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Task not found' });
        }
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch updated task' });
          }
          res.json(task);
        });
      }
    );
  }
);

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete task' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Only start listening if this file is run directly (not when imported for tests)
// Jest sets JEST_WORKER_ID when running tests
if (!process.env.JEST_WORKER_ID) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;

