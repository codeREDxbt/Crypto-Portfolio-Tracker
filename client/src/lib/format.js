export const formatPrice = (n) =>
  n >= 1
    ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${n.toFixed(6)}`;

export const formatPct = (n) => {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n?.toFixed(2)}%`;
};

export const formatMktCap = (n) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n?.toLocaleString()}`;
};

export const pctClass = (n) => n >= 0 ? 'gain-badge' : 'loss-badge';