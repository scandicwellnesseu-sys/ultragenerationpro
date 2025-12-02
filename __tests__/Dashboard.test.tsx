import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard';
import { AppProvider } from '../context/AppContext';

describe('Dashboard', () => {
  it('visar rubrik och tom produktlista', () => {
    render(
      <AppProvider>
        <Dashboard onNavigate={() => {}} />
      </AppProvider>
    );
    expect(screen.getByText(/Produkter/i)).toBeInTheDocument();
    expect(screen.getByText(/Du har inga nya genereringar\. Skapa en för att komma igång!/i)).toBeInTheDocument();
  });
});
