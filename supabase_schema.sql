BEGIN;

-- Create events table
CREATE TABLE IF NOT EXISTS app_92ee3_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS app_92ee3_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES app_92ee3_events ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('free', 'paid', 'donation', 'tiered')),
    price DECIMAL(10, 2) DEFAULT 0,
    quantity INTEGER,
    sold INTEGER DEFAULT 0,
    description TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS app_92ee3_promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES app_92ee3_events ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(event_id, code)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS app_92ee3_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES app_92ee3_events ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users,
    order_number TEXT UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
    payment_intent_id TEXT,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS app_92ee3_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES app_92ee3_orders ON DELETE CASCADE NOT NULL,
    ticket_id UUID REFERENCES app_92ee3_tickets ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create attendees table
CREATE TABLE IF NOT EXISTS app_92ee3_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES app_92ee3_orders ON DELETE CASCADE NOT NULL,
    ticket_id UUID REFERENCES app_92ee3_tickets ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    qr_code TEXT UNIQUE NOT NULL,
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS app_92ee3_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES app_92ee3_events ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    inventory INTEGER,
    sold INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS events_organizer_idx ON app_92ee3_events(organizer_id);
CREATE INDEX IF NOT EXISTS events_status_idx ON app_92ee3_events(status);
CREATE INDEX IF NOT EXISTS tickets_event_idx ON app_92ee3_tickets(event_id);
CREATE INDEX IF NOT EXISTS orders_event_idx ON app_92ee3_orders(event_id);
CREATE INDEX IF NOT EXISTS orders_user_idx ON app_92ee3_orders(user_id);
CREATE INDEX IF NOT EXISTS attendees_order_idx ON app_92ee3_attendees(order_id);
CREATE INDEX IF NOT EXISTS attendees_qr_idx ON app_92ee3_attendees(qr_code);

-- Setup Row Level Security
ALTER TABLE app_92ee3_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_92ee3_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_92ee3_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_92ee3_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_92ee3_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_92ee3_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_92ee3_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "allow_read_published_events" ON app_92ee3_events FOR SELECT USING (status = 'published' OR organizer_id = (SELECT auth.uid()));
CREATE POLICY "allow_insert_own_events" ON app_92ee3_events FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = organizer_id);
CREATE POLICY "allow_update_own_events" ON app_92ee3_events FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = organizer_id);
CREATE POLICY "allow_delete_own_events" ON app_92ee3_events FOR DELETE TO authenticated USING ((SELECT auth.uid()) = organizer_id);

-- RLS Policies for tickets
CREATE POLICY "allow_read_tickets" ON app_92ee3_tickets FOR SELECT USING (
    EXISTS (SELECT 1 FROM app_92ee3_events WHERE id = event_id AND (status = 'published' OR organizer_id = (SELECT auth.uid())))
);
CREATE POLICY "allow_manage_own_tickets" ON app_92ee3_tickets FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM app_92ee3_events WHERE id = event_id AND organizer_id = (SELECT auth.uid()))
);

-- RLS Policies for promo_codes
CREATE POLICY "allow_read_promo_codes" ON app_92ee3_promo_codes FOR SELECT USING (true);
CREATE POLICY "allow_manage_own_promo_codes" ON app_92ee3_promo_codes FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM app_92ee3_events WHERE id = event_id AND organizer_id = (SELECT auth.uid()))
);

-- RLS Policies for orders
CREATE POLICY "allow_read_own_orders" ON app_92ee3_orders FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR 
    EXISTS (SELECT 1 FROM app_92ee3_events WHERE id = event_id AND organizer_id = (SELECT auth.uid()))
);
CREATE POLICY "allow_insert_orders" ON app_92ee3_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_update_own_orders" ON app_92ee3_orders FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM app_92ee3_events WHERE id = event_id AND organizer_id = (SELECT auth.uid()))
);

-- RLS Policies for order_items
CREATE POLICY "allow_read_order_items" ON app_92ee3_order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM app_92ee3_orders WHERE id = order_id AND (
        user_id = (SELECT auth.uid()) OR 
        EXISTS (SELECT 1 FROM app_92ee3_events WHERE id = event_id AND organizer_id = (SELECT auth.uid()))
    ))
);
CREATE POLICY "allow_insert_order_items" ON app_92ee3_order_items FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for attendees
CREATE POLICY "allow_read_attendees" ON app_92ee3_attendees FOR SELECT USING (
    EXISTS (SELECT 1 FROM app_92ee3_orders o 
        JOIN app_92ee3_events e ON o.event_id = e.id 
        WHERE o.id = order_id AND (o.user_id = (SELECT auth.uid()) OR e.organizer_id = (SELECT auth.uid()))
    )
);
CREATE POLICY "allow_insert_attendees" ON app_92ee3_attendees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_update_attendees" ON app_92ee3_attendees FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM app_92ee3_orders o 
        JOIN app_92ee3_events e ON o.event_id = e.id 
        WHERE o.id = order_id AND e.organizer_id = (SELECT auth.uid())
    )
);

-- RLS Policies for products
CREATE POLICY "allow_read_products" ON app_92ee3_products FOR SELECT USING (
    EXISTS (SELECT 1 FROM app_92ee3_events WHERE id = event_id AND (status = 'published' OR organizer_id = (SELECT auth.uid())))
);
CREATE POLICY "allow_manage_own_products" ON app_92ee3_products FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM app_92ee3_events WHERE id = event_id AND organizer_id = (SELECT auth.uid()))
);

COMMIT;
