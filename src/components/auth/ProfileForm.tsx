'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Profile, ProfileFormData } from '@/types/supabase';
import { validateProfileData, formatProfileData } from '../../utils/profileUtils';

interface ProfileFormProps {
  onSuccess?: () => void;
}

export function ProfileForm({ onSuccess }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    user_name: '',
    full_name: '',
    bio: '',
    location: '',
    website: '',
    social_links: {}
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (data) {
        setFormData({
          user_name: data.user_name || '',
          full_name: data.full_name || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          social_links: data.social_links || {}
        });
      }
    } catch {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSuccess(false);

    // Validate form data
    const validation = validateProfileData(formData);
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0]); // Show first error
      setSaving(false);
      return;
    }

    // Format data
    const formattedData = formatProfileData(formData);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          user_name: formattedData.user_name,
          full_name: formattedData.full_name,
          bio: formattedData.bio,
          location: formattedData.location,
          website: formattedData.website,
          social_links: formattedData.social_links
        });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        await fetchProfile(); // Refresh profile data
        onSuccess?.();
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev: ProfileFormData) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData((prev: ProfileFormData) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h2 className="text-2xl font-semibold mb-6 text-center">Edit Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Username</span>
            <input
              type="text"
              value={formData.user_name}
              onChange={e => handleInputChange('user_name', e.target.value)}
              required
              pattern="[a-zA-Z0-9_]{3,20}"
              className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
              placeholder="Choose a username"
            />
            <span className="text-xs text-gray-500">Letters, numbers, and underscores only</span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Full Name</span>
            <input
              type="text"
              value={formData.full_name}
              onChange={e => handleInputChange('full_name', e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
              placeholder="Enter your full name"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Location</span>
            <input
              type="text"
              value={formData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
              placeholder="City, Country"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Website</span>
            <input
              type="url"
              value={formData.website}
              onChange={e => handleInputChange('website', e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
              placeholder="https://your-website.com"
            />
          </label>
        </div>

        <div className="space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Bio</span>
            <textarea
              value={formData.bio}
              onChange={e => handleInputChange('bio', e.target.value)}
              rows={4}
              className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800 resize-none"
              placeholder="Tell us about yourself..."
            />
          </label>

          <div className="space-y-3">
            <span className="text-sm font-medium">Social Links</span>
            
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Twitter</span>
              <input
                type="url"
                value={formData.social_links.twitter || ''}
                onChange={e => handleSocialLinkChange('twitter', e.target.value)}
                className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
                placeholder="https://twitter.com/username"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Instagram</span>
              <input
                type="url"
                value={formData.social_links.instagram || ''}
                onChange={e => handleSocialLinkChange('instagram', e.target.value)}
                className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
                placeholder="https://instagram.com/username"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Facebook</span>
              <input
                type="url"
                value={formData.social_links.facebook || ''}
                onChange={e => handleSocialLinkChange('facebook', e.target.value)}
                className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
                placeholder="https://facebook.com/username"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">YouTube</span>
              <input
                type="url"
                value={formData.social_links.youtube || ''}
                onChange={e => handleSocialLinkChange('youtube', e.target.value)}
                className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
                placeholder="https://youtube.com/@username"
              />
            </label>
          </div>
        </div>
      </div>

      {error && <div className="mt-4 text-red-600 text-sm" role="alert">{error}</div>}
      {success && <div className="mt-4 text-green-600 text-sm" role="status">Profile updated successfully!</div>}
      
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors disabled:opacity-60"
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
} 