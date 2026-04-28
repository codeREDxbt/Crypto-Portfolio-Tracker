import { usePortfolio } from '../hooks/usePortfolio.js';
import { useBatchPrices, useMarkets } from '../hooks/usePrices.js';
import { formatPrice, formatPct, pctClass } from '../lib/format.js';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon, Activity } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Dashboard() {
  const { data: holdings = [], isLoading } = usePortfolio();

  const coinIds = holdings.map(h => h.coinSymbol).join(',');
  const { data: prices = {} } = useBatchPrices(coinIds);
  const { data: markets = [], isLoading: marketsLoading } = useMarkets(1);
  const topMarkets = markets.slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 skeleton" />)}
        </div>
        <div className="h-64 skeleton" />
      </div>
    );
  }

  let totalValue = 0;
  let totalCost = 0;
  const chartData = holdings.map((h, i) => {
    const priceData = prices[h.coinSymbol.toLowerCase()];
    const currentPrice = priceData?.usd || 0;
    const value = h.quantity * currentPrice;
    const cost = h.quantity * h.avgBuyPrice;
    totalValue += value;
    totalCost += cost;
    return {
      name: h.coinSymbol.toUpperCase(),
      value,
      color: COLORS[i % COLORS.length],
    };
  }).filter(d => d.value > 0);

  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#111113] border border-[#2a2a2f] rounded-xl p-5">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            <Wallet size={16} />
            <span>Total Value</span>
          </div>
          <p className="text-2xl font-semibold text-white price">{formatPrice(totalValue)}</p>
        </div>

        <div className="bg-[#111113] border border-[#2a2a2f] rounded-xl p-5">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            {pnl >= 0 ? <TrendingUp size={16} className="text-green-400" /> : <TrendingDown size={16} className="text-red-400" />}
            <span>Total P&L</span>
          </div>
          <p className={`text-2xl font-semibold price ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : ''}{formatPrice(pnl)} ({formatPct(pnlPct)})
          </p>
        </div>

        <div className="bg-[#111113] border border-[#2a2a2f] rounded-xl p-5">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            <PieChartIcon size={16} />
            <span>Holdings</span>
          </div>
          <p className="text-2xl font-semibold text-white">{holdings.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {chartData.length > 0 && (
          <div className="lg:col-span-2 bg-[#111113] border border-[#2a2a2f] rounded-xl p-5">
            <h2 className="text-white font-medium mb-4 flex items-center gap-2">
              <PieChartIcon size={18} className="text-blue-400" />
              Portfolio Allocation
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #2a2a2f', borderRadius: '8px' }}
                    itemStyle={{ color: '#f0f0f2' }}
                    formatter={(value) => [formatPrice(value), 'Value']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className={`${chartData.length > 0 ? 'lg:col-span-1' : 'lg:col-span-3'} bg-[#111113] border border-[#2a2a2f] rounded-xl p-5 flex flex-col`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium flex items-center gap-2">
              <Activity size={18} className="text-amber-400" />
              Top Markets
            </h2>
            <a href="/market" className="text-blue-400 text-xs hover:underline">View All</a>
          </div>
          
          <div className="flex-1 space-y-4">
            {marketsLoading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 skeleton" />)
            ) : topMarkets.map(coin => (
              <div key={coin.id} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <img 
                    src={coin.image} 
                    alt={coin.name} 
                    className="w-6 h-6 rounded-full bg-[#2a2a2f]" 
                    onError={(e) => {
                      if (e.target.src.includes('raw.githubusercontent.com')) {
                        e.target.src = `https://bin.bnbstatic.com/static/images/market/symbol/${coin.symbol.toLowerCase()}.png`;
                      } else {
                        e.target.src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=2a2a2f&color=fff`;
                      }
                    }}
                  />
                  <div>
                    <p className="text-white text-sm font-medium leading-none mb-1">{coin.name}</p>
                    <p className="text-zinc-500 text-xs leading-none">{coin.symbol.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-mono leading-none mb-1">{formatPrice(coin.current_price)}</p>
                  <p className={`text-xs font-mono leading-none ${pctClass(coin.price_change_percentage_24h)}`}>
                    {formatPct(coin.price_change_percentage_24h)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {holdings.length === 0 && !marketsLoading && (
        <div className="text-center py-12 text-zinc-500 bg-[#111113] border border-[#2a2a2f] border-dashed rounded-xl">
          <p>Your portfolio is currently empty.</p>
          <p className="text-xs mt-1">Add coins from the Market tab to start tracking.</p>
        </div>
      )}
    </div>
  );
}