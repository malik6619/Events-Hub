# EventHub - Database Setup Instructions

## ⚠️ IMPORTANT: Database Setup Required

Before you can create events, you **MUST** execute the SQL schema in your Supabase database.

## Step-by-Step Setup

### 1. Open Supabase SQL Editor

Click this link to open your Supabase SQL Editor:
👉 [Open Supabase SQL Editor](https://ftsywahqpuotyirjzjao.supabase.co/project/ftsywahqpuotyirjzjao/sql/new)

Or manually navigate to:
- Go to https://supabase.com
- Open your project: `ftsywahqpuotyirjzjao`
- Click on "SQL Editor" in the left sidebar
- Click "New Query"

### 2. Copy the SQL Schema

Open the file `supabase_schema.sql` in this project and copy ALL the contents.

### 3. Execute the Schema

1. Paste the SQL code into the SQL Editor
2. Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
3. Wait for the execution to complete (should take a few seconds)
4. You should see a success message

### 4. Verify Tables Created

After running the schema, verify the tables were created:

1. Click on "Table Editor" in the left sidebar
2. You should see these tables:
   - `app_92ee3_events`
   - `app_92ee3_tickets`
   - `app_92ee3_promo_codes`
   - `app_92ee3_orders`
   - `app_92ee3_order_items`
   - `app_92ee3_attendees`
   - `app_92ee3_products`

### 5. Test Event Creation

1. Go back to your EventHub application
2. Sign in or create an account
3. Try creating a new event
4. It should work now! 🎉

## Common Issues

### "relation does not exist" Error
**Solution:** You haven't executed the SQL schema yet. Follow steps 1-3 above.

### "permission denied" or "policy" Error
**Solution:** The Row Level Security policies might not be set up correctly. Re-run the entire SQL schema.

### "Failed to create event" Error
**Solution:** 
1. Check browser console (F12) for detailed error messages
2. Verify you're logged in
3. Ensure the SQL schema was executed successfully
4. Check that all tables exist in Supabase Table Editor

## What the Schema Creates

The SQL schema creates:

✅ **7 Database Tables** - For events, tickets, orders, attendees, etc.
✅ **Indexes** - For fast queries
✅ **Row Level Security (RLS)** - For data protection
✅ **RLS Policies** - So users can only access their own data

## Need Help?

If you're still experiencing issues:

1. Check the browser console (F12 → Console tab) for error messages
2. Verify your Supabase project is active
3. Ensure you're using the correct Supabase URL and API key
4. Try refreshing the page after executing the schema

## Quick Test Query

To verify the tables exist, run this in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'app_92ee3_%';
```

You should see 7 tables listed.