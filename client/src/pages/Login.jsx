import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../lib/auth-client.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const { error: err } = await signIn.email({ email, password });
    if (err) return setError(err.message);
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-[#111113] border border-[#2a2a2f] rounded-xl p-8 w-full max-w-sm space-y-4">
        <h1 className="text-white text-xl font-semibold">Sign in</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full bg-[#18181b] border border-[#2a2a2f] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full bg-[#18181b] border border-[#2a2a2f] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
        >
          Sign in
        </button>
        <p className="text-zinc-500 text-sm text-center">
          No account? <a href="/register" className="text-blue-400 hover:text-blue-300">Register</a>
        </p>
      </form>
    </div>
  );
}