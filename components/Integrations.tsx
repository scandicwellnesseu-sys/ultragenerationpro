import React, { useState } from 'react';
import Spinner from './Spinner';

const Integrations: React.FC = () => {
  // Shopify
  const [shopUrl, setShopUrl] = useState('');
  const [shopifyToken, setShopifyToken] = useState('');
  const [shopifyStatus, setShopifyStatus] = useState<string | null>(null);
  const [shopifyLoading, setShopifyLoading] = useState(false);

  // WooCommerce
  const [storeUrl, setStoreUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [wooStatus, setWooStatus] = useState<string | null>(null);
  const [wooLoading, setWooLoading] = useState(false);

  // Magento
  const [magentoUrl, setMagentoUrl] = useState('');
  const [magentoToken, setMagentoToken] = useState('');
  const [magentoStatus, setMagentoStatus] = useState<string | null>(null);
  const [magentoLoading, setMagentoLoading] = useState(false);

  // Wix
  const [wixUrl, setWixUrl] = useState('');
  const [wixToken, setWixToken] = useState('');
  const [wixStatus, setWixStatus] = useState<string | null>(null);
  const [wixLoading, setWixLoading] = useState(false);

  // Squarespace
  const [squarespaceUrl, setSquarespaceUrl] = useState('');
  const [squarespaceToken, setSquarespaceToken] = useState('');
  const [squarespaceStatus, setSquarespaceStatus] = useState<string | null>(null);
  const [squarespaceLoading, setSquarespaceLoading] = useState(false);

  const connectShopify = async () => {
    setShopifyLoading(true);
    setShopifyStatus(null);
    try {
      const mockRequest = new Request('http://localhost/functions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connectShopify', payload: { shopUrl, accessToken: shopifyToken } })
      });
      // @ts-ignore
      const handler = (await import('../functions/generate')).default;
      const response = await handler(mockRequest);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Kunde inte ansluta till Shopify');
      setShopifyStatus('Ansluten!');
    } catch (e: any) {
      setShopifyStatus(e.message);
    } finally {
      setShopifyLoading(false);
    }
  };

  const connectWooCommerce = async () => {
    setWooLoading(true);
    setWooStatus(null);
    try {
      const mockRequest = new Request('http://localhost/functions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connectWooCommerce', payload: { storeUrl, consumerKey, consumerSecret } })
      });
      // @ts-ignore
      const handler = (await import('../functions/generate')).default;
      const response = await handler(mockRequest);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Kunde inte ansluta till WooCommerce');
      setWooStatus('Ansluten!');
    } catch (e: any) {
      setWooStatus(e.message);
    } finally {
      setWooLoading(false);
    }
  };

  const connectMagento = async () => {
    setMagentoLoading(true);
    setMagentoStatus(null);
    try {
      // Mock: simulera lyckad anslutning
      await new Promise(r => setTimeout(r, 700));
      setMagentoStatus('Ansluten!');
    } catch (e: any) {
      setMagentoStatus(e.message);
    } finally {
      setMagentoLoading(false);
    }
  };

  const connectWix = async () => {
    setWixLoading(true);
    setWixStatus(null);
    try {
      await new Promise(r => setTimeout(r, 700));
      setWixStatus('Ansluten!');
    } catch (e: any) {
      setWixStatus(e.message);
    } finally {
      setWixLoading(false);
    }
  };

  const connectSquarespace = async () => {
    setSquarespaceLoading(true);
    setSquarespaceStatus(null);
    try {
      await new Promise(r => setTimeout(r, 700));
      setSquarespaceStatus('Ansluten!');
    } catch (e: any) {
      setSquarespaceStatus(e.message);
    } finally {
      setSquarespaceLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Integrationer</h2>
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Shopify</h3>
        <input type="text" placeholder="Shopify URL" value={shopUrl} onChange={e => setShopUrl(e.target.value)} className="mb-2 w-full px-2 py-1 rounded border" />
        <input type="text" placeholder="Admin API Token" value={shopifyToken} onChange={e => setShopifyToken(e.target.value)} className="mb-2 w-full px-2 py-1 rounded border" />
        <button onClick={connectShopify} disabled={shopifyLoading} className="bg-green-600 text-white px-4 py-2 rounded">
          {shopifyLoading ? <Spinner /> : 'Koppla Shopify'}
        </button>
        {shopifyStatus && <div className="mt-2 text-sm text-green-400">{shopifyStatus}</div>}
      </div>
      <div>
        <h3 className="font-semibold mb-2">WooCommerce</h3>
        <input type="text" placeholder="WooCommerce URL" value={storeUrl} onChange={e => setStoreUrl(e.target.value)} className="mb-2 w-full px-2 py-1 rounded border" />
        <input type="text" placeholder="Consumer Key" value={consumerKey} onChange={e => setConsumerKey(e.target.value)} className="mb-2 w-full px-2 py-1 rounded border" />
        <input type="text" placeholder="Consumer Secret" value={consumerSecret} onChange={e => setConsumerSecret(e.target.value)} className="mb-2 w-full px-2 py-1 rounded border" />
        <button onClick={connectWooCommerce} disabled={wooLoading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {wooLoading ? <Spinner /> : 'Koppla WooCommerce'}
        </button>
        {wooStatus && <div className="mt-2 text-sm text-blue-400">{wooStatus}</div>}
      </div>

      {/* Magento */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Magento</h3>
        <input type="text" placeholder="Magento URL" value={magentoUrl} onChange={e => setMagentoUrl(e.target.value)} className="mb-2 w-full px-2 py-1 rounded border" />
        <input type="text" placeholder="API Token" value={magentoToken} onChange={e => setMagentoToken(e.target.value)} className="mb-2 w-full px-2 py-1 rounded border" />
        <button onClick={connectMagento} disabled={magentoLoading} className="bg-orange-600 text-white px-4 py-2 rounded">
          {magentoLoading ? <Spinner /> : 'Koppla Magento'}
        </button>
        {magentoStatus && <div className="mt-2 text-sm text-orange-400">{magentoStatus}</div>}
      </div>

      {/* Wix */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Wix</h3>
        <input type="text" placeholder="Wix URL" value={wixUrl} onChange={e => setWixUrl(e.target.value)} className="mb-2 w-full px-2 py-1 rounded border" />
        <input type="text" placeholder="API Token" value={wixToken} onChange={e => setWixToken(e.target.value)} className="mb-2 w-full px-2 py-1 rounded border" />
        <button onClick={connectWix} disabled={wixLoading} className="bg-purple-600 text-white px-4 py-2 rounded">
          {wixLoading ? <Spinner /> : 'Koppla Wix'}
        </button>
        {wixStatus && <div className="mt-2 text-sm text-purple-400">{wixStatus}</div>}
      </div>

      {/* Squarespace */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Squarespace</h3>
        <input type="text" placeholder="Squarespace URL" value={squarespaceUrl} onChange={e => setSquarespaceUrl(e.target.value)} className="mb-2 w-full px-2 py-1 rounded border" />
        <input type="text" placeholder="API Token" value={squarespaceToken} onChange={e => setSquarespaceToken(e.target.value)} className="mb-2 w-full px-2 py-1 rounded border" />
        <button onClick={connectSquarespace} disabled={squarespaceLoading} className="bg-gray-600 text-white px-4 py-2 rounded">
          {squarespaceLoading ? <Spinner /> : 'Koppla Squarespace'}
        </button>
        {squarespaceStatus && <div className="mt-2 text-sm text-gray-400">{squarespaceStatus}</div>}
      </div>
    </div>
  );
};

export default Integrations;
