import Image from "next/image";
import { createSupabaseServerClient } from "../src/utils/supabaseServer";
import { RecipeList } from "../src/components/recipes/RecipeList";
import { RecipeWithSocial } from "../src/types/supabase";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is not authenticated, show landing page
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 px-4 py-12">
        <main className="w-full max-w-xl flex flex-col items-center gap-8 text-center">
          <Image
            src="/globe.svg"
            alt="Recipe Sharing Platform logo"
            width={64}
            height={64}
            className="mb-2"
          />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Recipe Sharing Platform
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
            Discover, share, and explore delicious recipes from cooks around the world. Upload your own creations, search by keyword or category, and join a vibrant food-loving community.
          </p>
          <ul className="flex flex-col gap-2 text-gray-700 dark:text-gray-200 text-base items-center">
            <li>• Sign up & log in securely</li>
            <li>• Upload recipes with images</li>
            <li>• Browse & search all recipes</li>
            <li>• Filter by category</li>
            <li>• Mobile-friendly experience</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
            <button
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-green-600 text-green-700 dark:text-green-300 font-semibold hover:bg-green-50 dark:hover:bg-green-900 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              disabled
              aria-disabled="true"
            >
              Browse Recipes
            </button>
          </div>
        </main>
        <footer className="mt-16 text-xs text-gray-400 dark:text-gray-600">
          &copy; {new Date().getFullYear()} Recipe Sharing Platform. All rights reserved.
        </footer>
      </div>
    );
  }

  // Fetch ALL recipes from ALL users
  const { data: recipes, error: recipesError } = await supabase
    .from("recipes")
    .select("id, title, image_url, created_at, ingredients, instructions, cooking_time, difficulty, user_id")
    .order("created_at", { ascending: false });

  // Fetch like counts and check if user has liked each recipe
  let recipesWithSocial: RecipeWithSocial[] = [];
  if (recipes && recipes.length > 0) {
    const recipeIds = recipes.map(r => r.id);
    const userIds = [...new Set(recipes.map(r => r.user_id))]; // Get unique user IDs
    
    // Fetch user profiles for all recipe authors
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('user_id, user_name, full_name')
      .in('user_id', userIds);
    
    const userProfilesMap = new Map(
      userProfiles?.map(profile => [profile.user_id, profile]) || []
    );
    
    // Check if user has liked each recipe
    const { data: userLikes } = await supabase
      .from('recipe_likes')
      .select('recipe_id')
      .eq('user_id', user.id)
      .in('recipe_id', recipeIds);
    
    const likedRecipeIds = new Set(userLikes?.map(like => like.recipe_id) || []);
    
    // Get like and comment counts for each recipe
    const likeCountsPromises = recipeIds.map(recipeId => 
      supabase.rpc('get_recipe_like_count', { recipe_uuid: recipeId })
    );
    const commentCountsPromises = recipeIds.map(recipeId => 
      supabase.rpc('get_recipe_comment_count', { recipe_uuid: recipeId })
    );
    
    const [likeCountsResults, commentCountsResults] = await Promise.all([
      Promise.all(likeCountsPromises),
      Promise.all(commentCountsPromises)
    ]);
    
    recipesWithSocial = recipes.map((recipe, index) => {
      const userProfile = userProfilesMap.get(recipe.user_id);
      return {
        ...recipe,
        updated_at: recipe.created_at, // Use created_at as updated_at for now
        description: null, // Add missing description field
        like_count: likeCountsResults[index]?.data || 0,
        comment_count: commentCountsResults[index]?.data || 0,
        is_liked_by_user: likedRecipeIds.has(recipe.id),
        user_profile: userProfile ? {
          user_name: userProfile.user_name,
          full_name: userProfile.full_name
        } : undefined
      };
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Recipe Share</h1>
        
        {/* Recipes Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">All Recipes</h2>
            <p className="text-gray-600 dark:text-gray-300">Discover delicious recipes from our community</p>
          </div>
          
          {recipesError && (
            <div className="text-red-600 text-center mb-4">Failed to load recipes: {recipesError.message}</div>
          )}
          
          {(!recipesWithSocial || recipesWithSocial.length === 0) ? (
            <div className="text-gray-600 dark:text-gray-300 text-center text-lg py-8">
              No recipes available yet. Be the first to <a href="/recipes/upload" className="text-green-600 hover:text-green-700 dark:text-green-400">upload a recipe</a>!
            </div>
          ) : (
            <RecipeList recipes={recipesWithSocial} />
          )}
        </div>
      </div>
    </div>
  );
}
