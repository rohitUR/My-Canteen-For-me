import React from 'react';
import { Plus, Star, Zap, Clock, Flame } from 'lucide-react';
import { MenuItem } from '../types/canteen';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (itemId: string) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onSelect,
}) => {
  const hasCustomizations = item.customizationOptions && item.customizationOptions.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group">
      {/* Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {/* Dietary Indicator Square */}
          <span 
            className={`w-4 h-4 rounded-xs border flex items-center justify-center bg-white/95 shadow-xs ${
              item.dietary === 'veg' 
                ? 'border-emerald-600' 
                : item.dietary === 'vegan'
                ? 'border-green-600'
                : 'border-rose-600'
            }`}
            title={item.dietary === 'veg' ? 'Vegetarian' : item.dietary === 'vegan' ? 'Vegan' : 'Non-Vegetarian'}
          >
            <span 
              className={`w-2 h-2 rounded-full ${
                item.dietary === 'veg' 
                  ? 'bg-emerald-600' 
                  : item.dietary === 'vegan'
                  ? 'bg-green-600'
                  : 'bg-rose-600'
              }`} 
            />
          </span>

          {/* Express Badge */}
          {item.isExpress && (
            <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
              <Zap className="w-3 h-3 fill-stone-950" />
              <span>≤ 3m Express</span>
            </span>
          )}
        </div>

        {/* Counter Tag */}
        <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
          Counter {item.counterNumber}
        </div>

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
              Sold Out (Peak Rush)
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata: clean unboxed text with separators */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
            <span className="font-medium text-stone-700">{item.stallName}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-stone-400" />
              {item.prepTimeMinutes}m prep
            </span>
            <span aria-hidden="true">·</span>
            <span>{item.calories} kcal</span>
          </div>

          {/* Title */}
          <h4 className="font-bold text-stone-900 text-base leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
            {item.name}
          </h4>

          {/* Description */}
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block leading-none font-medium">Price</span>
            <span className="text-base font-extrabold text-stone-900 leading-tight">
              ${item.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onSelect(item)}
            disabled={!item.isAvailable}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !item.isAvailable
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : hasCustomizations
                ? 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-2xs'
            }`}
            aria-label={`Add ${item.name} to order`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{hasCustomizations ? 'Customize' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
