import { render, screen } from '@testing-library/react';
import ActivityLog from '../components/ActivityLog';

describe('ActivityLog', () => {
  it('visar rubrik och loggposter', () => {
    render(<ActivityLog />);
    expect(screen.getByText(/Aktivitetslogg/i)).toBeInTheDocument();
    expect(screen.getByText(/Prisändring/i)).toBeInTheDocument();
    // Använd getAllByText eftersom anna@demo.com förekommer flera gånger i loggen
    expect(screen.getAllByText(/anna@demo.com/i).length).toBeGreaterThan(0);
  });
});
