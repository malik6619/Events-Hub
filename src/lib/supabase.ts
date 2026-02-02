import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';
};

export type Database = {
  app_92ee3_events: {
    id: string;
    organizer_id: string;
    title: string;
    description: string | null;
    location: string | null;
    start_date: string;
    end_date: string;
    image_url: string | null;
    status: 'draft' | 'published' | 'archived';
    settings: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };
  app_92ee3_tickets: {
    id: string;
    event_id: string;
    name: string;
    type: 'free' | 'paid' | 'donation' | 'tiered';
    price: number;
    quantity: number | null;
    sold: number;
    description: string | null;
    settings: Record<string, unknown>;
    created_at: string;
  };
  app_92ee3_promo_codes: {
    id: string;
    event_id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    usage_limit: number | null;
    used_count: number;
    valid_from: string | null;
    valid_until: string | null;
    created_at: string;
  };
  app_92ee3_orders: {
    id: string;
    event_id: string;
    user_id: string | null;
    order_number: string;
    total_amount: number;
    status: 'pending' | 'completed' | 'cancelled' | 'refunded';
    payment_intent_id: string | null;
    customer_email: string;
    customer_name: string;
    created_at: string;
  };
  app_92ee3_order_items: {
    id: string;
    order_id: string;
    ticket_id: string;
    quantity: number;
    price: number;
    created_at: string;
  };
  app_92ee3_attendees: {
    id: string;
    order_id: string;
    ticket_id: string;
    name: string;
    email: string;
    phone: string | null;
    qr_code: string;
    checked_in: boolean;
    checked_in_at: string | null;
    custom_fields: Record<string, unknown>;
    created_at: string;
  };
  app_92ee3_products: {
    id: string;
    event_id: string;
    name: string;
    description: string | null;
    price: number;
    inventory: number | null;
    sold: number;
    image_url: string | null;
    created_at: string;
  };
};