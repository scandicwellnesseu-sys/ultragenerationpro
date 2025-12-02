
import { BulkProduct } from '../types';

function convertToCSV(data: BulkProduct[]): string {
  const headers = [
    'product_title',
    'user_keywords',
    'generated_headline',
    'generated_body',
    'generated_seo_keywords'
  ];
  
  const rows = data.map(product => {
    const title = `"${product.title.replace(/"/g, '""')}"`;
    const keywords = `"${product.keywords.replace(/"/g, '""')}"`;
    const headline = product.description ? `"${product.description.headline.replace(/"/g, '""')}"` : '';
    const body = product.description ? `"${product.description.body.replace(/"/g, '""')}"` : '';
    const seoKeywords = product.description ? `"${product.description.seo_keywords.join(', ').replace(/"/g, '""')}"` : '';
    
    return [title, keywords, headline, body, seoKeywords].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function exportToCsv(products: BulkProduct[], filename: string): void {
  const completedProducts = products.filter(p => p.status === 'done' && p.description);
  if (completedProducts.length === 0) {
    // The calling component is now responsible for alerting the user.
    return;
  }

  const csvString = convertToCSV(completedProducts);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
