import { render, screen } from '@testing-library/react';
import Integrations from '../components/Integrations';

describe('Integrations', () => {
  it('visar Shopify och WooCommerce API-fält', () => {
    render(<Integrations />);
    expect(screen.getAllByText(/Shopify/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WooCommerce/i).length).toBeGreaterThan(0);
  });
});
