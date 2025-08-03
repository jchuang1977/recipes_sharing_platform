import { ProfileFormData } from '@/types/supabase';

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 20) {
    return { isValid: false, error: 'Username must be no more than 20 characters long' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { isValid: true };
}

export function validateProfileData(data: ProfileFormData): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Validate username
  const usernameValidation = validateUsername(data.user_name);
  if (!usernameValidation.isValid) {
    errors.user_name = usernameValidation.error!;
  }
  
  // Validate full name (optional but if provided, should not be empty)
  if (data.full_name && data.full_name.trim().length === 0) {
    errors.full_name = 'Full name cannot be empty if provided';
  }
  
  // Validate website URL if provided
  if (data.website && data.website.trim()) {
    try {
      new URL(data.website);
    } catch {
      errors.website = 'Please enter a valid URL';
    }
  }
  
  // Validate social links
  Object.entries(data.social_links).forEach(([platform, url]) => {
    if (url && url.trim()) {
      try {
        new URL(url);
      } catch {
        errors[`social_links.${platform}`] = `Please enter a valid ${platform} URL`;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function formatProfileData(data: ProfileFormData): ProfileFormData {
  return {
    ...data,
    user_name: data.user_name.trim().toLowerCase(),
    full_name: data.full_name?.trim() || null,
    bio: data.bio?.trim() || null,
    location: data.location?.trim() || null,
    website: data.website?.trim() || null,
    social_links: Object.fromEntries(
      Object.entries(data.social_links).map(([key, value]) => [
        key,
        value?.trim() || null
      ]).filter(([, value]) => value !== null)
    )
  };
}

export function getInitials(name: string): string {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
} 