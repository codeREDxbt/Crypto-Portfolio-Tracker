import { useState } from 'react';
import { usePortfolio, useAddHolding, useUpdateHolding, useDeleteHolding } from '../hooks/usePortfolio.js';
import { useSearchCoins } from '../hooks/usePrices.js';
import { formatPrice, pctClass } from '../lib/format.js';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';

function AddCoinModal({ onClose, onAdd }) {
  const [query, setQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [notes, setNotes] = useState('');

  const { data: results = [] } = useSearchCoins(query);
  const addHolding = useAddHolding();

  function handleSelect(coin) {
    setSelectedCoin(coin);
    setQuery('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedCoin || !quantity || !avgBuyPrice) return;

    await addHolding.mutateAsync({
      coinId: selectedCoin.id,
      coinSymbol: selectedCoin.symbol,
      coinName: selectedCoin.name,
      coinImage: selectedCoin.large || selectedCoin.thumb,
      quantity: parseFloat(quantity),
      avgBuyPrice: parseFloat(avgBuyPrice),
      notes: notes || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111113] border border-[#2a2a2f] rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-lg font-semibold">Add to Portfolio</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {!selectedCoin ? (
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search coins..."
                className="w-full bg-[#18181b] border border-[#2a2a2f] rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {results.map(coin => (
                <button
                  key={coin.id}
                  onClick={() => handleSelect(coin)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#18181b] transition-colors"
                >
                  <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full" />
                  <span className="text-white text-sm">{coin.name}</span>
                  <span className="text-zinc-500 text-xs">{coin.symbol.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#18181b] rounded-lg">
              <img src={selectedCoin.large || selectedCoin.thumb} alt={selectedCoin.name} className="w-8 h-8 rounded-full" />
              <div>
                <p className="text-white text-sm font-medium">{selectedCoin.name}</p>
                <p className="text-zinc-500 text-xs">{selectedCoin.symbol.toUpperCase()}</p>
              </div>
              <button type="button" onClick={() => setSelectedCoin(null)} className="ml-auto text-zinc-500 hover:text-white text-xs">
                Change
              </button>
            </div>

            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-wider">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="0.00"
                step="any"
                required
                className="w-full bg-[#18181b] border border-[#2a2a2f] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500 mt-1"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-wider">Avg. Buy Price (USD)</label>
              <input
                type="number"
                value={avgBuyPrice}
                onChange={e => setAvgBuyPrice(e.target.value)}
                placeholder="0.00"
                step="any"
                required
                className="w-full bg-[#18181b] border border-[#2a2a2f] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500 mt-1"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-wider">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes..."
                className="w-full bg-[#18181b] border border-[#2a2a2f] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={addHolding.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg py-2 text-sm font-medium transition-colors mt-2"
            >
              {addHolding.isPending ? 'Adding...' : 'Add to Portfolio'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { data: holdings = [], isLoading } = usePortfolio();
  const [showAddModal, setShowAddModal] = useState(false);
  const deleteHolding = useDeleteHolding();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-white">Portfolio</h1>
        </div>
        {[1, 2, 3].map(i => <div key={i} className="h-16 skeleton" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Portfolio</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Coin
        </button>
      </div>

      {holdings.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-[#111113] border border-[#2a2a2f] rounded-xl">
          <p>No holdings yet. Click "Add Coin" to get started.</p>
        </div>
      ) : (
        <div className="bg-[#111113] border border-[#2a2a2f] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2f]">
                <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">Coin</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">Quantity</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">Avg. Buy</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">Value</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">P&L</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(holding => (
                <tr key={holding.id} className="border-b border-[#2a2a2f] last:border-0 hover:bg-[#18181b]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {holding.coinImage && (
                        <img src={holding.coinImage} alt={holding.coinName} className="w-6 h-6 rounded-full" />
                      )}
                      <div>
                        <p className="text-white text-sm font-medium">{holding.coinName}</p>
                        <p className="text-zinc-500 text-xs">{holding.coinSymbol.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right text-white text-sm font-mono px-4 py-3">{holding.quantity}</td>
                  <td className="text-right text-white text-sm font-mono px-4 py-3">{formatPrice(holding.avgBuyPrice)}</td>
                  <td className="text-right text-white text-sm font-mono px-4 py-3">-</td>
                  <td className="text-right text-zinc-500 text-sm font-mono px-4 py-3">-</td>
                  <td className="text-right px-4 py-3">
                    <button
                      onClick={() => deleteHolding.mutate(holding.id)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && <AddCoinModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}