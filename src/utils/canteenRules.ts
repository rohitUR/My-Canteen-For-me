import { CartItem, MenuItem, ScheduledSlotOption, PeakHourSlot } from '../types/canteen';

export const TAX_RATE = 0.05; // 5% subsidized campus food tax

export interface PromoResult {
  valid: boolean;
  discountAmount: number;
  message: string;
}

export function validatePromoCode(rawCode: string, subtotal: number): PromoResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, discountAmount: 0, message: '' };
  }

  if (code === 'STUDENT10') {
    if (subtotal < 5) {
      return { valid: false, discountAmount: 0, message: 'Minimum order $5 required for STUDENT10' };
    }
    const discount = Math.round(subtotal * 0.1 * 100) / 100;
    return { valid: true, discountAmount: discount, message: '10% Student Discount Applied!' };
  }

  if (code === 'EXAMBOOST') {
    if (subtotal < 10) {
      return { valid: false, discountAmount: 0, message: 'Minimum order $10 required for EXAMBOOST' };
    }
    return { valid: true, discountAmount: 3.0, message: '$3.00 Exam Week Boost Discount!' };
  }

  if (code === 'FREEDRINK') {
    if (subtotal < 8) {
      return { valid: false, discountAmount: 0, message: 'Minimum order $8 required for FREEDRINK' };
    }
    return { valid: true, discountAmount: 2.5, message: '$2.50 Beverage Credit Applied!' };
  }

  return { valid: false, discountAmount: 0, message: 'Invalid coupon code' };
}

export function calculateCartTotals(items: CartItem[], promoCode?: string) {
  const subtotal = items.reduce((acc, item) => acc + item.itemTotalPrice, 0);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;

  let discount = 0;
  if (promoCode) {
    const promo = validatePromoCode(promoCode, roundedSubtotal);
    if (promo.valid) {
      discount = Math.min(promo.discountAmount, roundedSubtotal);
    }
  }

  const taxableAmount = Math.max(0, roundedSubtotal - discount);
  const tax = Math.round(taxableAmount * TAX_RATE * 100) / 100;
  const total = Math.round((taxableAmount + tax) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    discount: Math.round(discount * 100) / 100,
    tax,
    total,
  };
}

export function getRushLevelForHour(hour24: number): {
  level: 'low' | 'moderate' | 'high' | 'super_peak';
  multiplier: number;
  label: string;
} {
  // 12 PM - 2 PM: Super peak lunch
  if (hour24 >= 12 && hour24 < 14) {
    return { level: 'super_peak', multiplier: 2.2, label: 'Super Peak (Lunch Rush)' };
  }
  // 10 AM - 11 AM: Morning tea break
  if (hour24 >= 10 && hour24 < 11) {
    return { level: 'high', multiplier: 1.6, label: 'High (Morning Break)' };
  }
  // 4 PM - 5 PM: Evening snack rush
  if (hour24 >= 16 && hour24 < 17) {
    return { level: 'high', multiplier: 1.5, label: 'High (Evening Snack Rush)' };
  }
  // 9 AM - 10 AM or 14 PM - 16 PM: Moderate
  if ((hour24 >= 9 && hour24 < 10) || (hour24 >= 14 && hour24 < 16)) {
    return { level: 'moderate', multiplier: 1.2, label: 'Moderate Flow' };
  }
  return { level: 'low', multiplier: 1.0, label: 'Low Wait Time' };
}

export function calculateEstimatedWaitTime(
  items: CartItem[],
  stallQueueCount: number = 2,
  hour24: number = new Date().getHours(),
  isScheduled: boolean = false
): number {
  if (items.length === 0) return 0;
  
  if (isScheduled) {
    // Scheduled pre-orders are prepared just-in-time, queue wait is bypassed
    return 3;
  }

  // Base time is maximum of item prep times + 1 min per extra item
  const basePrep = Math.max(...items.map((i) => i.menuItem.prepTimeMinutes));
  const additionalPrep = Math.min(items.length - 1, 3); // 1 extra min per distinct item up to 3 mins
  
  const rush = getRushLevelForHour(hour24);
  // Each order in the counter queue adds ~1.5 mins
  const queueDelay = stallQueueCount * 1.5;

  const totalMinutes = Math.round((basePrep + additionalPrep + queueDelay) * (rush.multiplier * 0.7));
  return Math.max(3, totalMinutes);
}

export function generateTokenNumber(counterCode: string, sequenceNumber: number): string {
  const code = (counterCode || 'A').toUpperCase();
  const num = (sequenceNumber % 900) + 100; // e.g., 100..999
  return `${code}-${num}`;
}

export function getScheduledBreakSlots(): ScheduledSlotOption[] {
  return [
    {
      id: 'slot-1',
      timeRange: '10:15 AM - 10:30 AM',
      periodName: 'Morning Tea & Snack Break',
      isPeak: true,
      recommended: false,
      slotsRemaining: 14,
    },
    {
      id: 'slot-2',
      timeRange: '12:00 PM - 12:20 PM',
      periodName: 'Lunch Break Slot A',
      isPeak: true,
      recommended: false,
      slotsRemaining: 6,
    },
    {
      id: 'slot-3',
      timeRange: '12:30 PM - 12:50 PM',
      periodName: 'Lunch Break Slot B',
      isPeak: true,
      recommended: false,
      slotsRemaining: 18,
    },
    {
      id: 'slot-4',
      timeRange: '1:15 PM - 1:35 PM',
      periodName: 'Afternoon Lunch Window',
      isPeak: false,
      recommended: true,
      slotsRemaining: 25,
    },
    {
      id: 'slot-5',
      timeRange: '3:30 PM - 3:50 PM',
      periodName: 'Post-Lecture Coffee & Tea',
      isPeak: false,
      recommended: true,
      slotsRemaining: 30,
    },
    {
      id: 'slot-6',
      timeRange: '5:00 PM - 5:20 PM',
      periodName: 'Evening Study Snack',
      isPeak: false,
      recommended: false,
      slotsRemaining: 20,
    },
  ];
}

export function filterMenuItems(
  items: MenuItem[],
  searchQuery: string,
  stallId: string,
  category: string,
  dietary: string,
  expressOnly: boolean
): MenuItem[] {
  const query = searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    // Search query match
    if (query) {
      const matchName = item.name.toLowerCase().includes(query);
      const matchDesc = item.description.toLowerCase().includes(query);
      const matchTag = item.tags.some((t) => t.toLowerCase().includes(query));
      const matchStall = item.stallName.toLowerCase().includes(query);
      if (!matchName && !matchDesc && !matchTag && !matchStall) {
        return false;
      }
    }

    // Stall match
    if (stallId && stallId !== 'all') {
      if (item.stallId !== stallId) return false;
    }

    // Category match
    if (category && category !== 'all') {
      if (item.category !== category) return false;
    }

    // Dietary match
    if (dietary && dietary !== 'all') {
      if (dietary === 'veg' && item.dietary !== 'veg' && item.dietary !== 'vegan') return false;
      if (dietary === 'vegan' && item.dietary !== 'vegan') return false;
      if (dietary === 'non-veg' && item.dietary !== 'non-veg') return false;
    }

    // Express only (prep <= 4 mins)
    if (expressOnly && !item.isExpress) {
      return false;
    }

    return true;
  });
}
