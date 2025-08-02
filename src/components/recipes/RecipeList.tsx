'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { RecipeEditForm } from './RecipeEditForm';

export interface Recipe {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
  ingredients?: string[];
  instructions?: string[];
  cooking_time?: number | null;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | null;
}

interface RecipeListProps {
  recipes: Recipe[];
}

export function RecipeList({ recipes }: RecipeListProps) {
  const [editingRecipe, setEditingRecipe] = useState<string | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<string | null>(null);
  const [localRecipes, setLocalRecipes] = useState<Recipe[]>(recipes);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleDelete = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    setDeletingRecipe(recipeId);

    try {
      // Get the recipe to find the image URL
      const recipe = localRecipes.find(r => r.id === recipeId);
      
      // Delete the image from storage if it exists
      if (recipe?.image_url) {
        const urlParts = recipe.image_url.split('/');
        const filePath = urlParts.slice(-2).join('/'); // Get the path part
        
        const { error: storageError } = await supabase.storage
          .from('images')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Error deleting image:', storageError);
        }
      }

      // Delete the recipe from database
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) {
        console.error('Error deleting recipe:', error);
        alert('Failed to delete recipe. Please try again.');
        return;
      }

      // Update local state
      setLocalRecipes(prev => prev.filter(r => r.id !== recipeId));
      
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    } finally {
      setDeletingRecipe(null);
    }
  };

  const handleEdit = (recipeId: string) => {
    setEditingRecipe(recipeId);
  };

  const handleEditComplete = (updatedRecipe: Recipe) => {
    setLocalRecipes(prev => 
      prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r)
    );
    setEditingRecipe(null);
  };

  const handleEditCancel = () => {
    setEditingRecipe(null);
  };

  const formatCookingTime = (minutes: number | null | undefined) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: string | null | undefined) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {localRecipes.map((recipe) => (
        <li key={recipe.id} className="bg-gray-100 dark:bg-gray-800 rounded shadow p-4 flex flex-col items-center relative">
          {/* Edit/Delete Buttons */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={() => handleEdit(recipe.id)}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Edit recipe"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(recipe.id)}
              disabled={deletingRecipe === recipe.id}
              className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
              title="Delete recipe"
            >
              {deletingRecipe === recipe.id ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Recipe Image */}
          {recipe.image_url && (
            <Image 
              src={recipe.image_url} 
              alt={recipe.title} 
              width={160} 
              height={120} 
              className="rounded mb-2 object-cover" 
            />
          )}

          {/* Recipe Title */}
          <span className="font-semibold text-lg text-gray-900 dark:text-white text-center mb-2">
            {recipe.title}
          </span>

          {/* Recipe Details */}
          <div className="w-full space-y-2">
            {/* Cooking Time and Difficulty */}
            <div className="flex justify-between items-center text-sm">
              {recipe.cooking_time && (
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatCookingTime(recipe.cooking_time)}
                </span>
              )}
              {recipe.difficulty && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </span>
              )}
            </div>

            {/* Ingredients Preview */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Ingredients:</span>
                <div className="text-gray-600 dark:text-gray-400 mt-1">
                  {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                    <div key={index} className="truncate">• {ingredient}</div>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <div className="text-gray-500 dark:text-gray-500">
                      +{recipe.ingredients.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions Preview */}
            {recipe.instructions && recipe.instructions.length > 0 && (
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Steps:</span>
                <div className="text-gray-600 dark:text-gray-400 mt-1">
                  {recipe.instructions.slice(0, 2).map((instruction, index) => (
                    <div key={index} className="truncate">
                      {index + 1}. {instruction}
                    </div>
                  ))}
                  {recipe.instructions.length > 2 && (
                    <div className="text-gray-500 dark:text-gray-500">
                      +{recipe.instructions.length - 2} more steps...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Created Date */}
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            {new Date(recipe.created_at).toLocaleDateString()}
          </span>

          {/* Edit Form Overlay */}
          {editingRecipe === recipe.id && (
            <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded shadow-lg p-4 z-10 overflow-y-auto">
              <RecipeEditForm
                recipe={recipe}
                onSave={handleEditComplete}
                onCancel={handleEditCancel}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
} 