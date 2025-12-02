import { render, screen } from '@testing-library/react';
import Analytics from '../components/Analytics';

describe('Analytics', () => {
  it('visar rubrik och nyckeltal', () => {
    render(<Analytics />);
    expect(screen.getByText(/Analytics & Insikter/i)).toBeInTheDocument();
    expect(screen.getByText(/Besökare/i)).toBeInTheDocument();
    expect(screen.getByText(/Konverteringar/i)).toBeInTheDocument();
    expect(screen.getByText(/Intäktspåverkan/i)).toBeInTheDocument();
  });
});
