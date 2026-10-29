import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Volume2, 
  Store, 
  Sparkles, 
  ArrowRight,
  Flame,
  ChefHat
} from 'lucide-react';
import { Order, OrderStatus } from '../types/canteen';

interface OrderTokenModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceOrderStatus?: (orderId: string) => void;
}

export const OrderTokenModal: React.FC<OrderTokenModalProps> = ({
  order,
  isOpen,
  onClose,
  onAdvanceOrderStatus,
}) => {
  if (!isOpen || !order) return null;

  const isReady = order.status === 'ready';
  const isCollected = order.status === 'collected';

  const stages: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'placed', label: 'Order Placed', desc: 'Received in queue' },
    { key: 'confirmed', label: 'Kitchen Confirmed', desc: 'Ticket printed' },
    { key: 'preparing', label: 'Cooking & Plating', desc: 'Chef on the wok' },
    { key: 'ready', label: 'Ready for Pickup', desc: `At Counter #${order.counterNumber}` },
    { key: 'collected', label: 'Collected', desc: 'Enjoy your meal!' },
  ];

  const getStageIndex = (st: OrderStatus) => {
    switch (st) {
      case 'placed': return 0;
      case 'confirmed': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'collected': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(order.status);

  // Play audio chime if clicked
  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      // AudioContext not allowed or not supported
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-token-heading"
        className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col"
      >
        {/* Header */}
        <div className={`p-5 text-center relative transition-colors ${
          isReady 
            ? 'bg-emerald-600 text-white' 
            : isCollected
            ? 'bg-stone-800 text-white'
            : 'bg-stone-900 text-white'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Close digital token"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="text-[11px] uppercase tracking-widest font-bold opacity-80 block mb-1">
            Digital Pickup Token
          </span>

          <h2 id="order-token-heading" className="text-4xl sm:text-5xl font-black tracking-tight font-mono">
            #{order.tokenNumber}
          </h2>

          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
            <Store className="w-3.5 h-3.5" />
            <span>Counter {order.counterNumber} · {order.stallName}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 flex-1 overflow-y-auto">
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isReady
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : isCollected
              ? 'bg-stone-50 border-stone-200 text-stone-700'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                isReady ? 'bg-emerald-600 text-white animate-bounce' : 'bg-amber-500 text-stone-950'
              }`}>
                {isReady ? '🔔' : '⏳'}
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm">
                  {isReady
                    ? `Food is ready at Counter #${order.counterNumber}!`
                    : isCollected
                    ? 'Order completed & picked up'
                    : `In Kitchen: ${order.estimatedPickupTime}`}
                </h4>
                <p className="text-[11px] opacity-80">
                  {isReady
                    ? 'Show QR code below to the cashier to collect'
                    : order.orderType === 'scheduled_slot'
                    ? `Scheduled for ${order.scheduledSlotTime}`
                    : 'Estimated prep countdown running'}
                </p>
              </div>
            </div>

            {isReady && (
              <button
                onClick={playAlertSound}
                className="p-2 bg-emerald-200 hover:bg-emerald-300 text-emerald-950 rounded-lg cursor-pointer"
                title="Play Chime"
                aria-label="Play ready alert chime"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress Tracker Stepper */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Kitchen Preparation Status
            </h4>

            <div className="space-y-2">
              {stages.map((st, idx) => {
                const isPassed = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                return (
                  <div
                    key={st.key}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-orange-500 bg-orange-50/60 ring-1 ring-orange-500'
                        : isPassed
                        ? 'border-stone-200 bg-stone-50 opacity-90'
                        : 'border-dashed border-stone-200 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isPassed
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-orange-600 text-white'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <div>
                        <span className={`text-xs block ${isCurrent ? 'font-bold text-stone-900' : 'font-medium text-stone-700'}`}>
                          {st.label}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {st.desc}
                        </span>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full animate-pulse">
                        Active Stage
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification QR Code Section */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-center flex flex-col items-center">
            <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs mb-2">
              <svg viewBox="0 0 100 100" className="w-28 h-28 text-stone-900">
                <rect x="5" y="5" width="28" height="28" fill="currentColor" />
                <rect x="11" y="11" width="16" height="16" fill="#fff" />
                <rect x="14" y="14" width="10" height="10" fill="currentColor" />

                <rect x="67" y="5" width="28" height="28" fill="currentColor" />
                <rect x="73" y="11" width="16" height="16" fill="#fff" />
                <rect x="76" y="14" width="10" height="10" fill="currentColor" />

                <rect x="5" y="67" width="28" height="28" fill="currentColor" />
                <rect x="11" y="73" width="16" height="16" fill="#fff" />
                <rect x="14" y="76" width="10" height="10" fill="currentColor" />

                <rect x="38" y="15" width="10" height="10" fill="currentColor" />
                <rect x="52" y="24" width="10" height="10" fill="currentColor" />
                <rect x="38" y="38" width="24" height="24" fill="currentColor" />
                <rect x="67" y="44" width="12" height="12" fill="currentColor" />
                <rect x="38" y="67" width="12" height="20" fill="currentColor" />
                <rect x="67" y="67" width="24" height="10" fill="currentColor" />
              </svg>
            </div>

            <span className="font-mono text-xs font-bold text-stone-900">
              {order.pickupCode}
            </span>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Cashier scans this at Counter #{order.counterNumber} window for instant pickup
            </p>
          </div>

          {/* Items breakdown list */}
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Ordered Items ({order.items.length})
            </h5>
            <div className="divide-y divide-stone-100 text-xs">
              {order.items.map((i) => (
                <div key={i.cartItemId} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-stone-900">
                      {i.quantity}x {i.menuItem.name}
                    </span>
                    {i.specialInstructions && (
                      <p className="text-[10px] text-stone-500">"{i.specialInstructions}"</p>
                    )}
                  </div>
                  <span className="font-bold text-stone-800">${i.itemTotalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with testing advancement helper */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          {onAdvanceOrderStatus && !isCollected && (
            <button
              onClick={() => onAdvanceOrderStatus(order.id)}
              className="text-xs font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Fast-forward order stage for simulation"
            >
              <span>Simulate Kitchen Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
