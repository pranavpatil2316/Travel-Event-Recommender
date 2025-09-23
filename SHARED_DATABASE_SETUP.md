# Shared Database Setup for Travel Event Recommender

This guide will help you set up a shared database so that reviews and ratings are visible to all users visiting your Netlify site.

## Prerequisites

- A Netlify account
- A Supabase account (free tier available)

## Step 1: Set up Supabase Database

1. **Create a Supabase account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Set up the database schema**
   - In your Supabase dashboard, go to the SQL Editor
   - Copy and paste the contents of `supabase-setup.sql` into the editor
   - Run the SQL script to create tables and sample data

3. **Get your Supabase credentials**
   - Go to Settings > API in your Supabase dashboard
   - Copy your Project URL and anon/public key
   - You'll need these for the Netlify environment variables

## Step 2: Configure Netlify Environment Variables

1. **In your Netlify dashboard**
   - Go to your site settings
   - Navigate to Environment variables
   - Add the following variables:

   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Example values:**
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 3: Deploy to Netlify

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add shared database support"
   git push origin main
   ```

2. **Deploy on Netlify**
   - Connect your GitHub repository to Netlify
   - Netlify will automatically detect the `netlify/functions` folder
   - The site will deploy with the new functions

## Step 4: Test the Setup

1. **Visit your deployed site**
2. **Search for events** (e.g., Paris, France)
3. **Add a review** to any event
4. **Open the site in a different browser/incognito mode**
5. **Verify that your review is visible** to other users

## How It Works

### Before (IndexedDB - Local Only)
- Reviews stored in user's browser
- Only visible to that user
- Data lost if browser data is cleared
- No personalized recommendations

### After (Shared Database + Recommendation Engine - Global)
- Reviews stored in Supabase database
- Visible to all users
- Data persists across sessions and devices
- Real-time updates for all users
- **Personalized recommendations based on user preferences**
- **Collaborative filtering - users with similar tastes get similar recommendations**
- **Content-based filtering - events matched to user interests**
- **Learning system - recommendations improve as users rate events**

## File Structure

```
your-project/
├── netlify/
│   └── functions/
│       ├── get-reviews.js                    # Get reviews for an event
│       ├── submit-review.js                  # Submit new review/rating
│       ├── get-events.js                     # Get events with stats
│       ├── add-event.js                      # Add new event
│       ├── get-user-ratings.js               # Get user's rating history
│       ├── get-all-users.js                  # Get all users for collaborative filtering
│       ├── get-event-by-id.js                # Get specific event details
│       ├── save-user-preferences.js          # Save user preferences
│       └── get-user-recommendation-history.js # Get user's recommendation history
├── shared-database.js                        # API client for shared database
├── recommendation-engine.js                  # Advanced recommendation system
├── supabase-setup.sql                        # Database schema and sample data
└── package.json                              # Dependencies for Netlify functions
```

## API Endpoints

Your site now has these API endpoints:

- `/.netlify/functions/get-events` - Get events with ratings
- `/.netlify/functions/get-reviews?eventId=X` - Get reviews for event
- `/.netlify/functions/submit-review` - Submit new review
- `/.netlify/functions/add-event` - Add new event
- `/.netlify/functions/get-user-ratings?userId=X` - Get user's rating history
- `/.netlify/functions/get-all-users` - Get all users for collaborative filtering
- `/.netlify/functions/get-event-by-id?eventId=X` - Get specific event details
- `/.netlify/functions/save-user-preferences` - Save user preferences
- `/.netlify/functions/get-user-recommendation-history?userId=X` - Get user's recommendation history

## Troubleshooting

### Common Issues

1. **"Failed to fetch reviews" error**
   - Check that SUPABASE_URL and SUPABASE_ANON_KEY are set correctly
   - Verify the Supabase project is active

2. **Reviews not showing up**
   - Check browser console for errors
   - Verify the database tables were created correctly
   - Check Supabase logs for any errors

3. **Functions not working**
   - Ensure `package.json` includes `@supabase/supabase-js` dependency
   - Check Netlify function logs in the dashboard

### Testing Locally

You can test the functions locally using Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

This will start a local development server with the functions available.

## Cost Considerations

- **Supabase Free Tier**: 500MB database, 2GB bandwidth, 50MB file storage
- **Netlify Free Tier**: 100GB bandwidth, 300 build minutes
- For most small to medium sites, the free tiers should be sufficient

## Security Notes

- The current setup uses Row Level Security (RLS) policies
- All data is publicly readable (appropriate for reviews)
- Consider adding rate limiting for production use
- The anon key is safe to use in client-side code

## Next Steps

Once this is working, you could enhance it with:

- User authentication (Supabase Auth)
- Rate limiting to prevent spam
- Moderation features
- Real-time updates using Supabase subscriptions
- Analytics and reporting

