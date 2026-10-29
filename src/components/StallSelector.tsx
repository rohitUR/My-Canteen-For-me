import React from 'react';
import { Store, Users, Clock } from 'lucide-react';
import { CanteenStall } from '../types/canteen';

interface StallSelectorProps {
  stalls: CanteenStall[];
  selectedStallId: string;
  onSelectStall: (stallId: string) => void;
}

export const StallSelector: React.FC<StallSelectorProps> = ({
  stalls,
  selectedStallId,
  onSelectStall,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Store className="w-4 h-4 text-orange-600" />
          <span>Canteen Counters & Stalls</span>
        </h3>
        <span className="text-xs text-stone-500">
          Select counter to view specific menu & queue
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* All Counters Option */}
        <button
          onClick={() => onSelectStall('all')}
          className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedStallId === 'all'
              ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
              : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              All Counters
            </span>
          </div>
          <span className="font-bold text-sm leading-tight">Full Menu</span>
          <span className={`text-[11px] mt-1 ${selectedStallId === 'all' ? 'text-stone-300' : 'text-stone-500'}`}>
            Browse all 5 stalls
          </span>
        </button>

        {/* Individual Stalls */}
        {stalls.map((stall) => {
          const isSelected = selectedStallId === stall.id;

          return (
            <button
              key={stall.id}
              onClick={() => onSelectStall(stall.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                  : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    isSelected ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  Counter {stall.counterNumber}
                </span>

                <span
                  className={`flex items-center gap-1 text-[11px] font-semibold ${
                    isSelected ? 'text-orange-100' : 'text-stone-500'
                  }`}
                  title={`${stall.queueCount} orders in queue`}
                >
                  <Users className="w-3 h-3" />
                  {stall.queueCount}
                </span>
              </div>

              <span className="font-bold text-xs sm:text-sm leading-tight truncate w-full">
                {stall.name}
              </span>

              <span
                className={`text-[10px] mt-1 truncate w-full flex items-center gap-1 ${
                  isSelected ? 'text-orange-100' : 'text-stone-500'
                }`}
              >
                <Clock className="w-2.5 h-2.5 shrink-0" />
                ~{stall.avgWaitMins} min wait
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
