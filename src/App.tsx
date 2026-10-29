import React, { useState, useEffect } from 'react';
import { 
  CANTEEN_STALLS, 
  INITIAL_MENU_ITEMS, 
  INITIAL_ORDERS, 
  INITIAL_STUDENT 
} from './data/mockCanteenData';
import { 
  CartCustomizationSelection, 
  CartItem, 
  CanteenStall, 
  MenuItem, 
  Order, 
  OrderStatus, 
  StudentProfile 
} from './types/canteen';
import { filterMenuItems } from './utils/canteenRules';
import { Navbar } from './components/Navbar';
import { PeakRushWidget } from './components/PeakRushWidget';
import { StallSelector } from './components/StallSelector';
import { CategoryAndFilterBar } from './components/CategoryAndFilterBar';
import { MenuItemCard } from './components/MenuItemCard';
import { ItemCustomizationModal } from './components/ItemCustomizationModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTokenModal } from './components/OrderTokenModal';
import { PeakHeatmapModal } from './components/PeakHeatmapModal';
import { KitchenStaffView } from './components/KitchenStaffView';
import { WalletModal } from './components/WalletModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { 
  saveOrderToSupabase, 
  updateOrderStatusInSupabase, 
  fetchOrdersFromSupabase 
} from './services/supabaseClient';
import { Utensils, Sparkles, Zap, Clock, ShieldCheck, Flame } from 'lucide-react';

