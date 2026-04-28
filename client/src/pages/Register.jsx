import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../lib/auth-client.js';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const { error: err } = await signUp.email({ email, password, name });
    if (err) return setError(err.message);
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-[#111113] border border-[#2a2a2f] rounded-xl p-8 w-full max-w-sm space-y-4">
        <h1 className="text-white text-xl font-semibold">Create account</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          required
          className="w-full bg-[#18181b] border border-[#2a2a2f] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
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
          minLength={8}
          className="w-full bg-[#18181b] border border-[#2a2a2f] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
        >
          Create account
        </button>
        <p className="text-zinc-500 text-sm text-center">
          Already have an account? <a href="/login" className="text-blue-400 hover:text-blue-300">Sign in</a>
        </p>
      </form>
    </div>
  );
}