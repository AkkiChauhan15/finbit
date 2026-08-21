import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AuthContext } from '../auth/AuthContext.js';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';

const renderAuthPage = (page, authValue) =>
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[page === 'login' ? '/login' : '/register']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<p>Dashboard destination</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe('authentication forms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Login validates input and navigates after a successful login', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue({ id: 'user-1' });
    renderAuthPage('login', { login });

    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(login).toHaveBeenCalledWith({
      email: 'alex@example.com',
      password: 'SecurePass123!',
    });
    expect(await screen.findByText('Dashboard destination')).toBeInTheDocument();
  });

  test('Register rejects mismatched passwords and submits normalized form values', async () => {
    const user = userEvent.setup();
    const register = vi.fn().mockResolvedValue({ id: 'user-2' });
    renderAuthPage('register', { register });

    await user.type(screen.getByLabelText('Full name'), '  Alex Morgan  ');
    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), 'SecurePass123!');
    await user.type(screen.getByLabelText('Confirm password'), 'DifferentPass123!');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText('Confirm password'));
    await user.type(screen.getByLabelText('Confirm password'), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(register).toHaveBeenCalledWith({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'SecurePass123!',
    });
    expect(await screen.findByText('Dashboard destination')).toBeInTheDocument();
  });
});
