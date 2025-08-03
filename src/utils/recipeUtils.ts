import { Recipe } from '@/types/supabase';

export interface SearchFilters {
  searchTerm: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | '';
  maxCookingTime: string;
  sortBy: 'newest' | 'oldest' | 'title' | 'cooking_time';
}

export function filterAndSortRecipes(recipes: Recipe[], filters: SearchFilters): Recipe[] {
  let filteredRecipes = [...recipes];

  // Filter by search term (title and ingredients)
  if (filters.searchTerm.trim()) {
    const searchTerm = filters.searchTerm.toLowerCase().trim();
    filteredRecipes = filteredRecipes.filter(recipe => {
      const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
      const ingredientsMatch = recipe.ingredients?.some((ingredient: string) =>
        ingredient.toLowerCase().includes(searchTerm)
      ) || false;
      return titleMatch || ingredientsMatch;
    });
  }

  // Filter by difficulty
  if (filters.difficulty) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.difficulty === filters.difficulty
    );
  }

  // Filter by cooking time
  if (filters.maxCookingTime) {
    const maxTime = parseInt(filters.maxCookingTime);
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.cooking_time && recipe.cooking_time <= maxTime
    );
  }

  // Sort recipes
  switch (filters.sortBy) {
    case 'oldest':
      filteredRecipes.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      break;
    case 'title':
      filteredRecipes.sort((a, b) => 
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );
      break;
    case 'cooking_time':
      filteredRecipes.sort((a, b) => {
        const timeA = a.cooking_time || 0;
        const timeB = b.cooking_time || 0;
        return timeA - timeB;
      });
      break;
    case 'newest':
    default:
      filteredRecipes.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
  }

  return filteredRecipes;
}

export function formatCookingTime(minutes: number | null | undefined): string {
  if (!minutes) return 'Unknown';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function getDifficultyColor(difficulty: string | null | undefined): string {
  switch (difficulty) {
    case 'Easy': 
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Medium': 
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Hard': 
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: 
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
} 