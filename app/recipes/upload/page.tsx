import { RecipeUploadForm } from '../../../src/components/recipes/RecipeUploadForm';

export default function UploadRecipePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              Upload New Recipe
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
              Share your favorite recipe with the community
            </p>
          </div>
          
          <RecipeUploadForm />
        </div>
      </div>
    </div>
  );
} 