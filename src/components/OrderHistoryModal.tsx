import React from 'react';
import { X, History, RotateCcw, ArrowRight, CheckCircle2, Clock, Ticket } from 'lucide-react';
import { Order } from '../types/canteen';

interface OrderHistoryModalProps {
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
  onReorder: (order: Order) => void;
  onOpenOrderToken: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  orders,
  isOpen,
  onClose,
  onReorder,
  onOpenOrderToken,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-history-title"
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 id="order-history-title" className="font-bold text-stone-900 text-base">
                Your Canteen Orders
              </h3>
              <p className="text-xs text-stone-500">
                Track active pickups & 1-click reorder favorite meals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close orders dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-500">No past orders yet. Place your first order today!</p>
            </div>
          ) : (
            orders.map((order) => {
              const isActive = order.status !== 'collected';

              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'border-orange-500 bg-orange-50/30 ring-1 ring-orange-500/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900 text-sm">
                          #{order.tokenNumber}
                        </span>
                        <span className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                          Counter {order.counterNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          order.status === 'ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'collected'
                            ? 'bg-stone-100 text-stone-600'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 mt-0.5 block">
                        {order.stallName} · {order.createdAt}
                      </span>
                    </div>

                    <span className="text-sm font-extrabold text-stone-900">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-stone-600 space-y-0.5 my-2">
                    {order.items.map((i) => (
                      <div key={i.cartItemId} className="flex justify-between">
                        <span>{i.quantity}x {i.menuItem.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenOrderToken(order)}
                      className="text-xs font-semibold text-orange-700 hover:text-orange-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>View Token Ticket & QR</span>
                    </button>

                    <button
                      onClick={() => onReorder(order)}
                      className="text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Re-order combo</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
