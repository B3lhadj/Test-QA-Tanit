import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState({ status: '', priority: '' });

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);

      const response = await axios.get(
        `http://localhost:3001/api/tasks?${params.toString()}`,
        getAuthHeaders()
      );
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await axios.post(
        'http://localhost:3001/api/tasks',
        taskData,
        getAuthHeaders()
      );
      setTasks([response.data, ...tasks]);
      setShowForm(false);
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/tasks/${id}`,
        taskData,
        getAuthHeaders()
      );
      setTasks(tasks.map(task => task.id === response.data.id ? response.data : task));
      setEditingTask(null);
      setShowForm(false);
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/tasks/${id}`, getAuthHeaders());
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Task Manager</h1>
          <p>Welcome, {user.username}!</p>
        </div>
        <button onClick={onLogout} className="logout-btn" data-testid="logout-button">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-controls">
          <div className="filters">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              data-testid="status-filter"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              data-testid="priority-filter"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
            data-testid="create-task-button"
          >
            + New Task
          </button>
        </div>

        {showForm && (
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? (data) => handleUpdateTask(editingTask.id, data) : handleCreateTask}
            onCancel={handleFormClose}
          />
        )}

        <TaskList
          tasks={tasks}
          onEdit={handleEditClick}
          onDelete={handleDeleteTask}
          onUpdate={handleUpdateTask}
        />
      </div>
    </div>
  );
};

export default Dashboard;

