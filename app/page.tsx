import Image from "next/image";

export default function Home() {
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
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
            disabled
            aria-disabled="true"
          >
            Sign Up (Coming Soon)
          </button>
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
