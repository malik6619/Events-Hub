# EventHub - Event Management and Ticketing Platform

## Overview

EventHub is a comprehensive, self-hosted event management and ticketing platform built with React, TypeScript, Shadcn-UI, and Supabase. It provides all the features needed to create, manage, and sell tickets for events.

## Features

### Core Features
- **Event Management**: Create, edit, publish, and archive events
- **Flexible Ticketing**: Support for Free, Paid, Donation, and Tiered tickets
- **Attendee Management**: Track registrations, manage attendee information
- **QR Code Check-in**: Fast check-in system with QR codes
- **Real-time Analytics**: Dashboard with sales metrics and revenue tracking
- **Promo Codes**: Create discount codes with usage limits
- **Product Sales**: Sell merchandise and add-ons alongside tickets

### Technical Features
- **Authentication**: Secure user authentication via Supabase Auth
- **Database**: PostgreSQL database with Row Level Security (RLS)
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Built with Shadcn-UI components and Tailwind CSS

## Prerequisites

Before deploying, ensure you have:
1. A Supabase account (https://supabase.com)
2. Node.js 18+ and pnpm installed
3. Git for version control

## Setup Instructions

### Step 1: Supabase Configuration

1. **Create a Supabase Project**
   - Go to https://supabase.com and create a new project
   - Note your project URL and anon key

2. **Execute Database Schema**
   - In your Supabase dashboard, go to SQL Editor
   - Copy the contents of `supabase_schema.sql`
   - Execute the SQL to create all tables, indexes, and RLS policies

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Development

Run the development server:

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`

### Step 4: Build for Production

```bash
pnpm run build
```

The production build will be in the `dist/` directory.

### Step 5: Deploy

You can deploy to any static hosting service:

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod --dir=dist
```

**Other platforms:**
- Upload the `dist/` folder to your hosting provider
- Configure environment variables in your hosting dashboard

## Database Schema

The platform uses the following tables:

- **app_92ee3_events**: Event information
- **app_92ee3_tickets**: Ticket types and pricing
- **app_92ee3_promo_codes**: Promotional discount codes
- **app_92ee3_orders**: Customer orders
- **app_92ee3_order_items**: Individual items in orders
- **app_92ee3_attendees**: Attendee information with QR codes
- **app_92ee3_products**: Merchandise and add-on products

All tables have Row Level Security (RLS) enabled for data protection.

## User Guide

### For Event Organizers

1. **Create an Account**
   - Sign up with email and password
   - Verify your email (if required)

2. **Create Your First Event**
   - Click "Create Event" from the dashboard
   - Fill in event details (title, description, dates, location)
   - Add an event image URL
   - Publish when ready

3. **Configure Tickets**
   - Go to event details → "Manage Tickets"
   - Add ticket types (Free, Paid, Donation, Tiered)
   - Set pricing and capacity limits
   - Add descriptions

4. **Share Event**
   - Copy the checkout URL: `/checkout/{eventId}`
   - Share with potential attendees

5. **Check-in Attendees**
   - Use the check-in interface: `/check-in/{eventId}`
   - Scan QR codes or enter ticket IDs manually
   - Track check-in status in real-time

6. **Monitor Analytics**
   - View dashboard for overview
   - Check event-specific analytics
   - Export attendee lists

### For Attendees

1. **Browse Events**
   - Visit the event checkout page
   - View event details and available tickets

2. **Purchase Tickets**
   - Select ticket quantities
   - Enter customer information
   - Complete order (payment integration ready for Stripe)

3. **Receive Confirmation**
   - QR codes generated automatically
   - Email confirmation (requires email service setup)

## Customization

### Branding
- Update colors in `tailwind.config.ts`
- Replace logo in `src/pages/Index.tsx` and `src/pages/Login.tsx`
- Modify `index.html` for meta tags and title

### Features
- Add payment processing by integrating Stripe
- Enable email notifications with Resend or SMTP
- Add custom fields to attendee registration

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **RLS Policies**: All tables have Row Level Security enabled
3. **Authentication**: Uses Supabase Auth with secure token management
4. **HTTPS**: Always use HTTPS in production

## Troubleshooting

### Common Issues

**Build Errors:**
- Run `pnpm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)

**Database Connection:**
- Verify Supabase credentials in `.env`
- Ensure SQL schema has been executed
- Check RLS policies are enabled

**Authentication Issues:**
- Confirm email verification settings in Supabase
- Check auth redirect URLs in Supabase dashboard

## Support

For issues or questions:
- Check the Supabase documentation: https://supabase.com/docs
- Review the Shadcn-UI docs: https://ui.shadcn.com
- Contact: iqbalmqamar10@gmail.com

## Contributing

This project was created by Qamar Iqbal as part of the Hi.Events deployment initiative.

## License

This project is open-source and available for self-hosting.

## Acknowledgments

- Built with React, TypeScript, and Vite
- UI components from Shadcn-UI
- Backend powered by Supabase
- Inspired by Hi.Events open-source platform

---

**Created by:** Qamar Iqbal  
**Email:** iqbalmqamar10@gmail.com  
**Contact:** 03175813210 (Optional)