import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskList from '../TaskList';

describe('TaskList Component', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();

  const mockTasks = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      status: 'completed',
      priority: 'low'
    }
  ];

  it('renders empty state when no tasks', () => {
    render(<TaskList tasks={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);
    expect(screen.getByText('No tasks found. Create your first task!')).toBeInTheDocument();
  });

  it('renders list of tasks', () => {
    render(<TaskList tasks={mockTasks} onEdit={mockOnEdit} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByTestId('task-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-2')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskList tasks={mockTasks} onEdit={mockOnEdit} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByTestId('edit-button-1');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskList tasks={mockTasks} onEdit={mockOnEdit} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);
    
    const deleteButton = screen.getByTestId('delete-button-1');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('calls onUpdate when status is changed', async () => {
    const user = userEvent.setup();
    render(<TaskList tasks={mockTasks} onEdit={mockOnEdit} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);
    
    const statusSelect = screen.getByTestId('status-select-1');
    await user.selectOptions(statusSelect, 'completed');

    expect(mockOnUpdate).toHaveBeenCalledWith(1, { status: 'completed' });
  });
});

