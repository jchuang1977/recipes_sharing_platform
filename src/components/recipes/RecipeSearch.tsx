'use client';

import { useState } from 'react';

export interface SearchFilters {
  searchTerm: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | '';
  maxCookingTime: string;
  sortBy: 'newest' | 'oldest' | 'title' | 'cooking_time';
}

interface RecipeSearchProps {
  onSearch: (filters: SearchFilters) => void;
  totalRecipes: number;
}

export function RecipeSearch({ onSearch, totalRecipes }: RecipeSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    difficulty: '',
    maxCookingTime: '',
    sortBy: 'newest'
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      searchTerm: '',
      difficulty: '',
      maxCookingTime: '',
      sortBy: 'newest'
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        {/* Search Input */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Recipes
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleInputChange('searchTerm', e.target.value)}
              placeholder="Search by title, ingredients..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="w-full lg:w-32">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Cooking Time Filter */}
        <div className="w-full lg:w-40">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Time
          </label>
          <select
            value={filters.maxCookingTime}
            onChange={(e) => handleInputChange('maxCookingTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Any time</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="180">3+ hours</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="w-full lg:w-32">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleInputChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title A-Z</option>
            <option value="cooking_time">Cooking Time</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {totalRecipes} recipe{totalRecipes !== 1 ? 's' : ''} found
      </div>
    </div>
  );
} 