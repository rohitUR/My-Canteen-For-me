import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Clock, Flame, Sparkles } from 'lucide-react';
import { MenuItem, CartCustomizationSelection } from '../types/canteen';

interface ItemCustomizationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    selectedCustomizations: CartCustomizationSelection,
    extraPrice: number,
    specialInstructions: string
  ) => void;
}

export const ItemCustomizationModal: React.FC<ItemCustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Initialize default choices when item changes
  useEffect(() => {
    if (!item) return;
    setQuantity(1);
    setSpecialInstructions('');

    const initialSelections: Record<string, string> = {};
    if (item.customizationOptions) {
      item.customizationOptions.forEach((opt) => {
        if (opt.required && opt.choices.length > 0) {
          initialSelections[opt.name] = opt.choices[0].name;
        }
      });
    }
    setSelectedChoices(initialSelections);
  }, [item]);

  if (!isOpen || !item) return null;

  // Calculate extra price
  let extraPrice = 0;
  if (item.customizationOptions) {
    item.customizationOptions.forEach((opt) => {
      const selectedName = selectedChoices[opt.name];
      if (selectedName) {
        const found = opt.choices.find((c) => c.name === selectedName);
        if (found) {
          extraPrice += found.price;
        }
      }
    });
  }

  const singleItemPrice = Math.max(0, item.price + extraPrice);
  const totalItemPrice = singleItemPrice * quantity;

  const handleSelectChoice = (optionName: string, choiceName: string, isRequired: boolean) => {
    setSelectedChoices((prev) => {
      if (!isRequired && prev[optionName] === choiceName) {
        // Toggle off if optional
        const copy = { ...prev };
        delete copy[optionName];
        return copy;
      }
      return {
        ...prev,
        [optionName]: choiceName,
      };
    });
  };

  const handleAdd = () => {
    onAddToCart(item, quantity, selectedChoices, extraPrice, specialInstructions.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="customization-modal-title"
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col"
      >
        {/* Header with image */}
        <div className="relative h-44 sm:h-52 w-full bg-stone-100 overflow-hidden shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/30 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close customization"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[11px] font-semibold text-orange-300 uppercase tracking-wider block mb-0.5">
              {item.stallName} · Counter {item.counterNumber}
            </span>
            <h3 id="customization-modal-title" className="text-lg sm:text-xl font-bold leading-tight">
              {item.name}
            </h3>
          </div>
        </div>

        {/* Customization Options Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <p className="text-xs text-stone-600 leading-relaxed">
            {item.description}
          </p>

          {/* Options groups */}
          {item.customizationOptions && item.customizationOptions.map((opt) => (
            <div key={opt.name} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  {opt.name}
                </span>
                {opt.required ? (
                  <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    Required
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400">Optional</span>
                )}
              </div>

              <div className="space-y-1.5">
                {opt.choices.map((choice) => {
                  const isSelected = selectedChoices[opt.name] === choice.name;
                  return (
                    <button
                      type="button"
                      key={choice.name}
                      onClick={() => handleSelectChoice(opt.name, choice.name, !!opt.required)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/60 text-stone-900 font-bold ring-1 ring-orange-500'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-orange-600 bg-orange-600 text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span>{choice.name}</span>
                      </div>

                      <span className="font-semibold text-stone-600">
                        {choice.price > 0 ? `+$${choice.price.toFixed(2)}` : choice.price < 0 ? `-$${Math.abs(choice.price).toFixed(2)}` : 'Free'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Cooking Instructions for Kitchen */}
          <div className="space-y-2">
            <label
              htmlFor="special-instructions"
              className="text-xs font-bold text-stone-900 uppercase tracking-wider block"
            >
              Chef Instructions & Allergies
            </label>
            <input
              id="special-instructions"
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra spicy, no onions, pack chutney separately"
              maxLength={120}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Footer with quantity and Add to cart */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-stone-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>Add to Order</span>
            <span>${totalItemPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
