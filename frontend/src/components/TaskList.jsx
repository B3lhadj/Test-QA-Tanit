import './TaskList.css';

const TaskList = ({ tasks, onEdit, onDelete, onUpdate }) => {
  const handleStatusChange = (task, newStatus) => {
    onUpdate(task.id, { status: newStatus });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>No tasks found. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="task-list" data-testid="task-list">
      {tasks.map(task => (
        <div key={task.id} className={`task-card ${getPriorityClass(task.priority)}`} data-testid={`task-${task.id}`}>
          <div className="task-header">
            <h3>{task.title}</h3>
            <div className="task-badges">
              <span className={`badge priority ${getPriorityClass(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`badge status ${getStatusClass(task.status)}`}>
                {task.status}
              </span>
            </div>
          </div>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          <div className="task-footer">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task, e.target.value)}
              className="status-select"
              data-testid={`status-select-${task.id}`}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="task-actions">
              <button
                onClick={() => onEdit(task)}
                className="btn-edit"
                data-testid={`edit-button-${task.id}`}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="btn-delete"
                data-testid={`delete-button-${task.id}`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;

