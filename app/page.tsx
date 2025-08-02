import Image from "next/image";
import { createSupabaseServerClient } from "../src/utils/supabaseServer";
import { RecipeList } from "../src/components/recipes/RecipeList";
import { ProfileDisplay } from "../src/components/auth/ProfileDisplay";

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

  // If user is authenticated, fetch and display their recipes and profile
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">My Recipes</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ProfileDisplay showEditButton={true} />
            </div>
          </div>

          {/* Recipes Section */}
          <div className="lg:col-span-2">
            {/* Recipes Display */}
            <div>
                          <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">My Uploaded Recipes</h2>
            </div>
              
              {recipesError && (
                <div className="text-red-600 text-center mb-4">Failed to load recipes: {recipesError.message}</div>
              )}
              
              {(!recipes || recipes.length === 0) ? (
                <div className="text-gray-600 dark:text-gray-300 text-center text-lg py-8">
                  No recipes yet. Upload your first recipe above!
                </div>
              ) : (
                <RecipeList recipes={recipes} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
