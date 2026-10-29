import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Smartphone,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Order, StudentProfile } from '../types/canteen';
import { calculateCartTotals, generateTokenNumber, getScheduledBreakSlots } from '../utils/canteenRules';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  student: StudentProfile;
  orderType: 'immediate' | 'scheduled_slot';
  selectedSlotId: string;
  appliedPromo: string;
  onOrderPlaced: (order: Order, updatedWalletBalance: number) => void;
  onOpenWalletTopUp: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  student,
  orderType,
  selectedSlotId,
  appliedPromo,
  onOrderPlaced,
  onOpenWalletTopUp,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'card'>('wallet');
  const [upiProcessing, setUpiProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || items.length === 0) return null;

  const totals = calculateCartTotals(items, appliedPromo);
  const breakSlots = getScheduledBreakSlots();
  const activeSlot = breakSlots.find((s) => s.id === selectedSlotId) || breakSlots[0];

  const primaryCounterNumber = items[0]?.menuItem.counterNumber || 1;
  const primaryCounterCode = items[0]?.menuItem.counterCode || 'A';
  const primaryStallName = items[0]?.menuItem.stallName || 'Campus Canteen';

  const hasSufficientWalletBalance = student.walletBalance >= totals.total;

  const handleCompletePayment = () => {
    setErrorMessage('');

    if (paymentMethod === 'wallet' && !hasSufficientWalletBalance) {
      setErrorMessage(`Insufficient wallet balance ($${student.walletBalance.toFixed(2)}). Please top up or choose UPI.`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Trigger joyful celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }

      const seqNumber = Math.floor(Math.random() * 800) + 100;
      const tokenNumber = generateTokenNumber(primaryCounterCode, seqNumber);
      const orderId = `ord-${Date.now().toString().slice(-5)}`;
      const newWalletBalance = paymentMethod === 'wallet' ? student.walletBalance - totals.total : student.walletBalance;

      const newOrder: Order = {
        id: orderId,
        tokenNumber,
        studentId: student.id,
        studentName: student.name,
        studentRoll: student.rollNumber,
        items: [...items],
        subtotal: totals.subtotal,
        discount: totals.discount,
        promoCodeApplied: appliedPromo || undefined,
        tax: totals.tax,
        totalAmount: totals.total,
        paymentMethod,
        paymentStatus: 'paid',
        orderType,
        scheduledSlotTime: orderType === 'scheduled_slot' ? activeSlot.timeRange : undefined,
        status: 'placed',
        counterNumber: primaryCounterNumber,
        counterCode: primaryCounterCode,
        stallName: primaryStallName,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        estimatedPickupTime: orderType === 'scheduled_slot' ? activeSlot.timeRange : 'Ready in ~8 mins',
        pickupCode: `PICKUP-${tokenNumber}-${Math.floor(100 + Math.random() * 900)}`,
      };

      setIsSubmitting(false);
      onOrderPlaced(newOrder, newWalletBalance);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 id="checkout-modal-title" className="font-bold text-stone-900 text-base">
                Secure Canteen Checkout
              </h3>
              <p className="text-xs text-stone-500">
                Total to pay: <strong className="text-stone-900">${totals.total.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Student Profile Info */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-stone-900">{student.name}</span>
              <span className="font-mono bg-stone-200/80 text-stone-800 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                {student.rollNumber}
              </span>
            </div>
            <p className="text-stone-500 text-[11px]">
              {student.department} · {student.email}
            </p>
            <div className="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between text-stone-700 text-[11px]">
              <span>Pickup Mode:</span>
              <span className="font-bold text-orange-700">
                {orderType === 'scheduled_slot' ? `Break Slot (${activeSlot.timeRange})` : 'Immediate Token Queue'}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
              Choose Payment Method
            </label>

            {/* Option 1: Student Campus Wallet */}
            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod === 'wallet'
                  ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">Campus ID Card Wallet</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        1-Tap Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Current Balance: <strong className="text-stone-900">${student.walletBalance.toFixed(2)}</strong>
                    </p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'wallet'
                      ? 'border-orange-600 bg-orange-600 text-white'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {paymentMethod === 'wallet' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {!hasSufficientWalletBalance && paymentMethod === 'wallet' && (
                <div className="mt-2.5 pt-2 border-t border-orange-200 flex items-center justify-between text-xs text-rose-700">
                  <span>Balance is low for this order.</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWalletTopUp();
                    }}
                    className="font-bold underline text-orange-700 hover:text-orange-900 cursor-pointer"
                  >
                    + Add $10 to Wallet
                  </button>
                </div>
              )}
            </button>

            {/* Option 2: UPI / QR Pay */}
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod === 'upi'
                  ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900">UPI / QR Code Scan</span>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      PhonePe · Google Pay · Paytm · Any UPI app
                    </p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'upi'
                      ? 'border-orange-600 bg-orange-600 text-white'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {paymentMethod === 'upi' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {paymentMethod === 'upi' && (
                <div className="mt-3 pt-3 border-t border-stone-200 flex flex-col items-center bg-white p-3 rounded-lg border border-stone-100">
                  <div className="w-32 h-32 bg-stone-100 rounded-lg border border-stone-200 flex flex-col items-center justify-center p-2 text-center mb-2">
                    {/* Simulated SVG QR */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-stone-800">
                      <rect x="10" y="10" width="25" height="25" fill="currentColor" />
                      <rect x="15" y="15" width="15" height="15" fill="#fff" />
                      <rect x="18" y="18" width="9" height="9" fill="currentColor" />
                      
                      <rect x="65" y="10" width="25" height="25" fill="currentColor" />
                      <rect x="70" y="15" width="15" height="15" fill="#fff" />
                      <rect x="73" y="18" width="9" height="9" fill="currentColor" />

                      <rect x="10" y="65" width="25" height="25" fill="currentColor" />
                      <rect x="15" y="70" width="15" height="15" fill="#fff" />
                      <rect x="18" y="73" width="9" height="9" fill="currentColor" />

                      <rect x="42" y="20" width="8" height="8" fill="currentColor" />
                      <rect x="52" y="28" width="8" height="8" fill="currentColor" />
                      <rect x="42" y="45" width="16" height="16" fill="currentColor" />
                      <rect x="65" y="45" width="8" height="8" fill="currentColor" />
                      <rect x="42" y="70" width="8" height="15" fill="currentColor" />
                      <rect x="65" y="70" width="18" height="8" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-stone-800">
                    Scan with any UPI App (${totals.total.toFixed(2)})
                  </span>
                  <span className="text-[10px] text-stone-500">
                    Auto-verifies upon completion
                  </span>
                </div>
              )}
            </button>

            {/* Option 3: Card */}
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod === 'card'
                  ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900">Student Debit / Credit Card</span>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Visa · MasterCard · RuPay (Ending in •••• 9241)
                    </p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'card'
                      ? 'border-orange-600 bg-orange-600 text-white'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {paymentMethod === 'card' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 space-y-2">
          <button
            onClick={handleCompletePayment}
            disabled={isSubmitting || (paymentMethod === 'wallet' && !hasSufficientWalletBalance)}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Authorizing Payment...</span>
            ) : (
              <>
                <span>Confirm & Generate Token (${totals.total.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5">
            <span>Encrypted campus transaction · Direct settlement to Counter #{primaryCounterNumber}</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold">Synced to Supabase</span>
          </p>
        </div>
      </div>
    </div>
  );
};
