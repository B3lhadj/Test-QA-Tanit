"""
REST API Testing using pytest and requests
Tests all API endpoints with various scenarios
"""
import pytest
import requests
import time
import json

BASE_URL = "http://localhost:3001/api"
TIMEOUT = 5

class TestAuthAPI:
    """Test Authentication endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user for each test"""
        self.timestamp = int(time.time() * 1000)
        self.test_user = {
            "username": f"pytestuser{self.timestamp}",
            "email": f"pytest{self.timestamp}@example.com",
            "password": "password123"
        }
        yield
        # Cleanup if needed
    
    def test_register_user_success(self):
        """Test successful user registration"""
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=self.test_user,
            timeout=TIMEOUT
        )
        assert response.status_code == 201
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["username"] == self.test_user["username"]
        assert data["user"]["email"] == self.test_user["email"]
    
    def test_register_user_duplicate(self):
        """Test registration with duplicate username"""
        # Register first time
        requests.post(f"{BASE_URL}/auth/register", json=self.test_user, timeout=TIMEOUT)
        
        # Try to register again with same username
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={**self.test_user, "email": f"different{self.timestamp}@example.com"},
            timeout=TIMEOUT
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["error"].lower()
    
    def test_register_invalid_email(self):
        """Test registration with invalid email format"""
        invalid_user = {**self.test_user, "email": "invalid-email"}
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=invalid_user,
            timeout=TIMEOUT
        )
        assert response.status_code == 400
        assert "errors" in response.json()
    
    def test_register_short_password(self):
        """Test registration with password too short"""
        invalid_user = {**self.test_user, "password": "12345"}
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=invalid_user,
            timeout=TIMEOUT
        )
        assert response.status_code == 400
    
    def test_login_success(self):
        """Test successful login"""
        # Register first
        requests.post(f"{BASE_URL}/auth/register", json=self.test_user, timeout=TIMEOUT)
        
        # Login
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "username": self.test_user["username"],
                "password": self.test_user["password"]
            },
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["username"] == self.test_user["username"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "username": "nonexistent",
                "password": "wrongpassword"
            },
            timeout=TIMEOUT
        )
        assert response.status_code == 401
        assert "invalid" in response.json()["error"].lower()


class TestTasksAPI:
    """Test Tasks endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated session for each test"""
        self.timestamp = int(time.time() * 1000)
        self.test_user = {
            "username": f"taskuser{self.timestamp}",
            "email": f"task{self.timestamp}@example.com",
            "password": "password123"
        }
        
        # Register and get token
        register_response = requests.post(
            f"{BASE_URL}/auth/register",
            json=self.test_user,
            timeout=TIMEOUT
        )
        self.token = register_response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        yield
    
    def test_create_task_success(self):
        """Test successful task creation"""
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "status": "pending",
            "priority": "high"
        }
        response = requests.post(
            f"{BASE_URL}/tasks",
            json=task_data,
            headers=self.headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == task_data["title"]
        assert data["description"] == task_data["description"]
        assert data["status"] == task_data["status"]
        assert data["priority"] == task_data["priority"]
        assert "id" in data
    
    def test_create_task_without_auth(self):
        """Test task creation without authentication"""
        response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Test Task"},
            timeout=TIMEOUT
        )
        assert response.status_code == 401
    
    def test_create_task_missing_title(self):
        """Test task creation without required title"""
        response = requests.post(
            f"{BASE_URL}/tasks",
            json={"description": "No title"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 400
    
    def test_get_all_tasks(self):
        """Test getting all tasks"""
        # Create a task first
        requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Task 1"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        
        response = requests.get(
            f"{BASE_URL}/tasks",
            headers=self.headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) > 0
    
    def test_get_task_by_id(self):
        """Test getting a specific task by ID"""
        # Create a task
        create_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Get Task Test", "description": "Test description"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        task_id = create_response.json()["id"]
        
        # Get the task
        response = requests.get(
            f"{BASE_URL}/tasks/{task_id}",
            headers=self.headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert data["title"] == "Get Task Test"
    
    def test_get_nonexistent_task(self):
        """Test getting a task that doesn't exist"""
        response = requests.get(
            f"{BASE_URL}/tasks/99999",
            headers=self.headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 404
    
    def test_update_task(self):
        """Test updating a task"""
        # Create a task
        create_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Original Title", "status": "pending"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        task_id = create_response.json()["id"]
        
        # Update the task
        response = requests.put(
            f"{BASE_URL}/tasks/{task_id}",
            json={"title": "Updated Title", "status": "completed"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["status"] == "completed"
    
    def test_update_task_invalid_status(self):
        """Test updating task with invalid status"""
        # Create a task
        create_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Test Task"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        task_id = create_response.json()["id"]
        
        # Try to update with invalid status
        response = requests.put(
            f"{BASE_URL}/tasks/{task_id}",
            json={"status": "invalid-status"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 400
    
    def test_delete_task(self):
        """Test deleting a task"""
        # Create a task
        create_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Task to Delete"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        task_id = create_response.json()["id"]
        
        # Delete the task
        response = requests.delete(
            f"{BASE_URL}/tasks/{task_id}",
            headers=self.headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        
        # Verify it's deleted
        get_response = requests.get(
            f"{BASE_URL}/tasks/{task_id}",
            headers=self.headers,
            timeout=TIMEOUT
        )
        assert get_response.status_code == 404
    
    def test_filter_tasks_by_status(self):
        """Test filtering tasks by status"""
        # Create tasks with different statuses
        requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Pending Task", "status": "pending"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Completed Task", "status": "completed"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        
        # Filter by status
        response = requests.get(
            f"{BASE_URL}/tasks?status=completed",
            headers=self.headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        tasks = response.json()
        assert all(task["status"] == "completed" for task in tasks)
    
    def test_filter_tasks_by_priority(self):
        """Test filtering tasks by priority"""
        # Create tasks with different priorities
        requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "High Priority", "priority": "high"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Low Priority", "priority": "low"},
            headers=self.headers,
            timeout=TIMEOUT
        )
        
        # Filter by priority
        response = requests.get(
            f"{BASE_URL}/tasks?priority=high",
            headers=self.headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        tasks = response.json()
        assert all(task["priority"] == "high" for task in tasks)


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "timestamp" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

