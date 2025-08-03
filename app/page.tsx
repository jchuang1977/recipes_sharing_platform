import Image from "next/image";
import { createSupabaseServerClient } from "../src/utils/supabaseServer";
import { RecipeList } from "../src/components/recipes/RecipeList";
import { RecipeWithSocial } from "../src/types/supabase";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is not authenticated, show landing page with recipe preview
  if (!user) {
    // Fetch a few recent recipes for preview
    const { data: recentRecipes } = await supabase
      .from("recipes")
      .select("id, title, image_url, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(3);

    // Get user profiles for the preview recipes
    let recipesWithAuthors: Array<{
      id: string;
      title: string;
      image_url: string | null;
      created_at: string;
      user_id: string;
      author?: {
        user_id: string;
        user_name: string;
        full_name: string | null;
      };
    }> = [];
    if (recentRecipes && recentRecipes.length > 0) {
      const userIds = [...new Set(recentRecipes.map(r => r.user_id))];
      const { data: userProfiles } = await supabase
        .from('user_profiles')
        .select('user_id, user_name, full_name')
        .in('user_id', userIds);
      
      const userProfilesMap = new Map(
        userProfiles?.map(profile => [profile.user_id, profile]) || []
      );
      
      recipesWithAuthors = recentRecipes.map(recipe => ({
        ...recipe,
        author: userProfilesMap.get(recipe.user_id)
      }));
    }

    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 px-4 py-12">
        <main className="w-full max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Image
              src="/globe.svg"
              alt="Recipe Sharing Platform logo"
              width={64}
              height={64}
              className="mx-auto mb-4"
            />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Recipe Sharing Platform
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Discover, share, and explore delicious recipes from cooks around the world. Upload your own creations, search by keyword or category, and join a vibrant food-loving community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/recipes"
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Recipes
              </a>
              <a
                href="/auth/signup"
                className="px-6 py-3 border border-green-600 text-green-600 dark:text-green-400 font-semibold rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-8">
              Why Choose RecipeShare?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Share Your Creations</h3>
                <p className="text-gray-600 dark:text-gray-300">Upload your favorite recipes with beautiful images and detailed instructions.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Discover New Recipes</h3>
                <p className="text-gray-600 dark:text-gray-300">Browse thousands of recipes from our community of passionate cooks.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Join the Community</h3>
                <p className="text-gray-600 dark:text-gray-300">Like, comment, and connect with fellow food enthusiasts.</p>
              </div>
            </div>
          </div>

          {/* Recent Recipes Preview */}
          {recipesWithAuthors.length > 0 && (
            <div className="mb-16">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Recent Recipes
                </h2>
                <a
                  href="/recipes"
                  className="text-green-600 hover:text-green-700 dark:text-green-400 font-medium"
                >
                  View All →
                </a>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {recipesWithAuthors.map((recipe) => (
                  <div key={recipe.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    {recipe.image_url && (
                      <Image
                        src={recipe.image_url}
                        alt={recipe.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {recipe.title}
                    </h3>
                    {recipe.author && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        By {recipe.author.full_name || recipe.author.user_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
        <footer className="text-center text-xs text-gray-400 dark:text-gray-600 mt-16">
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
