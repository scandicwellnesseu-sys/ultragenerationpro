import React, { useState } from 'react';

interface ApprovePriceButtonProps {
  productId: string;
  newPrice: number;
}

const ApprovePriceButton: React.FC<ApprovePriceButtonProps> = ({ productId, newPrice }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      // Här bör du anropa din backend, mockas nu
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <button onClick={handleApprove} disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded font-semibold hover:bg-green-700 transition mb-1">
        {loading ? 'Uppdaterar...' : 'Godkänn prisförslag'}
      </button>
      <label className="text-xs text-gray-400 flex items-center">
        <input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} className="mr-1" />
        Automatisk ändring varje natt kl 02:00
      </label>
      {success && <span className="text-green-400 text-xs mt-1">Pris uppdaterat!</span>}
      {error && <span className="text-red-400 text-xs mt-1">{error}</span>}
    </div>
  );
};

export default ApprovePriceButton;
