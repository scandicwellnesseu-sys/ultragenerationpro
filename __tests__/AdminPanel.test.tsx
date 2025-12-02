import { render, screen } from '@testing-library/react';
import AdminPanel from '../components/AdminPanel';

describe('AdminPanel', () => {
  it('visar rubrik och användarlista', () => {
    render(<AdminPanel />);
    expect(screen.getByText(/Adminpanel/i)).toBeInTheDocument();
    expect(screen.getByText(/Anna Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Erik User/i)).toBeInTheDocument();
  });
});
