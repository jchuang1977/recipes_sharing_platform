'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import { RecipeWithSocial } from '../../types/supabase';

interface Recipe {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
  ingredients?: string[];
  instructions?: string[];
  cooking_time?: number | null;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | null;
}

interface RecipeEditFormProps {
  recipe: RecipeWithSocial;
  onSave: (recipe: RecipeWithSocial) => void;
  onCancel: () => void;
}

export function RecipeEditForm({ recipe, onSave, onCancel }: RecipeEditFormProps) {
  const [title, setTitle] = useState(recipe.title);
  const [ingredients, setIngredients] = useState<string[]>(recipe.ingredients || ['']);
  const [instructions, setInstructions] = useState<string[]>(recipe.instructions || ['']);
  const [cookingTime, setCookingTime] = useState<number | ''>(recipe.cooking_time || '');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | ''>(recipe.difficulty || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(recipe.image_url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        setImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        setImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setImageFile(file);
      setError(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to edit a recipe.');
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!title.trim()) {
        setError('Recipe title is required.');
        setLoading(false);
        return;
      }

      // Filter out empty ingredients and instructions
      const filteredIngredients = ingredients.filter(ingredient => ingredient.trim() !== '');
      const filteredInstructions = instructions.filter(instruction => instruction.trim() !== '');

      if (filteredIngredients.length === 0) {
        setError('At least one ingredient is required.');
        setLoading(false);
        return;
      }

      if (filteredInstructions.length === 0) {
        setError('At least one instruction is required.');
        setLoading(false);
        return;
      }

      let imageUrl = recipe.image_url; // Keep existing image URL by default

      // Handle new image upload if provided
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const filePath = `recipes/${user.id}/${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            console.error('Upload error:', uploadError);
            setError('Image upload failed: ' + uploadError.message);
            setLoading(false);
            return;
          }
          
          // Get the new public URL
          const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
          imageUrl = urlData.publicUrl;
          
          // Delete old image if it exists and is different
          if (recipe.image_url && recipe.image_url !== imageUrl) {
            const urlParts = recipe.image_url.split('/');
            const oldFilePath = urlParts.slice(-2).join('/');
            
            const { error: deleteError } = await supabase.storage
              .from('images')
              .remove([oldFilePath]);
            
            if (deleteError) {
              console.error('Error deleting old image:', deleteError);
            }
          }
          
        } catch (storageError) {
          console.error('Storage error:', storageError);
          setError('Image upload failed. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Update recipe in database
      const { error: updateError } = await supabase
        .from('recipes')
        .update({
          title: title.trim(),
          image_url: imageUrl,
          ingredients: filteredIngredients,
          instructions: filteredInstructions,
          cooking_time: cookingTime || null,
          difficulty: difficulty || null,
        })
        .eq('id', recipe.id)
        .eq('user_id', user.id); // Ensure user owns the recipe
      
      if (updateError) {
        console.error('Update error:', updateError);
        setError('Failed to update recipe: ' + updateError.message);
      } else {
        // Call onSave with updated recipe
        onSave({
          ...recipe,
          title: title.trim(),
          image_url: imageUrl,
          ingredients: filteredIngredients,
          instructions: filteredInstructions,
          cooking_time: cookingTime || null,
          difficulty: difficulty || null,
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full h-full flex flex-col gap-3 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Edit Recipe</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      {/* Title */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Recipe Title *</span>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800 text-sm"
          placeholder="Enter recipe title..."
          maxLength={100}
        />
      </label>

      {/* Image Upload */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Image (optional)</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800 text-sm"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">Max file size: 5MB</span>
      </label>
      
      {/* Image Preview */}
      {imagePreview && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium">Preview:</span>
          <div className="relative w-24 h-18 border rounded overflow-hidden">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Cooking Time and Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Cooking Time (minutes)</span>
          <input
            type="number"
            value={cookingTime}
            onChange={e => setCookingTime(e.target.value ? parseInt(e.target.value) : '')}
            min="1"
            max="1440"
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800 text-sm"
            placeholder="e.g., 30"
          />
        </label>
        
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Difficulty</span>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard' | '')}
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800 text-sm"
          >
            <option value="">Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>
      </div>

      {/* Ingredients */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Ingredients *</span>
          <button
            type="button"
            onClick={addIngredient}
            className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            + Add
          </button>
        </div>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={ingredient}
              onChange={e => updateIngredient(index, e.target.value)}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800 text-sm"
              placeholder={`Ingredient ${index + 1}`}
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Instructions *</span>
          <button
            type="button"
            onClick={addInstruction}
            className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            + Add Step
          </button>
        </div>
        {instructions.map((instruction, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">
              {index + 1}
            </div>
            <textarea
              value={instruction}
              onChange={e => updateInstruction(index, e.target.value)}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800 resize-none text-sm"
              placeholder={`Step ${index + 1}`}
              rows={2}
            />
            {instructions.length > 1 && (
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      
      {error && (
        <div className="text-red-600 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="flex gap-2 mt-auto pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-400 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2 px-4 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors disabled:opacity-60"
          disabled={loading || !title.trim()}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 