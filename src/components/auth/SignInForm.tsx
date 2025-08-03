'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '../../utils/supabaseClient';

interface SignInFormProps {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(result.error || 'Login failed. Please try again.');
      } else {
        setEmail('');
        setPassword('');
        onSuccess?.();
        window.location.href = '/';
      }
    } catch {
      setLoading(false);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow flex flex-col gap-4">
      <h2 className="text-xl font-semibold mb-2 text-center">Login</h2>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Password</span>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
          autoComplete="current-password"
        />
      </label>
      {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors disabled:opacity-60"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Logging In...' : 'Login'}
      </button>
    </form>
  );
} 