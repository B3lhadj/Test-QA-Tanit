import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import axios from 'axios';

vi.mock('axios');

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login Component', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithRouter(<Login onLogin={mockOnLogin} />);
    
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByTestId('username-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('allows user to input username and password', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login onLogin={mockOnLogin} />);
    
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls onLogin with correct data on successful login', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' }
      }
    };
    axios.post.mockResolvedValue(mockResponse);

    renderWithRouter(<Login onLogin={mockOnLogin} />);
    
    await user.type(screen.getByTestId('username-input'), 'testuser');
    await user.type(screen.getByTestId('password-input'), 'password123');
    await user.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(
        mockResponse.data.user,
        mockResponse.data.token
      );
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } }
    });

    renderWithRouter(<Login onLogin={mockOnLogin} />);
    
    await user.type(screen.getByTestId('username-input'), 'testuser');
    await user.type(screen.getByTestId('password-input'), 'wrongpassword');
    await user.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    axios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<Login onLogin={mockOnLogin} />);
    
    await user.type(screen.getByTestId('username-input'), 'testuser');
    await user.type(screen.getByTestId('password-input'), 'password123');
    await user.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-button')).toBeDisabled();
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
    });
  });
});

