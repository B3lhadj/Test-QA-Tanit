# Tanit Task Management Application

A full-stack task management application built with React, Node.js, and SQLite, featuring comprehensive quality assurance testing.

## 🚀 Features

- **User Authentication**: Register, login, and logout functionality
- **Task Management**: Create, read, update, and delete tasks
- **Task Filtering**: Filter tasks by status and priority
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Secure API**: JWT-based authentication and protected routes

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: 3.8 or higher (for API testing)
- **Git**: For version control

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Tanit
```

### 2. Install Dependencies

#### Root Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

#### API Testing Dependencies (Python)
```bash
cd backend/tests/api_tests
pip install -r requirements.txt
```

## 🏃 Running the Application

### Development Mode

#### Option 1: Run Both Frontend and Backend Together
From the root directory:
```bash
npm run dev
```

#### Option 2: Run Separately

**Backend Server** (Terminal 1):
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3001`

**Frontend Server** (Terminal 2):
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### Production Build

**Build Frontend**:
```bash
cd frontend
npm run build
```

**Start Backend**:
```bash
cd backend
npm start
```

## 🧪 Testing

This project includes comprehensive testing at multiple levels:

### Unit Tests

#### Frontend Unit Tests (Vitest)
```bash
cd frontend
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

Run with UI:
```bash
npm run test:ui
```

#### Backend Unit Tests (Jest)
```bash
cd backend
npm test
```

Run in watch mode:
```bash
npm run test:watch
```

### Integration Tests

Run backend integration tests:
```bash
cd backend
npm test
```

Integration tests cover:
- Authentication flow
- Database CRUD operations
- API endpoint interactions

### End-to-End (E2E) Tests

#### Using Cypress

**Interactive Mode**:
```bash
cd frontend
npm run test:e2e
```

**Headless Mode**:
```bash
cd frontend
npm run test:e2e:headless
```

E2E tests cover:
- User registration and login journey
- Complete task management workflow
- Task filtering functionality

### API Testing

#### Using pytest

**Prerequisites**: Ensure backend server is running

```bash
cd backend/tests/api_tests
pytest test_api.py -v
```

Run specific test class:
```bash
pytest test_api.py::TestAuthAPI -v
pytest test_api.py::TestTasksAPI -v
```

API tests cover:
- Happy path scenarios
- Error scenarios (400, 401, 403, 404, 500)
- Boundary cases
- Input validation
- Status code verification

### Running All Tests

From the root directory:
```bash
npm test
```

This will run:
- Frontend unit tests
- Backend unit tests
- Integration tests

## 📁 Project Structure

```
Tanit/
├── backend/
│   ├── server.js              # Express server
│   ├── package.json
│   ├── tasks.db               # SQLite database (created on first run)
│   └── tests/
│       ├── unit/              # Unit tests
│       │   ├── auth.test.js
│       │   └── tasks.test.js
│       ├── integration/       # Integration tests
│       │   ├── auth-flow.test.js
│       │   └── database-crud.test.js
│       └── api_tests/         # API tests (pytest)
│           ├── test_api.py
│           └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskList.jsx
│   │   ├── components/__tests__/  # Component tests
│   │   │   ├── Login.test.jsx
│   │   │   ├── TaskForm.test.jsx
│   │   │   └── TaskList.test.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── cypress/
│   │   └── e2e/               # E2E tests
│   │       ├── user-login.cy.js
│   │       └── task-management.cy.js
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── Test_Plan.md           # Comprehensive test plan
│   ├── Test_Cases.md          # Manual test cases
│   └── QA_Release_Report.md   # QA release report
├── .github/
│   └── ISSUES/                # Bug reports
│       ├── bug-001.md
│       ├── bug-002.md
│       ├── bug-003.md
│       ├── bug-004.md
│       └── bug-005.md
└── README.md                   # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory (optional):

```env
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
```

### Database

The SQLite database (`tasks.db`) is automatically created on first server start. It includes:
- `users` table: User accounts
- `tasks` table: User tasks

## 📊 Test Coverage

- **Frontend Unit Tests**: 88% coverage
- **Backend Unit Tests**: 82% coverage
- **Overall Coverage**: 85%

View coverage reports:
```bash
cd frontend
npm run test:coverage
```

## 🐛 Bug Reports

Bug reports are documented in `.github/ISSUES/`:
- Bug #001: Task deletion confirmation (High)
- Bug #002: Error message persistence (Medium) - Fixed
- Bug #003: Filter state persistence (Medium) - Fixed
- Bug #004: Mobile UI alignment (Low) - Deferred
- Bug #005: Console warning (Low) - Deferred

## 📚 Documentation

- **[Test Plan](docs/Test_Plan.md)**: Comprehensive test planning document
- **[Test Cases](docs/Test_Cases.md)**: Detailed manual test cases
- **[QA Release Report](docs/QA_Release_Report.md)**: Release quality assessment

## 🛠️ Tools and Frameworks

### Frontend
- **React 18**: UI library
- **Vite**: Build tool
- **Vitest**: Unit testing
- **Cypress**: E2E testing
- **React Router**: Navigation

### Backend
- **Node.js**: Runtime
- **Express**: Web framework
- **SQLite**: Database
- **Jest**: Testing framework
- **Supertest**: HTTP assertions

### Testing
- **Vitest**: Frontend unit tests
- **Jest**: Backend unit tests
- **Cypress**: E2E tests
- **pytest**: API tests
- **requests**: HTTP library for API testing

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get all tasks (with optional filters)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health
- `GET /api/health` - Health check

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected API routes
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is for educational purposes.

## 👥 Authors

QA Team - Software Quality Assurance Assignment

## 📞 Support

For issues and questions, please create an issue in the GitHub repository.

---

**Version**: 1.0.0  
**Last Updated**: 2024

