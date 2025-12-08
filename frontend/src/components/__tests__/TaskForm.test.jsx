import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../TaskForm';

describe('TaskForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create task form correctly', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('task-description-input')).toBeInTheDocument();
    expect(screen.getByTestId('task-status-select')).toBeInTheDocument();
    expect(screen.getByTestId('task-priority-select')).toBeInTheDocument();
  });

  it('renders edit task form with existing task data', () => {
    const task = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      status: 'in-progress',
      priority: 'high'
    };

    render(<TaskForm task={task} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByTestId('task-title-input')).toHaveValue('Test Task');
    expect(screen.getByTestId('task-description-input')).toHaveValue('Test Description');
    expect(screen.getByTestId('task-status-select')).toHaveValue('in-progress');
    expect(screen.getByTestId('task-priority-select')).toHaveValue('high');
  });

  it('calls onSubmit with form data on submit', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue();

    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.type(screen.getByTestId('task-title-input'), 'New Task');
    await user.type(screen.getByTestId('task-description-input'), 'Task Description');
    await user.selectOptions(screen.getByTestId('task-status-select'), 'completed');
    await user.selectOptions(screen.getByTestId('task-priority-select'), 'high');
    await user.click(screen.getByTestId('task-submit-button'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task Description',
        status: 'completed',
        priority: 'high'
      });
    });
  });

  it('displays error when title is empty', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const titleInput = screen.getByTestId('task-title-input');
    const submitButton = screen.getByTestId('task-submit-button');
    
    // Title input should be required
    expect(titleInput).toHaveAttribute('required');
    
    // Try to submit with only spaces (which will be trimmed to empty)
    await user.type(titleInput, '   ');
    await user.click(submitButton);
    
    // The form validation should catch this and show error
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    }, { timeout: 2000 });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('displays error message when onSubmit throws error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to save task';
    mockOnSubmit.mockRejectedValue(new Error(errorMessage));

    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.type(screen.getByTestId('task-title-input'), 'New Task');
    await user.click(screen.getByTestId('task-submit-button'));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});

