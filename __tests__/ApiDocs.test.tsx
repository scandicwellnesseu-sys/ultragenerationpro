import { render, screen } from '@testing-library/react';
import ApiDocs from '../components/ApiDocs';

describe('ApiDocs', () => {
  it('visar rubrik och endpoints', () => {
    render(<ApiDocs />);
    expect(screen.getByText(/API-dokumentation/i)).toBeInTheDocument();
    expect(screen.getByText(/Endpoints/i)).toBeInTheDocument();
    expect(screen.getByText(/Generera ny API-nyckel/i)).toBeInTheDocument();
  });
});
