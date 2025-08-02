import { createSupabaseServerClient } from "../../src/utils/supabaseServer";
import { RecipeList } from "../../src/components/recipes/RecipeList";
import { RecipeWithSocial } from "../../src/types/supabase";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function MyRecipesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch current user's recipes with social data
  const [recipesResult, profileResult] = await Promise.all([
    supabase
      .from("recipes")
      .select("id, title, image_url, created_at, ingredients, instructions, cooking_time, difficulty")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
  ]);

  const { data: recipes, error: recipesError } = recipesResult;
  const { data: profile, error: profileError } = profileResult;

  // Fetch like counts and check if user has liked each recipe
  let recipesWithSocial: RecipeWithSocial[] = [];
  if (recipes && recipes.length > 0) {
    const recipeIds = recipes.map(r => r.id);
    
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
    
    recipesWithSocial = recipes.map((recipe, index) => ({
      ...recipe,
      updated_at: recipe.created_at, // Use created_at as updated_at for now
      user_id: user.id,
      description: null, // Add missing description field
      like_count: likeCountsResults[index]?.data || 0,
      comment_count: commentCountsResults[index]?.data || 0,
      is_liked_by_user: likedRecipeIds.has(recipe.id),
      user_profile: profile ? {
        user_name: profile.user_name,
        full_name: profile.full_name
      } : undefined
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Uploaded Recipes
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and view your own recipe collection
          </p>
        </div>

        {/* Recipes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {(!recipesWithSocial || recipesWithSocial.length === 0) ? (
            <div className="text-gray-600 dark:text-gray-300 text-center text-lg py-8">
              No recipes yet. <a href="/recipes/upload" className="text-green-600 hover:text-green-700 dark:text-green-400">Upload your first recipe</a>!
            </div>
          ) : (
            <RecipeList recipes={recipesWithSocial} />
          )}
        </div>
      </div>
    </div>
  );
} 