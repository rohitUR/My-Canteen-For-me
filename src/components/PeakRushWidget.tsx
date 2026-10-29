import React from 'react';
import { Clock, Zap, TrendingUp, CalendarClock, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { getRushLevelForHour } from '../utils/canteenRules';

interface PeakRushWidgetProps {
  expressOnly: boolean;
  onToggleExpress: (val: boolean) => void;
  onOpenPeakHeatmap: () => void;
  onOpenSlotSelector: () => void;
}

export const PeakRushWidget: React.FC<PeakRushWidgetProps> = ({
  expressOnly,
  onToggleExpress,
  onOpenPeakHeatmap,
  onOpenSlotSelector,
}) => {
  const currentHour = new Date().getHours();
  // Simulate active midday rush if current hour is outside regular canteen hours for testing
  const effectiveHour = (currentHour >= 8 && currentHour <= 17) ? currentHour : 12;
  const rush = getRushLevelForHour(effectiveHour);

  return (
    <div className="bg-linear-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-2xl p-4 sm:p-6 mb-8 shadow-md border border-stone-700/50 relative overflow-hidden">
      {/* Subtle backdrop pattern */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Rush Status info */}
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Live Rush Status: {rush.label}
            </span>
            <span className="text-stone-400 text-xs">
              Physical counter wait ~14-18 mins
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Beat the Canteen Rush between lectures
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Don't waste 20 minutes standing in line. Order now and pick up in seconds with your digital token, or schedule your pickup for your exact break period.
          </p>
        </div>

        {/* Right: Anti-Rush Strategies buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Strategy 1: Express < 4 min picks */}
          <button
            onClick={() => onToggleExpress(!expressOnly)}
            className={`flex items-center justify-between sm:justify-start gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer text-left ${
              expressOnly
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-semibold shadow-xs'
                : 'bg-stone-800/80 hover:bg-stone-700/80 text-white border-stone-600/70'
            }`}
            aria-pressed={expressOnly}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <Zap className={`w-4 h-4 ${expressOnly ? 'text-stone-950 fill-stone-950' : 'text-amber-400'}`} />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">
                {expressOnly ? 'Express Filter: ON' : '⚡ Express Quick-Picks'}
              </div>
              <div className={`text-[11px] leading-tight ${expressOnly ? 'text-stone-900' : 'text-stone-400'}`}>
                Ready in ≤ 4 mins (grab & go)
              </div>
            </div>
          </button>

          {/* Strategy 2: Pre-order break slot */}
          <button
            onClick={onOpenPeakHeatmap}
            className="flex items-center justify-between sm:justify-start gap-3 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all border border-orange-500/50 shadow-xs cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
              <CalendarClock className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Peak Rush Heatmap</div>
              <div className="text-[11px] text-orange-100 leading-tight">View hourly wait forecasts</div>
            </div>
            <ChevronRight className="w-4 h-4 text-orange-200 ml-1 hidden sm:block" />
          </button>
        </div>
      </div>
    </div>
  );
};
