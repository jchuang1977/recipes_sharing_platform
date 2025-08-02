'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { validateUsername } from '../../utils/profileUtils';

interface SignUpFormProps {
  onSuccess?: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    // Validate username format
    const usernameValidation = validateUsername(userName);
    if (!usernameValidation.isValid) {
      setError(usernameValidation.error!);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: userName,
          full_name: fullName,
        }
      }
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setEmail('');
      setPassword('');
      setUserName('');
      setFullName('');
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow flex flex-col gap-4">
      <h2 className="text-xl font-semibold mb-2 text-center">Sign Up</h2>
      
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Full Name</span>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
          autoComplete="name"
          placeholder="Enter your full name"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Username</span>
        <input
          type="text"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          required
          pattern="[a-zA-Z0-9_]{3,20}"
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
          autoComplete="username"
          placeholder="Choose a username (3-20 chars)"
        />
        <span className="text-xs text-gray-500">Letters, numbers, and underscores only</span>
      </label>

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
          autoComplete="new-password"
        />
      </label>

      {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
      {success && <div className="text-green-600 text-sm" role="status">Check your email to confirm your account.</div>}
      
      <button
        type="submit"
        className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors disabled:opacity-60"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>
    </form>
  );
} 