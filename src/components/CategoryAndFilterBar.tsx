import React from 'react';
import { Search, X, Zap, SlidersHorizontal, Leaf, Utensils } from 'lucide-react';

interface CategoryAndFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedDietary: string;
  onSelectDietary: (diet: string) => void;
  expressOnly: boolean;
  onToggleExpress: (val: boolean) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch Meals' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'beverages', label: 'Drinks & Brews' },
  { id: 'desserts', label: 'Desserts' },
];

const DIETARY_OPTIONS = [
  { id: 'all', label: 'All Diets' },
  { id: 'veg', label: 'Veg' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'non-veg', label: 'Non-Veg' },
];

export const CategoryAndFilterBar: React.FC<CategoryAndFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedDietary,
  onSelectDietary,
  expressOnly,
  onToggleExpress,
}) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Search & Express Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <label htmlFor="canteen-search-input" className="sr-only">
            Search food or drinks
          </label>
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="canteen-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search noodles, dosa, burger, coffee, samosa..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dietary and Express toggle */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Dietary segmented buttons */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs shrink-0">
            {DIETARY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onSelectDietary(opt.id)}
                className={`px-3 py-1.5 font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedDietary === opt.id
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Express filter toggle */}
          <button
            onClick={() => onToggleExpress(!expressOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
              expressOnly
                ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-2xs'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
            aria-pressed={expressOnly}
          >
            <Zap className={`w-3.5 h-3.5 ${expressOnly ? 'fill-stone-950' : 'text-amber-500'}`} />
            <span>&le; 4m Express</span>
          </button>
        </div>
      </div>

      {/* Categories Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-stone-200">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`pb-2.5 px-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-orange-600'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {cat.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
