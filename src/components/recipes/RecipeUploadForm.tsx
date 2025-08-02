'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function RecipeUploadForm({ onUpload }: { onUpload?: () => void }) {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [cookingTime, setCookingTime] = useState<number | ''>('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setImageFile(file);
      setError(null); // Clear any previous errors
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
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

  const resetForm = () => {
    setTitle('');
    setIngredients(['']);
    setInstructions(['']);
    setCookingTime('');
    setDifficulty('');
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to upload a recipe.');
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

      let imageUrl = null;
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const filePath = `recipes/${user.id}/${Date.now()}.${fileExt}`;
          
          console.log('Attempting to upload image to path:', filePath);
          
          // Try to upload directly without checking bucket first
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            console.error('Upload error details:', uploadError);
            
            // More specific error handling
            if (uploadError.message.includes('Bucket not found')) {
              setError('Storage bucket "images" not found. Please check your Supabase storage configuration.');
            } else if (uploadError.message.includes('policy') || uploadError.message.includes('permission')) {
              setError('Storage permissions not configured. Please check your Supabase storage policies.');
            } else if (uploadError.message.includes('JWT')) {
              setError('Authentication issue with storage. Please try logging out and back in.');
            } else {
              setError(`Image upload failed: ${uploadError.message}`);
            }
            setLoading(false);
            return;
          }
          
          console.log('Upload successful:', uploadData);
          
          // Get the public URL
          const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
          imageUrl = urlData.publicUrl;
          console.log('Public URL:', imageUrl);
          
        } catch (storageError) {
          console.error('Storage error:', storageError);
          setError('Image upload failed. Please try again or contact support.');
          setLoading(false);
          return;
        }
      }

      // Insert recipe into database
      console.log('Inserting recipe with image URL:', imageUrl);
      const { error: insertError } = await supabase.from('recipes').insert([
        {
          title: title.trim(),
          image_url: imageUrl,
          ingredients: filteredIngredients,
          instructions: filteredInstructions,
          cooking_time: cookingTime || null,
          difficulty: difficulty || null,
          user_id: user.id,
        },
      ]);
      
      if (insertError) {
        console.error('Database error:', insertError);
        if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
          setError('Database schema not configured. Please run the database setup script.');
        } else if (insertError.message.includes('policy')) {
          setError('Database permissions not configured. Please check your Supabase policies.');
        } else {
          setError('Failed to save recipe: ' + insertError.message);
        }
      } else {
        setSuccess(true);
        resetForm();
        
        // Call the onUpload callback if provided
        onUpload?.();
        
        // Redirect to main page after successful upload
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow flex flex-col gap-4 mb-8">
      <h2 className="text-xl font-semibold mb-2 text-center">Upload a Recipe</h2>
      
      {/* Title */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Recipe Title *</span>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
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
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">Max file size: 5MB</span>
      </label>
      
      {/* Image Preview */}
      {imagePreview && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium">Preview:</span>
          <div className="relative w-32 h-24 border rounded overflow-hidden">
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
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
            placeholder="e.g., 30"
          />
        </label>
        
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Difficulty</span>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard' | '')}
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
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
            + Add Ingredient
          </button>
        </div>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={ingredient}
              onChange={e => updateIngredient(index, e.target.value)}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800"
              placeholder={`Ingredient ${index + 1}`}
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
            <textarea
              value={instruction}
              onChange={e => updateInstruction(index, e.target.value)}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500 bg-gray-50 dark:bg-gray-800 resize-none"
              placeholder={`Step ${index + 1}`}
              rows={2}
            />
            {instructions.length > 1 && (
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      
      {error && (
        <div className="text-red-600 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800" role="alert">
          <strong>Error:</strong> {error}
          {error.includes('setup') && (
            <div className="mt-2 text-xs">
              Check the SETUP.md file for instructions on configuring your database.
            </div>
          )}
        </div>
      )}
      {success && <div className="text-green-600 text-sm" role="status">Recipe uploaded successfully! Redirecting to your recipes...</div>}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors disabled:opacity-60"
        disabled={loading || !title.trim()}
        aria-busy={loading}
      >
        {loading ? 'Uploading...' : 'Upload Recipe'}
      </button>
    </form>
  );
} 