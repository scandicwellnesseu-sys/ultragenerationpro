import { render, screen } from '@testing-library/react';
import Billing from '../components/Billing';
import { AppProvider } from '../context/AppContext';

describe('Billing', () => {
  it('visar alla prisplaner', () => {
    render(
      <AppProvider>
        <Billing />
      </AppProvider>
    );
    expect(screen.getByText(/Starter/)).toBeInTheDocument();
    expect(screen.getAllByText(/Pro/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Agency/)).toBeInTheDocument();
  });
});
