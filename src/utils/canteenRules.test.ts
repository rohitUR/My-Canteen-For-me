import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  validatePromoCode,
  calculateEstimatedWaitTime,
  generateTokenNumber,
  getRushLevelForHour,
  filterMenuItems,
} from './canteenRules';
import { CartItem, MenuItem } from '../types/canteen';

const sampleItem: MenuItem = {
  id: 'item-1',
  stallId: 'stall-a',
  stallName: 'Campus Wok',
  counterNumber: 1,
  counterCode: 'A',
  name: 'Schezwan Fried Rice',
  description: 'Spicy wok tossed rice with fresh scallions',
  price: 6.5,
  category: 'lunch',
  dietary: 'veg',
  isExpress: false,
  prepTimeMinutes: 7,
  calories: 450,
  rating: 4.8,
  reviewsCount: 140,
  imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600',
  isAvailable: true,
  tags: ['rice', 'spicy', 'wok'],
};

const expressItem: MenuItem = {
  id: 'item-2',
  stallId: 'stall-d',
  stallName: 'Brews & Bakery',
  counterNumber: 4,
  counterCode: 'D',
  name: 'Vanilla Cold Brew',
  description: 'Slow steeped iced brew with vanilla bean syrup',
  price: 3.5,
  category: 'beverages',
  dietary: 'vegan',
  isExpress: true,
  prepTimeMinutes: 2,
  calories: 120,
  rating: 4.9,
  reviewsCount: 220,
  imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600',
  isAvailable: true,
  tags: ['coffee', 'cold', 'iced'],
};

test('calculateCartTotals calculates subtotal, tax and total correctly', () => {
  const cart: CartItem[] = [
    {
      cartItemId: 'c1',
      menuItem: sampleItem,
      quantity: 2,
      selectedCustomizations: {},
      customizationsExtraPrice: 0,
      itemTotalPrice: 13.0,
    },
    {
      cartItemId: 'c2',
      menuItem: expressItem,
      quantity: 1,
      selectedCustomizations: {},
      customizationsExtraPrice: 0,
      itemTotalPrice: 3.5,
    },
  ];

  const result = calculateCartTotals(cart);
  assert.equal(result.subtotal, 16.5);
  // Tax is 5% of 16.50 = 0.825 -> rounded to 0.83
  assert.equal(result.tax, 0.83);
  assert.equal(result.total, 17.33);
  assert.equal(result.discount, 0);
});

test('calculateCartTotals applies STUDENT10 discount (10%)', () => {
  const cart: CartItem[] = [
    {
      cartItemId: 'c1',
      menuItem: sampleItem,
      quantity: 2,
      selectedCustomizations: {},
      customizationsExtraPrice: 0,
      itemTotalPrice: 20.0,
    },
  ];

  const result = calculateCartTotals(cart, 'STUDENT10');
  assert.equal(result.subtotal, 20.0);
  assert.equal(result.discount, 2.0);
  // Subtotal after discount = 18.0. Tax = 18 * 0.05 = 0.90
  assert.equal(result.tax, 0.9);
  assert.equal(result.total, 18.9);
});

test('validatePromoCode handles invalid codes and min spends', () => {
  assert.equal(validatePromoCode('INVALID_CODE', 25).valid, false);
  assert.equal(validatePromoCode('EXAMBOOST', 8).valid, false); // needs $10 min
  assert.equal(validatePromoCode('EXAMBOOST', 12).valid, true);
  assert.equal(validatePromoCode('EXAMBOOST', 12).discountAmount, 3.0);
});

test('generateTokenNumber formats prefix and number', () => {
  assert.equal(generateTokenNumber('A', 1), 'A-101');
  assert.equal(generateTokenNumber('b', 42), 'B-142');
});

test('getRushLevelForHour identifies peak hours', () => {
  assert.equal(getRushLevelForHour(12).level, 'super_peak');
  assert.equal(getRushLevelForHour(13).level, 'super_peak');
  assert.equal(getRushLevelForHour(10).level, 'high');
  assert.equal(getRushLevelForHour(16).level, 'high');
  assert.equal(getRushLevelForHour(15).level, 'moderate');
  assert.equal(getRushLevelForHour(8).level, 'low');
});

test('calculateEstimatedWaitTime prioritizes scheduled slots', () => {
  const cart: CartItem[] = [
    {
      cartItemId: 'c1',
      menuItem: sampleItem,
      quantity: 1,
      selectedCustomizations: {},
      customizationsExtraPrice: 0,
      itemTotalPrice: 6.5,
    },
  ];

  const immediateWait = calculateEstimatedWaitTime(cart, 5, 12, false);
  const scheduledWait = calculateEstimatedWaitTime(cart, 5, 12, true);

  assert.ok(immediateWait > 5, 'Immediate wait should account for rush and queue');
  assert.equal(scheduledWait, 3, 'Scheduled slot wait should bypass normal queue');
});

test('filterMenuItems filters by dietary and express flags', () => {
  const items = [sampleItem, expressItem];
  
  // Filter express only
  const expressOnly = filterMenuItems(items, '', 'all', 'all', 'all', true);
  assert.equal(expressOnly.length, 1);
  assert.equal(expressOnly[0].id, 'item-2');

  // Filter vegan only
  const veganOnly = filterMenuItems(items, '', 'all', 'all', 'vegan', false);
  assert.equal(veganOnly.length, 1);
  assert.equal(veganOnly[0].id, 'item-2');

  // Filter search query
  const searchResults = filterMenuItems(items, 'rice', 'all', 'all', 'all', false);
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, 'item-1');
});
