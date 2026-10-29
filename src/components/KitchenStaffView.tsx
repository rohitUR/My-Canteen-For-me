import React, { useState } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  ArrowRight, 
  Store, 
  Volume2, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from 'lucide-react';
import { CanteenStall, MenuItem, Order, OrderStatus } from '../types/canteen';

interface KitchenStaffViewProps {
  orders: Order[];
  stalls: CanteenStall[];
  menuItems: MenuItem[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onToggleItemAvailability: (itemId: string) => void;
  onBackToStudentView: () => void;
}

export const KitchenStaffView: React.FC<KitchenStaffViewProps> = ({
  orders,
  stalls,
  menuItems,
  onUpdateOrderStatus,
  onToggleItemAvailability,
  onBackToStudentView,
}) => {
  const [selectedCounter, setSelectedCounter] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');

  const filteredOrders = orders.filter((o) => {
    if (selectedCounter !== 'all' && o.counterNumber !== selectedCounter) return false;
    return true;
  });

  const pendingOrders = filteredOrders.filter((o) => o.status !== 'collected');
  const completedOrders = filteredOrders.filter((o) => o.status === 'collected');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Staff Bar */}
      <div className="bg-stone-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Kitchen & Counter KDS</h2>
              <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded font-mono font-bold">
                Live POS
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Manage incoming tickets, mark food ready, and prevent peak rush bottlenecks
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tab Switcher */}
          <div className="bg-stone-800 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-orange-600 text-white' : 'text-stone-300 hover:text-white'
              }`}
            >
              Live Orders ({pendingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'inventory' ? 'bg-orange-600 text-white' : 'text-stone-300 hover:text-white'
              }`}
            >
              86 / Stock Inventory
            </button>
          </div>

          <button
            onClick={onBackToStudentView}
            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Switch to Student View
          </button>
        </div>
      </div>

      {/* Counter Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCounter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedCounter === 'all'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          All Counters ({orders.length})
        </button>

        {stalls.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedCounter(s.counterNumber)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedCounter === s.counterNumber
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span>Counter {s.counterNumber}: {s.name}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: LIVE ORDERS GRID */}
      {activeTab === 'orders' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">
              Active Queue ({pendingOrders.length} In-Progress)
            </h3>
            <span className="text-xs text-stone-500">
              Advance ticket status to notify students instantly
            </span>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-bold text-stone-900 text-base">Queue Cleared!</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                No pending kitchen orders for this counter. Ready for next rush batch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingOrders.map((order) => {
                const isReady = order.status === 'ready';
                const isPrep = order.status === 'preparing';

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xs ${
                      isReady
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : isPrep
                        ? 'border-orange-400 ring-2 ring-orange-400/20'
                        : 'border-stone-200'
                    }`}
                  >
                    {/* Ticket Header */}
                    <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-mono font-black text-stone-900">
                            #{order.tokenNumber}
                          </span>
                          <span className="text-[10px] font-bold bg-stone-200 px-1.5 py-0.5 rounded text-stone-800">
                            Counter {order.counterNumber}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 mt-0.5 block">
                          Student: {order.studentName} ({order.studentRoll})
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isReady
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPrep
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone-200 text-stone-700'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          {order.createdAt}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Items */}
                    <div className="p-4 space-y-2.5 flex-1">
                      {order.orderType === 'scheduled_slot' && (
                        <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg text-[11px] font-semibold text-orange-800">
                          Scheduled for: {order.scheduledSlotTime}
                        </div>
                      )}

                      <div className="space-y-2">
                        {order.items.map((it) => (
                          <div key={it.cartItemId} className="text-xs">
                            <div className="flex justify-between font-bold text-stone-900">
                              <span>
                                {it.quantity}x {it.menuItem.name}
                              </span>
                            </div>

                            {/* Customizations */}
                            {Object.entries(it.selectedCustomizations).length > 0 && (
                              <div className="text-[10px] text-stone-500 pl-3">
                                {Object.entries(it.selectedCustomizations).map(([k, v]) => (
                                  <span key={k} className="mr-2">
                                    • {k}: {v}
                                  </span>
                                ))}
                              </div>
                            )}

                            {it.specialInstructions && (
                              <p className="text-[10px] text-amber-700 font-medium pl-3 italic">
                                Note: {it.specialInstructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
                      {order.status === 'placed' || order.status === 'confirmed' ? (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                          className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          <span>Start Cooking</span>
                        </button>
                      ) : order.status === 'preparing' ? (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Food Ready & Alert Student</span>
                        </button>
                      ) : order.status === 'ready' ? (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'collected')}
                          className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Handed Over & Completed</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: 86 / INVENTORY AVAILABILITY TOGGLE */
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Real-Time Stall Inventory & Sold Out (86) Controls
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Toggle items out of stock during sudden peak rushes so students don't order exhausted ingredients
              </p>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {menuItems
              .filter((item) => selectedCounter === 'all' || item.counterNumber === selectedCounter)
              .map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Counter {item.counterNumber} · {item.stallName} · ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleItemAvailability(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      item.isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    <span>{item.isAvailable ? 'In Stock (Active)' : 'Marked Sold Out'}</span>
                    <span className="w-2 h-2 rounded-full bg-current" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
