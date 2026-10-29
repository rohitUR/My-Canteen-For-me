import React, { useState } from 'react';
import { X, Wallet, Plus, CreditCard, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { StudentProfile } from '../types/canteen';

interface WalletModalProps {
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  student,
  isOpen,
  onClose,
  onTopUp,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleRecharge = () => {
    onTopUp(selectedAmount);
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 id="wallet-modal-title" className="font-bold text-stone-900 text-base">
                Campus Student Wallet
              </h3>
              <p className="text-xs text-stone-500">
                1-tap cashless payments at all counters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close wallet dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Digital Student ID Card Visual */}
          <div className="bg-linear-to-tr from-stone-900 via-stone-800 to-orange-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden border border-stone-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase block mb-1">
                  University Canteen Pass
                </span>
                <h4 className="font-bold text-base tracking-tight">{student.name}</h4>
                <p className="text-xs text-stone-300 font-mono mt-0.5">{student.rollNumber}</p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div className="flex justify-between items-end pt-3 border-t border-stone-700/60">
              <div>
                <span className="text-[10px] text-stone-400 block">Available Balance</span>
                <span className="text-2xl font-black font-mono tracking-tight text-white">
                  ${student.walletBalance.toFixed(2)}
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-semibold">
                Active & Verified
              </span>
            </div>
          </div>

          {/* Quick Top-Up Options */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
              Instant Reload Amount
            </label>

            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSelectedAmount(amt)}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                    selectedAmount === amt
                      ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  +${amt}
                </button>
              ))}
            </div>
          </div>

          {successNotice ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Wallet credited +${selectedAmount}.00 successfully!</span>
            </div>
          ) : (
            <button
              onClick={handleRecharge}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Add ${selectedAmount}.00 to Campus Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 text-[11px] text-stone-500 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero fees · Instant recharge via Student Bursar / NetBanking</span>
          </div>
        </div>
      </div>
    </div>
  );
};
