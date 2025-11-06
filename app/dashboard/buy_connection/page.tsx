"use client";
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useEffect } from 'react';

export default function HistoryPage() {

  const UNIT_PRICE = 10; // ₹10 per connection
    const { data: session } = useSession();
  const user=session?.user?.id;

  const [isBuying, setIsBuying] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);

  const handleBuy = async (count: number) => {
    if (isBuying) return;
    if (!user) {
      alert('Please sign in to purchase connections');
      return;
    }
    setIsBuying(true);
    

    try {
      // Send JSON payload with the number of connections to add.
      const res = await fetch('/api/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinsToAdd: count, userId: user }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error('Server error:', json);
        throw new Error(json?.error || 'Failed to add connections');
      }

      alert(`Successfully purchased ${count} connections. New balance: ${json.coins}`);
      // refresh balance
      setCoins(json.coins ?? null);
    } catch (err) {
      console.error('Purchase flow error', err);
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsBuying(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/connection', { method: 'GET', credentials: 'same-origin' });
      const json = await res.json();
      if (res.ok && json?.coins != null) setCoins(json.coins as number);
      else setCoins(0);
    } catch (e) {
      console.error('Failed to fetch balance', e);
      setCoins(0);
    }
  };

  useEffect(() => {
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const packs = [
    { id: "pack-10", count: 10, discount: 0, tag: "Starter" },
    { id: "pack-50", count: 50, discount: 4, tag: "Popular" },
    { id: "pack-100", count: 100, discount: 10, tag: "Best Value" },
  ];

  return (
    <div className="min-h-[60vh] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 bg-white/80 p-3 rounded-lg shadow">
          <div>
            <h1 className="text-2xl font-bold text-green-700">Buy Connections</h1>
            <div className="text-sm text-gray-600">Each connection costs <strong>₹{UNIT_PRICE}</strong></div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Available connections</div>
            <div className="text-xl font-semibold text-gray-900">{coins == null ? '—' : coins}</div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">Each connection costs <strong>₹{UNIT_PRICE}</strong>. Choose a pack below to purchase connections in bulk.</p>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {packs.map((p) => {
            const original = p.count * UNIT_PRICE;
            const discounted = Math.round(original * (1 - (p.discount || 0) / 100));
            const savings = original - discounted;
            return (
              <div key={p.id} className="h-full flex flex-col justify-between border rounded-2xl p-8 shadow-lg hover:shadow-2xl transition bg-white">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-500">{p.tag}</div>
                    {p.discount ? (
                      <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Save {p.discount}%</div>
                    ) : (
                      <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">New</div>
                    )}
                  </div>

                  <div className="text-3xl font-extrabold text-gray-900 mb-2">{p.count} Connections</div>
                  <div className="text-sm text-gray-600 mb-4">Effective unit: <span className="font-medium">₹{(discounted / p.count).toLocaleString("en-IN")}</span></div>

                  <div className="flex items-baseline gap-3 mb-4">
                    <div className="text-2xl font-bold text-green-700">₹{discounted.toLocaleString("en-IN")}</div>
                    {savings > 0 && (
                      <div className="text-sm text-gray-500 line-through">₹{original.toLocaleString("en-IN")}</div>
                    )}
                  </div>

                  {savings > 0 && (
                    <div className="text-sm text-green-600 mb-4">You save ₹{savings.toLocaleString("en-IN")}</div>
                  )}

                  <ul className="text-sm text-gray-600 mb-6 space-y-2">
                    <li>• Instant allocation after purchase</li>
                    <li>• Transferable connections</li>
                    <li>• Priority support</li>
                  </ul>
                </div>

                <button
                  onClick={() => handleBuy(p.count)}
                  className="w-full mt-4 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:scale-105 transition"
                >
                  Buy {p.count} for ₹{discounted.toLocaleString("en-IN")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
