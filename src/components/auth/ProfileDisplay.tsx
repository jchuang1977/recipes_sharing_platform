'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Profile } from '@/types/supabase';
import Link from 'next/link';

interface ProfileDisplayProps {
  userId?: string;
}

export function ProfileDisplay({ userId }: ProfileDisplayProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('User not authenticated');
          return;
        }
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow">
        <div className="text-center text-gray-500">Profile not found</div>
      </div>
    );
  }

  const hasSocialLinks = profile.social_links && Object.keys(profile.social_links).length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {profile.full_name || profile.user_name}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Username:</span>
            <span className="text-gray-900 dark:text-white">@{profile.user_name}</span>
          </div>
          
          {profile.full_name && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name:</span>
              <span className="text-gray-900 dark:text-white">{profile.full_name}</span>
            </div>
          )}
          
          {profile.location && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location:</span>
              <span className="text-gray-900 dark:text-white">{profile.location}</span>
            </div>
          )}
          
          {profile.website && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Website:</span>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 underline"
              >
                {profile.website}
              </a>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Bio</h3>
            <p className="text-gray-900 dark:text-white leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Social Links */}
        {hasSocialLinks && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Social Links</h3>
            <div className="flex flex-wrap gap-3">
              {profile.social_links.twitter && (
                <a
                  href={profile.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Twitter
                </a>
              )}
              {profile.social_links.instagram && (
                <a
                  href={profile.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-pink-500 text-white text-sm rounded hover:bg-pink-600 transition-colors"
                >
                  Instagram
                </a>
              )}
              {profile.social_links.facebook && (
                <a
                  href={profile.social_links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Facebook
                </a>
              )}
              {profile.social_links.youtube && (
                <a
                  href={profile.social_links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>
        )}

        {/* Member Since */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Member since:</span>
            <span className="text-gray-900 dark:text-white">
              {new Date(profile.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 