export default function App() {
  // Core State
  const [student, setStudent] = useState<StudentProfile>(INITIAL_STUDENT);
  const [stalls, setStalls] = useState<CanteenStall[]>(CANTEEN_STALLS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [viewMode, setViewMode] = useState<'student' | 'kitchen'>('student');

  // Filters & Search State
  const [selectedStallId, setSelectedStallId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [expressOnly, setExpressOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart Configuration
  const [orderType, setOrderType] = useState<'immediate' | 'scheduled_slot'>('immediate');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-2');
  const [appliedPromo, setAppliedPromo] = useState<string>('STUDENT10');

  // Modal States
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [activeTokenOrder, setActiveTokenOrder] = useState<Order | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  // Sync orders from Supabase on mount
  useEffect(() => {
    fetchOrdersFromSupabase().then((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders((prev) => {
          const remoteIds = new Set(remoteOrders.map((o) => o.id));
          const uniqueLocal = prev.filter((o) => !remoteIds.has(o.id));
          return [...remoteOrders, ...uniqueLocal];
        });
      }
    });
  }, []);

  // Filtered menu items
  const filteredItems = filterMenuItems(
    menuItems,
    searchQuery,
    selectedStallId,
    selectedCategory,
    selectedDietary,
    expressOnly
  );

  // Cart Actions
  const handleOpenCustomization = (item: MenuItem) => {
    if (item.customizationOptions && item.customizationOptions.length > 0) {
      setCustomizingItem(item);
      setIsCustomizationOpen(true);
    } else {
      // Direct add to cart
      handleAddToCart(item, 1, {}, 0, '');
    }
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    selectedCustomizations: CartCustomizationSelection,
    extraPrice: number,
    specialInstructions: string
  ) => {
    setCartItems((prev) => {
      // Check if identical customization already in cart
      const existingIndex = prev.findIndex(
        (ci) =>
          ci.menuItem.id === item.id &&
          JSON.stringify(ci.selectedCustomizations) === JSON.stringify(selectedCustomizations) &&
          ci.specialInstructions === specialInstructions
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        const updatedQty = copy[existingIndex].quantity + quantity;
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: updatedQty,
          itemTotalPrice: (item.price + extraPrice) * updatedQty,
        };
        return copy;
      }

      const newCartItem: CartItem = {
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        menuItem: item,
        quantity,
        selectedCustomizations,
        customizationsExtraPrice: extraPrice,
        itemTotalPrice: (item.price + extraPrice) * quantity,
        specialInstructions,
      };

      return [...prev, newCartItem];
    });

    // Provide quick tactile feedback
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const singlePrice = item.menuItem.price + item.customizationsExtraPrice;
          return {
            ...item,
            quantity: newQty,
            itemTotalPrice: singlePrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order Placement
  const handleOrderPlaced = (newOrder: Order, updatedWalletBalance: number) => {
    setOrders((prev) => [newOrder, ...prev]);
    setStudent((prev) => ({
      ...prev,
      walletBalance: updatedWalletBalance,
    }));
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);

    // Save order details to Supabase in background
    saveOrderToSupabase(newOrder).catch((err) => {
      console.warn('[Supabase Sync Error]', err);
    });

    // Open digital token ticket immediately
    setActiveTokenOrder(newOrder);
    setIsTokenModalOpen(true);
  };

  // Advancing order status (works for student simulation and kitchen staff)
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return { ...o, status: newStatus };
        }
        return o;
      })
    );

    // Update status in Supabase in background
    updateOrderStatusInSupabase(orderId, newStatus).catch((err) => {
      console.warn('[Supabase Update Error]', err);
    });

    if (activeTokenOrder && activeTokenOrder.id === orderId) {
      setActiveTokenOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleAdvanceOrderStatus = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const sequence: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'ready', 'collected'];
    const currentIdx = sequence.indexOf(targetOrder.status);
    if (currentIdx < sequence.length - 1) {
      const nextStatus = sequence[currentIdx + 1];
      handleUpdateOrderStatus(orderId, nextStatus);
    }
  };

  // 1-Click Reorder Combo
  const handleReorderCombo = (order: Order) => {
    setCartItems(order.items);
    setIsHistoryOpen(false);
    setIsCartOpen(true);
  };

  // Top Up Wallet
  const handleTopUpWallet = (amount: number) => {
    setStudent((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + amount,
    }));
  };

  // 86 / Toggle Stock
  const handleToggleItemAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, isAvailable: !item.isAvailable };
        }
        return item;
      })
    );
  };

  const cartTotalItemsCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Navbar with brand, live rush alert, wallet, active tokens */}
      <Navbar
        student={student}
        cartCount={cartTotalItemsCount}
        orders={orders}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenActiveOrder={(order) => {
          setActiveTokenOrder(order);
          setIsTokenModalOpen(true);
        }}
        onOpenPeakHeatmap={() => setIsHeatmapOpen(true)}
        onOpenSupabaseSync={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {viewMode === 'kitchen' ? (
          <KitchenStaffView
            orders={orders}
            stalls={stalls}
            menuItems={menuItems}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onToggleItemAvailability={handleToggleItemAvailability}
            onBackToStudentView={() => setViewMode('student')}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {/* Peak Rush Widget / Anti-Queue Hero */}
            <PeakRushWidget
              expressOnly={expressOnly}
              onToggleExpress={setExpressOnly}
              onOpenPeakHeatmap={() => setIsHeatmapOpen(true)}
              onOpenSlotSelector={() => {
                setOrderType('scheduled_slot');
                setIsCartOpen(true);
              }}
            />

            {/* Stall / Counter Selector */}
            <StallSelector
              stalls={stalls}
              selectedStallId={selectedStallId}
              onSelectStall={setSelectedStallId}
            />

            {/* Category tabs, Dietary filter, Search */}
            <CategoryAndFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedDietary={selectedDietary}
              onSelectDietary={setSelectedDietary}
              expressOnly={expressOnly}
              onToggleExpress={setExpressOnly}
            />

            {/* Results count indicator */}
            <div className="flex items-center justify-between mb-4 text-xs text-stone-500">
              <span>
                Showing <strong>{filteredItems.length}</strong> items across campus counters
              </span>
              {expressOnly && (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Showing &le; 4 min express picks only
                </span>
              )}
            </div>

            {/* Menu Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h3 className="font-bold text-stone-900 text-base">No dishes found</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Try clearing your search query or adjusting your dietary filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStallId('all');
                    setSelectedCategory('all');
                    setSelectedDietary('all');
                    setExpressOnly(false);
                  }}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onSelect={handleOpenCustomization}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        orderType={orderType}
        onChangeOrderType={setOrderType}
        selectedSlotId={selectedSlotId}
        onSelectSlotId={setSelectedSlotId}
        appliedPromo={appliedPromo}
        onApplyPromo={setAppliedPromo}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Item Customization Modal */}
      <ItemCustomizationModal
        item={customizingItem}
        isOpen={isCustomizationOpen}
        onClose={() => {
          setIsCustomizationOpen(false);
          setCustomizingItem(null);
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        student={student}
        orderType={orderType}
        selectedSlotId={selectedSlotId}
        appliedPromo={appliedPromo}
        onOrderPlaced={handleOrderPlaced}
        onOpenWalletTopUp={() => setIsWalletOpen(true)}
      />

      {/* Digital Order Token Ticket Modal */}
      <OrderTokenModal
        order={activeTokenOrder}
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onAdvanceOrderStatus={handleAdvanceOrderStatus}
      />

      {/* Peak Hour Heatmap Modal */}
      <PeakHeatmapModal
        isOpen={isHeatmapOpen}
        onClose={() => setIsHeatmapOpen(false)}
        onSelectSlotFromModal={() => {
          setOrderType('scheduled_slot');
          setIsCartOpen(true);
        }}
      />

      {/* Campus Wallet Modal */}
      <WalletModal
        student={student}
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onTopUp={handleTopUpWallet}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        orders={orders}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onReorder={handleReorderCombo}
        onOpenOrderToken={(order) => {
          setActiveTokenOrder(order);
          setIsTokenModalOpen(true);
        }}
      />

      {/* Supabase Database Sync Modal */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        ordersCount={orders.length}
        onSyncRefresh={() => {
          fetchOrdersFromSupabase().then((remoteOrders) => {
            if (remoteOrders && remoteOrders.length > 0) {
              setOrders(remoteOrders);
            }
          });
        }}
      />
    </div>
  );
}
