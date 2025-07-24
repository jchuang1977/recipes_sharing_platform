// src/types/supabase.ts
export interface Profile {
  id: string;
  user_name: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: number | null;
  difficulty: string | null;
  category: string | null;
}