# Testing Guide - Quick Reference

This guide provides quick commands for running all types of tests in the Tanit Task Management Application.

## Prerequisites

Ensure you have:
- Node.js 18+ installed
- Python 3.8+ installed (for API tests)
- All dependencies installed (`npm install` in root, backend, and frontend)

## Quick Start

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Or run both together:**
```bash
npm run dev
```

## Running Tests

### Frontend Unit Tests (Vitest)

```bash
cd frontend
npm test
```

**With coverage:**
```bash
npm run test:coverage
```

**With UI:**
```bash
npm run test:ui
```

**What it tests:**
- Login component
- Register component
- TaskForm component
- TaskList component
- User interactions and form validation

### Backend Unit Tests (Jest)

```bash
cd backend
npm test
```

**Watch mode:**
```bash
npm run test:watch
```

**What it tests:**
- Authentication endpoints (register, login)
- Task CRUD endpoints
- Input validation
- Error handling

### Integration Tests

```bash
cd backend
npm test
```

**What it tests:**
- Complete authentication flow
- Database CRUD operations
- API endpoint interactions
- Token-based authentication

### End-to-End Tests (Cypress)

**Prerequisites:** Ensure both frontend and backend servers are running

**Interactive mode (recommended for first time):**
```bash
cd frontend
npm run test:e2e
```

**Headless mode (for CI/CD):**
```bash
cd frontend
npm run test:e2e:headless
```

**What it tests:**
- User registration and login journey
- Complete task management workflow (create, edit, delete)
- Task filtering functionality
- Multi-step navigation

### API Tests (pytest)

**Prerequisites:** 
- Backend server must be running
- Python dependencies installed: `pip install -r backend/tests/api_tests/requirements.txt`

```bash
cd backend/tests/api_tests
pytest test_api.py -v
```

**Run specific test class:**
```bash
pytest test_api.py::TestAuthAPI -v
pytest test_api.py::TestTasksAPI -v
pytest test_api.py::TestHealthCheck -v
```

**What it tests:**
- All REST API endpoints
- Happy path scenarios
- Error scenarios (400, 401, 403, 404, 500)
- Boundary cases
- Input validation
- Status code verification

## Running All Tests

From the root directory:

```bash
npm test
```

This runs:
- Frontend unit tests
- Backend unit tests
- Integration tests

**Note:** E2E and API tests need to be run separately as they require the servers to be running.

## Test Coverage

View coverage reports:

**Frontend:**
```bash
cd frontend
npm run test:coverage
```

Coverage report will be generated in `frontend/coverage/`

**Backend:**
```bash
cd backend
npm test -- --coverage
```

## Test File Locations

### Frontend Tests
- Unit tests: `frontend/src/components/__tests__/`
- E2E tests: `frontend/cypress/e2e/`

### Backend Tests
- Unit tests: `backend/tests/unit/`
- Integration tests: `backend/tests/integration/`
- API tests: `backend/tests/api_tests/`

## Troubleshooting

### Tests fail with "Cannot find module"
- Run `npm install` in the respective directory
- Ensure you're in the correct directory

### E2E tests fail
- Ensure both frontend (port 3000) and backend (port 3001) are running
- Check that the database is initialized

### API tests fail
- Ensure backend server is running on port 3001
- Check Python dependencies are installed
- Verify network connectivity

### Database errors
- Delete `backend/tasks.db` and restart the server
- Database will be recreated automatically

## Test Data

Tests use dynamic data (timestamps) to avoid conflicts. No manual test data setup required.

## Continuous Integration

For CI/CD pipelines:

```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Run tests
npm test
cd frontend && npm run test:e2e:headless
cd ../backend/tests/api_tests && pytest test_api.py -v
```

---

**Last Updated**: 2024

