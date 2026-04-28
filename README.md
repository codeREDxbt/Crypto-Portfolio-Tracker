# 🌌 Crypto Portfolio Tracker

A premium, state-of-the-art cryptocurrency portfolio management system built for the modern investor. Track your holdings, monitor market trends, and set smart alerts with a sleek, high-performance interface.

![Project Banner](https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=1200&h=400)

## ✨ Features

- **📊 Real-time Dashboard**: Unified view of your portfolio's total value, P&L, and asset allocation.
- **📈 Advanced Market Insights**: Interactive sparklines and detailed price charts powered by CoinGecko.
- **⭐ Smart Watchlist**: Keep an eye on your favorite assets with real-time price updates and 24h change indicators.
- **🔔 Price Alerts**: Never miss a move. Set "Above" or "Below" target price alerts for any coin.
- **💼 Portfolio Management**: Seamlessly add, update, and track holdings with average buy price and quantity metrics.
- **🌗 Premium UI/UX**: Dark-mode first design with glassmorphism, smooth transitions, and responsive layouts.

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** (Ultra-fast development & bundling)
- **TailwindCSS** (Custom premium styling)
- **TanStack Query (v5)** (High-performance data fetching & caching)
- **Recharts** (Professional-grade visualization)
- **Lucide React** (Beautifully consistent iconography)

### Backend
- **Node.js** + **Express 5**
- **Drizzle ORM** (Type-safe SQL interactions)
- **SQLite** (Lightweight, high-performance database)
- **Better-Auth** (Secure authentication framework)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/crypto-portfolio-tracker.git
   cd crypto-portfolio-tracker
   ```

2. **Setup Server**
   ```bash
   cd server
   npm install
   cp .env.example .env # Add your CoinGecko API Key
   npm run db:push     # Initialize the database
   npm run dev         # Start server on http://localhost:3001
   ```

3. **Setup Client**
   ```bash
   cd ../client
   npm install
   npm run dev         # Start client on http://localhost:5173
   ```

## 🔑 Configuration

Create a `.env` file in the `server` directory:

```env
PORT=3001
COINGECKO_API_KEY=your_key_here
BETTER_AUTH_SECRET=your_random_secret
BETTER_AUTH_URL=http://localhost:3001
```

> [!TIP]
> While a CoinGecko API key is optional for limited testing, it is highly recommended to avoid rate limits for the best experience.

## 📱 Screenshots

| Dashboard | Market |
| :---: | :---: |
| ![Dashboard](./Dashboard.png) | ![Market](./Market.png) |

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ⚡ by Antigravity AI.
