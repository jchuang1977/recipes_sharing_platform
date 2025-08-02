'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export function AuthHeader() {
  const [user, setUser] = useState<null | { email: string }>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    let ignore = false;
    
    async function getUser() {
      setLoading(true);
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!ignore) {
          if (user && typeof user.email === 'string') {
            setUser({ email: user.email });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
        if (error) {
          console.error('Error getting user:', error);
          if (!ignore) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error in getUser:', error);
        if (!ignore) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!ignore) {
        if (session?.user && typeof session.user.email === 'string') {
          setUser({ email: session.user.email });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <header className="absolute top-0 right-0 w-full flex justify-end p-4 z-10">
        <nav className="flex gap-4">
          <span className="text-gray-500 dark:text-gray-400">Loading...</span>
        </nav>
      </header>
    );
  }

  return (
    <header className="absolute top-0 right-0 w-full flex justify-end p-4 z-10">
      <nav className="flex gap-4">
        {user ? (
          <>
            <span className="text-gray-700 dark:text-gray-200 font-medium">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-green-700 dark:text-green-300 font-semibold hover:underline"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-green-700 dark:text-green-300 font-semibold hover:underline">Login</Link>
            <Link href="/signup" className="text-green-700 dark:text-green-300 font-semibold hover:underline">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
} 