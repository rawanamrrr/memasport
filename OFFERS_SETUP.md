# Offers Banner Setup Guide

## What Was Done

I've successfully integrated the offers banner into your website. Here's what was implemented:

### 1. **Layout Integration** ✅
- Added `OffersBanner` component to `app/layout.tsx`
- The banner now appears at the top of all pages

### 2. **API Endpoint** ✅
- The `/api/offers` endpoint already exists at `app/api/offers/route.ts`
- Supports GET, POST, PUT, and DELETE operations
- Includes admin authentication for creating/updating offers

### 3. **Database Setup** ✅
- Created setup script at `scripts/setup-offers-table.ts`
- Added npm script to run the setup

## How to Complete the Setup

### Step 1: Ensure Database is Running
Make sure your PostgreSQL database is running and the `DATABASE_URL` is set in your `.env` file.

### Step 2: Run the Setup Script
Run this command to create the offers table and add a sample offer:

```bash
npm run setup-offers
```

This will:
- Create the `offers` table if it doesn't exist
- Create necessary indexes for performance
- Add a sample "Welcome Offer - 20% OFF" if no offers exist

### Step 3: Start Your Development Server
```bash
npm run dev
```

Visit your website and you should see the offer banner at the top!

## How to Manage Offers

### View All Offers
The banner automatically fetches and displays active offers from the database.

### Create a New Offer
You can create offers through your admin panel or directly via the API:

**POST** `/api/offers`

Headers:
```json
{
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

Body:
```json
{
  "title": "Summer Sale - 30% OFF",
  "description": "Get 30% off all summer items! Limited time only.",
  "discountCode": "SUMMER30",
  "isActive": true,
  "priority": 5
}
```

### Update an Offer
**PUT** `/api/offers`

Body:
```json
{
  "id": "offer-uuid",
  "title": "Updated Title",
  "description": "Updated description",
  "discountCode": "NEWCODE",
  "isActive": true,
  "priority": 10
}
```

### Delete an Offer
**DELETE** `/api/offers?id=offer-uuid`

## Banner Features

The `OffersBanner` component includes:
- ✨ Animated entrance and transitions
- 🔄 Auto-rotation between multiple offers (every 6 seconds)
- 📋 Copy discount code functionality
- ❌ Dismissible (saves preference to localStorage)
- 🎨 Beautiful gradient design with hover effects
- 📱 Fully responsive
- ⏸️ Pauses rotation on hover
- 🔄 Auto-refreshes offers every 5 minutes

## Troubleshooting

### Banner Not Showing?
1. Check if there are active offers in the database
2. Open browser console and look for any errors
3. Verify the `/api/offers` endpoint returns data
4. Check if the banner was previously dismissed (clear localStorage)

### Database Connection Issues?
1. Verify `DATABASE_URL` in your `.env` file
2. Ensure PostgreSQL is running
3. Check database credentials

### Offers Not Appearing?
1. Make sure `isActive` is set to `true` for your offers
2. Check the priority (higher priority shows first)
3. Verify the API endpoint is working: visit `http://localhost:3000/api/offers`

## Database Schema

```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  discount_code VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Next Steps

1. Run `npm run setup-offers` to initialize the database
2. Start your dev server with `npm run dev`
3. Create your own custom offers through the admin panel
4. Customize the banner styling in `components/offers-banner.tsx` if needed

Enjoy your new offers banner! 🎉
