import { createSupabaseServerClient } from "../../src/utils/supabaseServer";
import { RecipeList } from "../../src/components/recipes/RecipeList";
import { RecipeWithSocial } from "../../src/types/supabase";

export const dynamic = 'force-dynamic';

export default async function PublicRecipesPage() {
  const supabase = await createSupabaseServerClient();
  
  // Fetch ALL recipes from ALL users (public access)
  const { data: recipes, error: recipesError } = await supabase
    .from("recipes")
    .select("id, title, image_url, created_at, ingredients, instructions, cooking_time, difficulty, user_id")
    .order("created_at", { ascending: false });

  // Fetch user profiles for recipe authors
  let recipesWithSocial: RecipeWithSocial[] = [];
  if (recipes && recipes.length > 0) {
    const userIds = [...new Set(recipes.map(r => r.user_id))]; // Get unique user IDs
    
    // Fetch user profiles for all recipe authors
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('user_id, user_name, full_name')
      .in('user_id', userIds);
    
    const userProfilesMap = new Map(
      userProfiles?.map(profile => [profile.user_id, profile]) || []
    );
    
    // Get like and comment counts for each recipe
    const recipeIds = recipes.map(r => r.id);
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
        is_liked_by_user: false, // Non-logged-in users can't like recipes
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Recipes</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover delicious recipes from our community of food lovers. 
            Sign up to upload your own recipes, like your favorites, and join the conversation!
          </p>
        </div>
        
        {/* Recipes Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">All Recipes</h2>
            <p className="text-gray-600 dark:text-gray-300">Explore recipes shared by our community</p>
          </div>
          
          {recipesError && (
            <div className="text-red-600 text-center mb-4">Failed to load recipes: {recipesError.message}</div>
          )}
          
          {(!recipesWithSocial || recipesWithSocial.length === 0) ? (
            <div className="text-gray-600 dark:text-gray-300 text-center text-lg py-8">
              <p className="mb-4">No recipes available yet.</p>
              <p>Be the first to share your favorite recipe!</p>
            </div>
          ) : (
            <>
              <RecipeList recipes={recipesWithSocial} />
              
              {/* Call to Action for Non-Logged Users */}
              <div className="mt-12 text-center bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Want to share your own recipes?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Join our community of food lovers! Sign up to upload your favorite recipes, 
                  like and comment on others, and connect with fellow cooking enthusiasts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/auth/signup"
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Sign Up Now
                  </a>
                  <a
                    href="/auth/login"
                    className="px-6 py-3 border border-green-600 text-green-600 dark:text-green-400 font-semibold rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
                  >
                    Log In
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 