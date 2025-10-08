import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders kanban app', () => {
  render(<App />);
  const loginElement = screen.getByText(/Iniciar Sesión/i);
  expect(loginElement).toBeInTheDocument();
});
