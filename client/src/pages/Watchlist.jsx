import { useState } from 'react';
import { useWatchlist, useRemoveFromWatchlist, useCreateAlert, useDeleteAlert } from '../hooks/useWatchlist.js';
import { useBatchPrices } from '../hooks/usePrices.js';
import { formatPrice, formatPct, pctClass } from '../lib/format.js';
import { Bell, TrendingUp, TrendingDown, X, RefreshCw } from 'lucide-react';

function AlertDrawer({ coin, onClose }) {
  const [condition, setCondition] = useState('above');
  const [targetPrice, setTargetPrice] = useState('');
  const { data: alerts = [], isLoading: alertsLoading } = useAlerts(coin.coinId);
  const createAlert = useCreateAlert();
  const deleteAlert = useDeleteAlert();

  async function handleCreateAlert() {
    if (!targetPrice) return;
    try {
      await createAlert.mutateAsync({
        coinId: coin.coinId,
        coinSymbol: coin.coinSymbol,
        condition,
        targetPrice: parseFloat(targetPrice),
      });
      setTargetPrice('');
    } catch (err) {
      console.error('Failed to create alert:', err);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-[#111113] border-l border-[#2a2a2f] z-50 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a2f]">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-zinc-400" />
          <span className="text-white text-sm font-medium">Alerts — {coin.coinSymbol}</span>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Active Alerts</p>
        {alertsLoading ? (
          <div className="space-y-2">
            <div className="h-10 skeleton" />
            <div className="h-10 skeleton" />
          </div>
        ) : alerts.length === 0 ? (
          <p className="text-zinc-600 text-sm">No alerts set.</p>
        ) : null}
        {alerts.map(alert => (
          <div key={alert.id} className="flex items-center justify-between bg-[#18181b] border border-[#2a2a2f] rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              {alert.condition === 'above'
                ? <TrendingUp size={14} className="text-green-400" />
                : <TrendingDown size={14} className="text-red-400" />}
              <span className="text-white text-sm font-mono">
                {alert.condition === 'above' ? '↑' : '↓'} ${alert.targetPrice.toLocaleString()}
              </span>
              {alert.isTriggered && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">TRIGGERED</span>
              )}
            </div>
            <button onClick={() => deleteAlert.mutate(alert.id)} className="text-zinc-500 hover:text-red-400">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#2a2a2f] space-y-3">
        <p className="text-zinc-500 text-xs uppercase tracking-wider">Add Alert</p>
        <div className="flex gap-2">
          <button
            onClick={() => setCondition('above')}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
              condition === 'above'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-zinc-400 border border-[#2a2a2f]'
            }`}
          >
            ↑ Above
          </button>
          <button
            onClick={() => setCondition('below')}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
              condition === 'below'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-zinc-400 border border-[#2a2a2f]'
            }`}
          >
            ↓ Below
          </button>
        </div>
        <input
          type="number"
          value={targetPrice}
          onChange={e => setTargetPrice(e.target.value)}
          placeholder="Target price (USD)"
          className="w-full bg-[#18181b] border border-[#2a2a2f] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleCreateAlert}
          disabled={!targetPrice || createAlert.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg py-2 text-sm font-medium transition-colors"
        >
          {createAlert.isPending ? 'Creating...' : '+ Create Alert'}
        </button>
      </div>
    </div>
  );
}

export default function Watchlist() {
  const { data, isLoading, isError, refetch } = useWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const items = Array.isArray(data) ? data : [];

  const coinIds = items.map(i => i.coinSymbol).filter(Boolean).join(',');
  const { data: prices } = useBatchPrices(coinIds);

  const [alertCoin, setAlertCoin] = useState(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Watchlist</h1>
        {[1, 2, 3].map(i => <div key={i} className="h-16 skeleton" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Watchlist</h1>
        <div className="text-center py-12 text-red-400 bg-[#111113] border border-[#2a2a2f] rounded-xl">
          <p>Failed to load watchlist.</p>
          <button
            onClick={() => refetch()}
            className="mt-2 flex items-center gap-2 mx-auto text-blue-400 hover:text-blue-300"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Watchlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-[#111113] border border-[#2a2a2f] rounded-xl">
          <p>Your watchlist is empty. Add coins from the Market page.</p>
        </div>
      ) : (
        <div className="bg-[#111113] border border-[#2a2a2f] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2f]">
                <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">Coin</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">Price</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">24h</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">Alert</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const priceData = prices?.[item.coinSymbol.toLowerCase()];
                const hasError = !!prices?.error;
                return (
                  <tr key={item.id || item.coinId} className="border-b border-[#2a2a2f] last:border-0 hover:bg-[#18181b]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.coinImage && (
                          <img 
                            src={item.coinImage} 
                            alt={item.coinName} 
                            className="w-8 h-8 rounded-full bg-[#2a2a2f]" 
                            onError={(e) => {
                              if (e.target.src.includes('assets.coincap.io')) {
                                e.target.src = `https://bin.bnbstatic.com/static/images/market/symbol/${item.coinSymbol.toLowerCase()}.png`;
                              } else if (e.target.src.includes('bnbstatic.com')) {
                                e.target.src = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${item.coinSymbol.toLowerCase()}.png`;
                              } else {
                                e.target.src = `https://ui-avatars.com/api/?name=${item.coinSymbol}&background=2a2a2f&color=fff`;
                              }
                            }}
                          />
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">{item.coinName}</p>
                          <p className="text-zinc-500 text-xs">{item.coinSymbol?.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right text-white text-sm font-mono px-4 py-3">
                      {priceData ? formatPrice(priceData.usd) : hasError ? <span className="text-red-400/50 text-[10px]">Error</span> : '-'}
                    </td>
                    <td className={`text-right text-sm font-mono px-4 py-3 ${priceData ? pctClass(priceData.usd_24h_change) : ''}`}>
                      {priceData ? formatPct(priceData.usd_24h_change) : '-'}
                    </td>
                    <td className="text-right px-4 py-3">
                      <button
                        onClick={() => setAlertCoin(item)}
                        className="text-zinc-500 hover:text-amber-400 p-1"
                      >
                        <Bell size={16} />
                      </button>
                    </td>
                    <td className="text-right px-4 py-3">
                      <button
                        onClick={() => removeFromWatchlist.mutate(item.id)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {alertCoin && <AlertDrawer coin={alertCoin} onClose={() => setAlertCoin(null)} />}
    </div>
  );
}