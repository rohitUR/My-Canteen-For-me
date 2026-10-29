import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  Ticket, 
  CalendarClock, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react';
import { CartItem, ScheduledSlotOption } from '../types/canteen';
import { calculateCartTotals, calculateEstimatedWaitTime, getScheduledBreakSlots } from '../utils/canteenRules';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  orderType: 'immediate' | 'scheduled_slot';
  onChangeOrderType: (type: 'immediate' | 'scheduled_slot') => void;
  selectedSlotId: string;
  onSelectSlotId: (slotId: string) => void;
  appliedPromo: string;
  onApplyPromo: (code: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  orderType,
  onChangeOrderType,
  selectedSlotId,
  onSelectSlotId,
  appliedPromo,
  onApplyPromo,
  onProceedToCheckout,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const breakSlots = getScheduledBreakSlots();
  const activeSlot = breakSlots.find((s) => s.id === selectedSlotId) || breakSlots[0];

  const totals = calculateCartTotals(items, appliedPromo);
  const estimatedWait = calculateEstimatedWaitTime(
    items,
    4,
    new Date().getHours(),
    orderType === 'scheduled_slot'
  );

  const handleApplyPromoCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    onApplyPromo(trimmed);
    if (trimmed === 'STUDENT10' || trimmed === 'EXAMBOOST' || trimmed === 'FREEDRINK') {
      setPromoMessage({ text: 'Promo applied successfully!' });
    } else {
      setPromoMessage({ text: 'Invalid promo code', error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-heading"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <h2 id="cart-drawer-heading" className="text-base sm:text-lg font-bold text-stone-900">
                Your Canteen Tray
              </h2>
              <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                {items.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-stone-500 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                  title="Clear all items"
                >
                  Clear Tray
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                aria-label="Close cart tray"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Empty Tray State */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">
                Your tray is currently empty
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mb-6">
                Explore menus from all 5 campus stalls, customize your toppings, or pick Express picks to skip wait lines.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                Explore Canteen Menu
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-stone-100">
                {/* Anti-Rush Timing Switcher */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-600" />
                      Pickup Time Preference
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Skip Line Enabled
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => onChangeOrderType('immediate')}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        orderType === 'immediate'
                          ? 'border-orange-500 bg-white font-bold text-stone-900 shadow-2xs ring-1 ring-orange-500'
                          : 'border-stone-200 bg-stone-100/70 text-stone-600 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold">Immediate</span>
                        <Zap className="w-3 h-3 text-amber-500" />
                      </div>
                      <p className="text-[10px] text-stone-500 font-normal">Next in queue (~{estimatedWait}m)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => onChangeOrderType('scheduled_slot')}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        orderType === 'scheduled_slot'
                          ? 'border-orange-500 bg-white font-bold text-stone-900 shadow-2xs ring-1 ring-orange-500'
                          : 'border-stone-200 bg-stone-100/70 text-stone-600 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold">Class Break Slot</span>
                        <CalendarClock className="w-3 h-3 text-orange-600" />
                      </div>
                      <p className="text-[10px] text-stone-500 font-normal">0m wait at counter</p>
                    </button>
                  </div>

                  {/* Slot selector dropdown if scheduled */}
                  {orderType === 'scheduled_slot' && (
                    <div className="pt-2 border-t border-stone-200 space-y-1">
                      <label htmlFor="break-slot-select" className="text-[11px] font-semibold text-stone-600 block">
                        Select your upcoming class recess:
                      </label>
                      <select
                        id="break-slot-select"
                        value={selectedSlotId}
                        onChange={(e) => onSelectSlotId(e.target.value)}
                        className="w-full text-xs font-medium bg-white border border-stone-300 rounded-lg p-2 text-stone-800 focus:outline-hidden focus:border-orange-500"
                      >
                        {breakSlots.map((slot) => (
                          <option key={slot.id} value={slot.id}>
                            {slot.timeRange} - {slot.periodName} ({slot.slotsRemaining} left)
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-emerald-700 mt-1">
                        ✓ Freshly plated 2 mins before bell rings. Grab from express window.
                      </p>
                    </div>
                  )}
                </div>

                {/* Items in tray */}
                <div className="space-y-3 pt-3">
                  {items.map((cartItem) => {
                    const customizationsList = Object.entries(cartItem.selectedCustomizations);
                    return (
                      <div key={cartItem.cartItemId} className="flex gap-3 items-start py-2">
                        <img
                          src={cartItem.menuItem.imageUrl}
                          alt={cartItem.menuItem.name}
                          className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h4 className="text-xs font-bold text-stone-900 leading-snug truncate">
                                {cartItem.menuItem.name}
                              </h4>
                              <p className="text-[11px] text-stone-500">
                                Counter {cartItem.menuItem.counterNumber} · {cartItem.menuItem.stallName}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-stone-900 shrink-0">
                              ${cartItem.itemTotalPrice.toFixed(2)}
                            </span>
                          </div>

                          {/* Customizations tags */}
                          {customizationsList.length > 0 && (
                            <div className="text-[10px] text-stone-500 mt-0.5 space-x-1">
                              {customizationsList.map(([key, val]) => (
                                <span key={key} className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 inline-block">
                                  {key}: {val}
                                </span>
                              ))}
                            </div>
                          )}

                          {cartItem.specialInstructions && (
                            <p className="text-[10px] text-amber-700 italic mt-0.5">
                              Note: {cartItem.specialInstructions}
                            </p>
                          )}

                          {/* Controls Row */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg p-0.5">
                              <button
                                onClick={() => onUpdateQuantity(cartItem.cartItemId, cartItem.quantity - 1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-white transition-colors cursor-pointer"
                                aria-label="Decrease item quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center text-xs font-bold text-stone-900">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(cartItem.cartItemId, cartItem.quantity + 1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-white transition-colors cursor-pointer"
                                aria-label="Increase item quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem(cartItem.cartItemId)}
                              className="text-stone-400 hover:text-rose-600 p-1 text-xs transition-colors cursor-pointer"
                              title="Remove item"
                              aria-label={`Remove ${cartItem.menuItem.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code Box */}
                <div className="pt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Coupon: STUDENT10 or EXAMBOOST"
                      className="flex-1 text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg uppercase tracking-wider focus:outline-hidden focus:border-orange-500"
                    />
                    <button
                      onClick={() => handleApplyPromoCode(promoInput)}
                      className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Quick promo suggestion buttons */}
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-stone-500">Quick deals:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoInput('STUDENT10');
                        handleApplyPromoCode('STUDENT10');
                      }}
                      className="text-orange-700 hover:underline font-semibold cursor-pointer"
                    >
                      STUDENT10 (10% off)
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoInput('EXAMBOOST');
                        handleApplyPromoCode('EXAMBOOST');
                      }}
                      className="text-orange-700 hover:underline font-semibold cursor-pointer"
                    >
                      EXAMBOOST ($3 off)
                    </button>
                  </div>

                  {promoMessage && (
                    <p className={`text-[11px] ${promoMessage.error ? 'text-rose-600' : 'text-emerald-600'} font-medium`}>
                      {promoMessage.text}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Summary & Checkout */}
              <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 space-y-3">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-900">${totals.subtotal.toFixed(2)}</span>
                  </div>

                  {totals.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Campus Promo Discount</span>
                      <span>-${totals.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Subsidized Campus Tax (5%)</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-1.5 border-t border-stone-200">
                    <span>Total Amount</span>
                    <span className="text-base text-orange-600">${totals.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Queue status banner */}
                <div className="flex items-center justify-between bg-orange-100/70 text-orange-950 p-2.5 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-700 shrink-0" />
                    <span>
                      {orderType === 'immediate'
                        ? `Est. wait: ~${estimatedWait} mins`
                        : `Ready at ${activeSlot.timeRange}`}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-white/80 px-1.5 py-0.5 rounded text-orange-900">
                    Digital Token
                  </span>
                </div>

                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Pay & Get Pickup Token</span>
                  <div className="flex items-center gap-1.5">
                    <span>${totals.total.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
