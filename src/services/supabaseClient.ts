import { createClient } from '@supabase/supabase-js';
import { Order, OrderStatus } from '../types/canteen';

export const SUPABASE_PROJECT_ID = 'hpggiyhuahyhsuveclud';
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_e2ix5m6qsb_IEVSo1pvxtw_sqwtDfut';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseSyncState {
  isConnected: boolean;
  isTableReady: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
}

/**
 * Inserts or updates an order in the Supabase 'orders' table.
 */
export async function saveOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      id: order.id,
      token_number: order.tokenNumber,
      student_id: order.studentId,
      student_name: order.studentName,
      student_roll: order.studentRoll,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      promo_code_applied: order.promoCodeApplied || null,
      tax: order.tax,
      total_amount: order.totalAmount,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      order_type: order.orderType,
      scheduled_slot_time: order.scheduledSlotTime || null,
      status: order.status,
      counter_number: order.counterNumber,
      counter_code: order.counterCode,
      stall_name: order.stallName,
      created_at: new Date().toISOString(),
      estimated_pickup_time: order.estimatedPickupTime,
      pickup_code: order.pickupCode,
      raw_data: order,
    };

    const { error } = await supabase
      .from('orders')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync] Note saving order:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync] Network / execution error:', err?.message || err);
    return { success: false, error: err?.message || 'Failed to save order to Supabase' };
  }
}

/**
 * Updates an order's status in Supabase
 */
export async function updateOrderStatusInSupabase(
  orderId: string, 
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.warn('[Supabase Sync] Could not update status in DB:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Fetches recent orders from Supabase
 */
export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.warn('[Supabase] Orders table query notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map database rows to Order domain model
    return data.map((row: any): Order => {
      if (row.raw_data && typeof row.raw_data === 'object' && row.raw_data.items) {
        return {
          ...row.raw_data,
          status: row.status || row.raw_data.status,
        };
      }

      return {
        id: row.id,
        tokenNumber: row.token_number || row.id,
        studentId: row.student_id || 'std-1',
        studentName: row.student_name || 'Student',
        studentRoll: row.student_roll || '',
        items: Array.isArray(row.items) ? row.items : [],
        subtotal: Number(row.subtotal) || 0,
        discount: Number(row.discount) || 0,
        promoCodeApplied: row.promo_code_applied || undefined,
        tax: Number(row.tax) || 0,
        totalAmount: Number(row.total_amount) || 0,
        paymentMethod: row.payment_method || 'wallet',
        paymentStatus: row.payment_status || 'paid',
        orderType: row.order_type || 'immediate',
        scheduledSlotTime: row.scheduled_slot_time || undefined,
        status: row.status || 'placed',
        counterNumber: row.counter_number || 1,
        counterCode: row.counter_code || 'A',
        stallName: row.stall_name || 'Campus Canteen',
        createdAt: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
        estimatedPickupTime: row.estimated_pickup_time || '~5 mins',
        pickupCode: row.pickup_code || `PICKUP-${row.id}`,
      };
    });
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching orders:', err);
    return null;
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Run this in your Supabase SQL Editor (Project: hpggiyhuahyhsuveclud):

create table if not exists public.orders (
  id text primary key,
  token_number text not null,
  student_id text,
  student_name text,
  student_roll text,
  items jsonb default '[]'::jsonb,
  subtotal numeric default 0,
  discount numeric default 0,
  promo_code_applied text,
  tax numeric default 0,
  total_amount numeric default 0,
  payment_method text default 'wallet',
  payment_status text default 'paid',
  order_type text default 'immediate',
  scheduled_slot_time text,
  status text default 'placed',
  counter_number integer default 1,
  counter_code text default 'A',
  stall_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  estimated_pickup_time text,
  pickup_code text,
  raw_data jsonb
);

-- Enable Row Level Security and allow read/write for your app
alter table public.orders enable row level security;

create policy "Allow public read orders" 
  on public.orders for select 
  using (true);

create policy "Allow public insert orders" 
  on public.orders for insert 
  with check (true);

create policy "Allow public update orders" 
  on public.orders for update 
  using (true);
`;
