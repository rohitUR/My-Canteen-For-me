import React from 'react';
import { X, Clock, Users, Zap, Calendar, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PEAK_HOURS_DATA } from '../data/mockCanteenData';

interface PeakHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSlotFromModal: () => void;
}

export const PeakHeatmapModal: React.FC<PeakHeatmapModalProps> = ({
  isOpen,
  onClose,
  onSelectSlotFromModal,
}) => {
  if (!isOpen) return null;

  const currentHour = new Date().getHours();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="peak-heatmap-title"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="peak-heatmap-title" className="font-bold text-stone-900 text-lg">
                Canteen Peak Hour Heatmap
              </h3>
              <p className="text-xs text-stone-500">
                Average waiting times & counter occupancy by hour
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="font-semibold text-stone-800">Queue Severity:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Low (&lt; 8 mins)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Moderate (8–14 mins)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Peak / Super Peak (15–25 mins)
            </span>
          </div>

          {/* Timeline visualization */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Campus Rush Timetable
            </h4>

            <div className="space-y-2">
              {PEAK_HOURS_DATA.map((slot) => {
                const isCurrent = slot.hour24 === (currentHour >= 8 && currentHour <= 17 ? currentHour : 12);
                let barColor = 'bg-emerald-500';
                let textColor = 'text-emerald-700';
                if (slot.rushLevel === 'moderate') {
                  barColor = 'bg-amber-500';
                  textColor = 'text-amber-700';
                } else if (slot.rushLevel === 'high' || slot.rushLevel === 'super_peak') {
                  barColor = 'bg-rose-500';
                  textColor = 'text-rose-700';
                }

                return (
                  <div
                    key={slot.timeLabel}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                        : 'border-stone-200 bg-white hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 w-16">
                          {slot.timeLabel}
                        </span>
                        <span className="text-stone-600 font-medium">
                          {slot.periodName}
                        </span>
                        {isCurrent && (
                          <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">
                            Current Now
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${textColor}`}>
                          ~{slot.avgWaitMins} min wait
                        </span>
                      </div>
                    </div>

                    {/* Progress visual bar */}
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${barColor} transition-all duration-500`}
                        style={{ width: `${slot.occupancyPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2.5">
            <h5 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              How to never wait in line again:
            </h5>
            <ul className="text-xs text-stone-600 space-y-1.5 pl-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Schedule for Class Breaks:</strong> Choose the pre-order break slot in cart. Your meal is placed in the express pick-up cubby right when bell rings.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Pick Express Items:</strong> Filter items with the ⚡ Express tag (Cold brews, samosas, idlis) which take under 4 minutes.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Digital Token Scanning:</strong> Show your phone token QR directly at the pickup window. No physical paper or cash handover.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-stone-50 border-t border-stone-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Close Heatmap
          </button>
          <button
            onClick={() => {
              onClose();
              onSelectSlotFromModal();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Browse Menu & Pre-Order
          </button>
        </div>
      </div>
    </div>
  );
};
