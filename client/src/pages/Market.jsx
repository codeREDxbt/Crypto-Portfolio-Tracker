import { useState, useRef, useCallback, useEffect } from 'react';
import { useInfiniteMarkets } from '../hooks/useInfiniteMarkets.js';
import { useSearchCoins, useCoinChart } from '../hooks/usePrices.js';
import { useAddToWatchlist } from '../hooks/useWatchlist.js';
import api from '../lib/api.js';
import { formatPrice, formatPct, formatMktCap, pctClass } from '../lib/format.js';
import { Search, TrendingUp, TrendingDown, X, Star, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PERIODS = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
];

function CoinDetailDrawer({ coin, onClose }) {
  const [days, setDays] = useState(7);
  const [added, setAdded] = useState(false);
  const { data: chartData, isLoading: chartLoading, isError: chartError } = useCoinChart(coin.symbol, days);
  const addToWatchlist = useAddToWatchlist();

  const formattedData = chartData?.prices?.map(([timestamp, price]) => ({
    time: new Date(timestamp).toLocaleDateString(),
    price: parseFloat(price.toFixed(2)),
  })) ?? [];

  const isPositive = formattedData.length > 1
    ? (formattedData.at(-1)?.price ?? 0) >= (formattedData[0]?.price ?? 0)
    : true;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';

  const priceChange = coin.market_data?.price_change_percentage_24h ?? coin.price_change_percentage_24h ?? 0;
  const marketCap = coin.market_data?.market_cap?.usd ?? coin.market_cap ?? 0;
  const volume = coin.market_data?.total_volume?.usd ?? coin.total_volume ?? 0;
  const ath = coin.market_data?.ath?.usd ?? coin.ath ?? 0;
  const currentPrice = coin.market_data?.current_price?.usd ?? coin.current_price ?? 0;
  const circulating = coin.market_data?.circulating_supply ?? coin.circulating_supply ?? 0;

  async function handleAddToWatchlist() {
    try {
      await addToWatchlist.mutateAsync({
        coinId: coin.id,
        coinSymbol: coin.symbol,
        coinName: coin.name,
        coinImage: coin.image?.large || coin.image || coin.thumb,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#111113] border-l border-[#2a2a2f] z-50 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a2f]">
        <div className="flex items-center gap-3">
          <img src={coin.image?.large || coin.image || coin.thumb} alt={coin.name} className="w-8 h-8 rounded-full" />
          <div>
            <span className="text-white font-medium">{coin.name}</span>
            <span className="text-zinc-500 text-sm ml-2">{coin.symbol?.toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToWatchlist}
            disabled={added}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              added
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-zinc-400 hover:text-amber-400 border border-[#2a2a2f] hover:border-amber-400/30'
            }`}
          >
            {added ? <Check size={14} /> : <Star size={14} />}
            {added ? 'Added' : 'Watchlist'}
          </button>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-[#2a2a2f]">
        <p className="text-2xl font-semibold text-white price">{formatPrice(currentPrice)}</p>
        <p className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {priceChange >= 0 ? <TrendingUp size={14} className="inline" /> : <TrendingDown size={14} className="inline" />}
          {' '}{formatPct(priceChange)}
        </p>
      </div>

      <div className="p-4">
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Price Chart</p>
        <div className="flex gap-1 mb-4">
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                days === p.days ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {chartLoading ? (
          <div className="h-48 skeleton" />
        ) : chartError || chartData?.error ? (
          <div className="h-48 flex items-center justify-center text-red-400 text-sm bg-red-400/5 rounded-lg border border-red-400/10 px-4 text-center">
            {chartData?.error || 'Failed to load chart data. Binance rate limit may have been reached.'}
          </div>
        ) : formattedData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #2a2a2f', borderRadius: '8px' }}
                  labelStyle={{ color: '#71717a', fontSize: '12px' }}
                  itemStyle={{ color: '#f0f0f2', fontFamily: 'monospace' }}
                  formatter={v => [`$${v.toLocaleString()}`, 'Price']}
                />
                <Area type="monotone" dataKey="price" stroke={strokeColor} strokeWidth={1.5} fill="url(#priceGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
            No chart data available
          </div>
        )}
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-zinc-500 text-xs">Market Cap</p>
            <p className="text-white text-sm font-mono">{formatMktCap(marketCap)}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">24h Volume</p>
            <p className="text-white text-sm font-mono">{formatMktCap(volume)}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Circulating Supply</p>
            <p className="text-white text-sm font-mono">{circulating ? circulating.toLocaleString() : '-'}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">ATH</p>
            <p className="text-white text-sm font-mono">{formatPrice(ath)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniSparkline({ coin }) {
  if (!coin.sparkline_in_7d?.price || coin.sparkline_in_7d.price.length < 2) return null;

  const points = coin.sparkline_in_7d.price;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const pathData = points.map((p, i) => {
    const x = (i / Math.max(1, points.length - 1)) * 60;
    const y = 20 - ((p - min) / (range || 1)) * 18;
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height="20" className="ml-auto">
      <path d={pathData} fill="none" stroke={coin.price_change_percentage_24h >= 0 ? '#22c55e' : '#ef4444'} strokeWidth="1.5" />
    </svg>
  );
}

export default function Market() {
  const [search, setSearch] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteMarkets();
  const { data: searchResults = [] } = useSearchCoins(search);

  const coins = data?.pages.flatMap(page => page) ?? [];

  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;
    
    // Disconnect previous observer if any
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(handleObserver, { 
      threshold: 0.1,
      rootMargin: '100px' // Start loading before it hits the viewport
    });
    observerRef.current.observe(element);

    return () => observerRef.current?.disconnect();
  }, [handleObserver, coins.length]); // Re-observe when coins change

  async function handleSelectCoin(coin) {
    try {
      const fullCoinData = await api.get(`/api/prices/coin/${coin.symbol}`);
      setSelectedCoin({ ...coin, ...fullCoinData });
    } catch (err) {
      setSelectedCoin({
        ...coin,
        market_data: {
          current_price: { usd: 0 },
          market_cap: { usd: 0 },
          total_volume: { usd: 0 },
          ath: { usd: 0 },
          circulating_supply: 0,
          price_change_percentage_24h: 0,
        },
        sparkline_in_7d: { price: [] },
      });
    }
  }

  const displayCoins = search ? searchResults : coins;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Market</h1>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search coins..."
          className="w-full bg-[#111113] border border-[#2a2a2f] rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {search && searchResults.length > 0 && (
        <div className="bg-[#111113] border border-[#2a2a2f] rounded-xl overflow-hidden mb-4">
          {searchResults.map(coin => (
            <button
              key={coin.id}
              onClick={() => handleSelectCoin(coin)}
              className="w-full flex items-center gap-3 p-3 hover:bg-[#18181b] transition-colors border-b border-[#2a2a2f] last:border-0"
            >
              <img src={coin.thumb} alt={coin.name} className="w-8 h-8 rounded-full" />
              <div className="text-left flex-1">
                <p className="text-white text-sm font-medium">{coin.name}</p>
                <p className="text-zinc-500 text-xs">{coin.symbol.toUpperCase()}</p>
              </div>
              <span className="text-zinc-500 text-xs">{coin.market_cap_rank || '-'}</span>
            </button>
          ))}
        </div>
      )}

      {!search && (
        <div className="bg-[#111113] border border-[#2a2a2f] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2f]">
                <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">#</th>
                <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">Coin</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">Price</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">24h</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">Market Cap</th>
                <th className="text-right text-zinc-500 text-xs uppercase tracking-wider px-4 py-3">7d Chart</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin, index) => (
                <tr
                  key={coin.id}
                  className="border-b border-[#2a2a2f] last:border-0 hover:bg-[#18181b] cursor-pointer"
                  onClick={() => setSelectedCoin(coin)}
                >
                  <td className="px-4 py-3 text-zinc-500 text-sm">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={coin.image} 
                        alt={coin.name} 
                        className="w-6 h-6 rounded-full bg-[#2a2a2f]" 
                        onError={(e) => {
                          if (e.target.src.includes('assets.coincap.io')) {
                            e.target.src = `https://bin.bnbstatic.com/static/images/market/symbol/${coin.symbol.toLowerCase()}.png`;
                          } else if (e.target.src.includes('bnbstatic.com')) {
                            e.target.src = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${coin.symbol.toLowerCase()}.png`;
                          } else {
                            e.target.src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=2a2a2f&color=fff`;
                          }
                        }}
                      />
                      <div>
                        <p className="text-white text-sm font-medium">{coin.name}</p>
                        <p className="text-zinc-500 text-xs">{coin.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right text-white text-sm font-mono px-4 py-3">{formatPrice(coin.current_price)}</td>
                  <td className={`text-right text-sm font-mono px-4 py-3 ${pctClass(coin.price_change_percentage_24h)}`}>
                    {formatPct(coin.price_change_percentage_24h)}
                  </td>
                  <td className="text-right text-white text-sm font-mono px-4 py-3">{formatMktCap(coin.market_cap)}</td>
                  <td className="px-4 py-3">
                    <MiniSparkline coin={coin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div ref={loadMoreRef} className="p-4 text-center">
            {isFetchingNextPage && <div className="text-zinc-500 text-sm">Loading more...</div>}
            {!hasNextPage && coins.length > 0 && <div className="text-zinc-500 text-sm">No more coins</div>}
          </div>
        </div>
      )}

      {selectedCoin && <CoinDetailDrawer coin={selectedCoin} onClose={() => setSelectedCoin(null)} />}
    </div>
  );
}