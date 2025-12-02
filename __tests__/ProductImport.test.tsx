import { render, screen } from '@testing-library/react';
import ProductImport from '../components/ProductImport';

describe('ProductImport', () => {
  it('visar importformulär', () => {
    render(<ProductImport />);
    expect(screen.getByText(/Importera produktdata/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
