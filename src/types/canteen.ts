export type DietaryType = 'veg' | 'non-veg' | 'vegan';

export interface CustomizationOption {
  name: string;
  required?: boolean;
  choices: {
    name: string;
    price: number;
  }[];
}

export interface MenuItem {
  id: string;
  stallId: string;
  stallName: string;
  counterNumber: number;
  counterCode: string;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'desserts';
  dietary: DietaryType;
  isExpress: boolean; // Ready in <= 4 mins (great during peak rush)
  prepTimeMinutes: number;
  calories: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  isAvailable: boolean;
  stockLeft?: number;
  customizationOptions?: CustomizationOption[];
  tags: string[];
}

export interface CanteenStall {
  id: string;
  name: string;
  code: string; // e.g. "A", "B", "C"
  counterNumber: number;
  specialty: string;
  queueCount: number;
  avgWaitMins: number;
  rating: number;
  isOpen: boolean;
  colorScheme: string;
}

export interface CartCustomizationSelection {
  [optionName: string]: string; // optionName -> choiceName
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: CartCustomizationSelection;
  customizationsExtraPrice: number;
  itemTotalPrice: number; // (menuItem.price + extra) * quantity
  specialInstructions?: string;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'collected'
  | 'cancelled';

export interface Order {
  id: string;
  tokenNumber: string; // e.g., "A-104"
  studentId: string;
  studentName: string;
  studentRoll: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoCodeApplied?: string;
  tax: number;
  totalAmount: number;
  paymentMethod: 'wallet' | 'upi' | 'card' | 'cash';
  paymentStatus: 'paid' | 'pending';
  orderType: 'immediate' | 'scheduled_slot';
  scheduledSlotTime?: string;
  status: OrderStatus;
  counterNumber: number;
  counterCode: string;
  stallName: string;
  createdAt: string;
  estimatedPickupTime: string;
  pickupCode: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  email: string;
  phone: string;
  walletBalance: number;
  favoriteItemIds: string[];
}

export interface PeakHourSlot {
  hour24: number;
  timeLabel: string;
  periodName: string;
  avgWaitMins: number;
  occupancyPercent: number;
  rushLevel: 'low' | 'moderate' | 'high' | 'super_peak';
}

export interface ScheduledSlotOption {
  id: string;
  timeRange: string;
  periodName: string;
  isPeak: boolean;
  recommended: boolean;
  slotsRemaining: number;
}
