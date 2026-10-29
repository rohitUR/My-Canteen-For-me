import React from 'react';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  Wallet, 
  ChefHat, 
  Clock, 
  BellRing, 
  Plus, 
  History, 
  Database,
  Flame,
} from 'lucide-react';
import { Order, StudentProfile } from '../types/canteen';

interface NavbarProps {
  student: StudentProfile;
  cartCount: number;
  orders: Order[];
  viewMode: 'student' | 'kitchen';
  onToggleViewMode: (mode: 'student' | 'kitchen') => void;
  onOpenCart: () => void;
  onOpenWallet: () => void;
  onOpenHistory: () => void;
  onOpenActiveOrder: (order: Order) => void;
  onOpenPeakHeatmap: () => void;
  onOpenSupabaseSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  student,
  cartCount,
  orders,
  viewMode,
  onToggleViewMode,
  onOpenCart,
  onOpenWallet,
  onOpenHistory,
  onOpenActiveOrder,
  onOpenPeakHeatmap,
  onOpenSupabaseSync,
}) => {
  // Find orders currently ready or preparing
  const activeOrders = orders.filter(
    (o) => o.status === 'placed' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready'
  );
  const readyOrders = activeOrders.filter((o) => o.status === 'ready');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top micro-banner for peak alert */}
      <div className="bg-amber-500 text-stone-900 text-xs py-1 px-3 sm:px-4 font-medium">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <Flame className="w-3.5 h-3.5 text-stone-900 shrink-0 animate-pulse" />
            <span className="truncate">
              <strong>Peak Lunch (12-2 PM)</strong> · Pre-order for break to skip lines!
            </span>
          </div>
          <button
            onClick={onOpenPeakHeatmap}
            className="hover:underline font-bold cursor-pointer text-stone-900 flex items-center gap-1 text-xs shrink-0"
          >
            <span>Live Waits</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleViewMode('student')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm group-hover:bg-orange-700 transition-colors">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-900 tracking-tight text-base sm:text-lg leading-none">CampuServe</span>
                <span className="hidden sm:inline-block text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded tracking-wide uppercase">
                  5 Stalls Open
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 font-normal leading-tight mt-0.5 truncate max-w-[150px] sm:max-w-none">
                Digital Canteen & Rush-Free Pickups
              </p>
            </div>
          </button>

          {/* Mode Switcher pill */}
          <div className="hidden md:flex items-center bg-stone-100 p-1 rounded-lg ml-3 border border-stone-200">
            <button
              onClick={() => onToggleViewMode('student')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'student'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Student Order View
            </button>
            <button
              onClick={() => onToggleViewMode('kitchen')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'kitchen'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen Display ({activeOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active order token ticker if any */}
          {activeOrders.length > 0 && (
            <button
              onClick={() => onOpenActiveOrder(readyOrders[0] || activeOrders[0])}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                readyOrders.length > 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 animate-pulse'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
              title="View live pickup token and order status"
            >
              <BellRing className={`w-3.5 h-3.5 ${readyOrders.length > 0 ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div className="text-left">
                <span className="font-bold">
                  {readyOrders.length > 0 ? (
                    <>
                      <span className="hidden sm:inline">Token </span>#{readyOrders[0].tokenNumber} Ready!
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Token </span>#{activeOrders[0].tokenNumber}
                    </>
                  )}
                </span>
                <span className="hidden md:inline text-stone-500 ml-1">
                  ({activeOrders.length} active)
                </span>
              </div>
            </button>
          )}

          {/* Student Profile / Campus Wallet */}
          <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg p-1">
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
              title="Campus ID Card Wallet Balance"
            >
              <Wallet className="w-3.5 h-3.5 text-orange-600" />
              <span className="font-semibold text-stone-900">${student.walletBalance.toFixed(2)}</span>
            </button>
            <button
              onClick={onOpenWallet}
              className="w-6 h-6 rounded bg-orange-100 hover:bg-orange-200 text-orange-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Add money to campus wallet"
              aria-label="Add money to campus wallet"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Past Orders / History */}
          <button
            onClick={onOpenHistory}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title="My Orders & 1-Click Reorder"
            aria-label="Past Orders"
          >
            <History className="w-5 h-5" />
          </button>

          {/* Supabase Database Connection */}
          {onOpenSupabaseSync && (
            <button
              onClick={onOpenSupabaseSync}
              className="p-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-emerald-200/60"
              title="Supabase Database Status & SQL Setup"
              aria-label="Supabase Database Status"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline text-[11px] font-bold text-emerald-800">
                Supabase
              </span>
            </button>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm px-3.5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-semibold">Cart</span>
            {cartCount > 0 && (
              <span className="bg-white text-orange-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile view switch */}
          <button
            onClick={() => onToggleViewMode(viewMode === 'student' ? 'kitchen' : 'student')}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg border border-stone-200"
            title="Toggle Kitchen View"
          >
            <ChefHat className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
