// src/types/supabase.ts
export interface Profile {
  id: string;
  user_id: string;
  user_name: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
  social_links: Record<string, string> | null;
  preferences: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  image_url: string | null;
  ingredients: string[];
  instructions: string[];
  cooking_time: number | null;
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  description: string | null;
}

export interface ProfileFormData {
  user_name: string;
  full_name: string;
  bio: string;
  location: string;
  website: string;
  social_links: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
}