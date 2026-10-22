import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AI Life OS branding', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/AI Life OS/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
