# Netlify Deployment - Step by Step Guide

## 🚀 **Complete Netlify Deployment Process**

### **Step 1: Create Netlify Account & Connect GitHub**

1. **Go to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Click "Sign up" (or "Log in" if you have an account)
   - Choose "Sign up with GitHub" (recommended)

2. **Authorize Netlify**
   - Click "Authorize Netlify" when prompted
   - This allows Netlify to access your GitHub repositories

### **Step 2: Deploy from GitHub Repository**

1. **Start New Site**
   - In Netlify dashboard, click "New site from Git"
   - Click "GitHub" as your Git provider

2. **Select Repository**
   - Find and click on `Travel-Event-Recommender`
   - Click "Deploy site"

3. **Deploy Settings**
   - **Branch to deploy:** `master` (should be selected by default)
   - **Build command:** Leave empty (static site)
   - **Publish directory:** Leave empty (root directory)
   - Click "Deploy site"

### **Step 3: Wait for Deployment**

1. **Deployment Process**
   - Netlify will show deployment progress
   - This usually takes 1-2 minutes
   - You'll see a green "Published" status when complete

2. **Get Your Site URL**
   - Netlify will assign a random URL like `amazing-name-123456.netlify.app`
   - You can change this later in site settings

### **Step 4: Set Up Supabase Database**

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - **Name:** `travel-event-recommender`
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
   - Click "Create new project"

3. **Wait for Setup**
   - Supabase will take 1-2 minutes to set up your database
   - You'll see a "Ready" status when complete

### **Step 5: Set Up Database Schema**

1. **Open SQL Editor**
   - In Supabase dashboard, click "SQL Editor" in left sidebar
   - Click "New query"

2. **Run Database Setup**
   - Copy the entire content from your `supabase-setup.sql` file
   - Paste it into the SQL editor
   - Click "Run" to execute

3. **Verify Tables Created**
   - Go to "Table Editor" in left sidebar
   - You should see these tables:
     - `events`
     - `ratings`
     - `reviews`
     - `users`
     - `user_preferences`

### **Step 6: Get Supabase Credentials**

1. **Go to Settings**
   - In Supabase dashboard, click "Settings" (gear icon)
   - Click "API" in the left sidebar

2. **Copy Credentials**
   - **Project URL:** Copy the "Project URL" (looks like `https://xyz.supabase.co`)
   - **Anon Key:** Copy the "anon public" key (starts with `eyJ...`)

### **Step 7: Add Environment Variables to Netlify**

1. **Go to Site Settings**
   - In Netlify dashboard, click on your site name
   - Click "Site settings" in the top navigation

2. **Environment Variables**
   - Click "Environment variables" in the left sidebar
   - Click "Add variable"

3. **Add Supabase Variables**
   - **Key:** `SUPABASE_URL`
   - **Value:** Your Supabase Project URL (from Step 6)
   - Click "Save"

   - **Key:** `SUPABASE_ANON_KEY`
   - **Value:** Your Supabase Anon Key (from Step 6)
   - Click "Save"

### **Step 8: Redeploy Site**

1. **Trigger Redeploy**
   - Go to "Deploys" tab in Netlify
   - Click "Trigger deploy" → "Deploy site"
   - This applies the new environment variables

2. **Wait for Deployment**
   - Monitor the deployment progress
   - Should complete in 1-2 minutes

### **Step 9: Test Your Deployment**

1. **Visit Your Site**
   - Click on your site URL in Netlify dashboard
   - Test the basic functionality

2. **Test Recommendations**
   - Select a country and city
   - Click "Get Personalized Recommendations"
   - Verify events are displayed

3. **Test Rating System**
   - Rate an event
   - Check if the rating is saved
   - Verify the recommendation system learns

### **Step 10: Custom Domain (Optional)**

1. **Add Custom Domain**
   - Go to "Domain settings" in Netlify
   - Click "Add custom domain"
   - Enter your domain name
   - Follow DNS setup instructions

## 🔧 **Environment Variables Location**

### **In Netlify Dashboard:**
1. **Navigate to:** Your Site → Site settings → Environment variables
2. **Path:** `https://app.netlify.com/sites/YOUR_SITE_NAME/settings/deploys#environment-variables`

### **Required Environment Variables:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚨 **Troubleshooting**

### **If Deployment Fails:**
1. **Check Build Logs**
   - Go to "Deploys" tab
   - Click on failed deployment
   - Check error messages

2. **Common Issues:**
   - **Missing environment variables:** Add SUPABASE_URL and SUPABASE_ANON_KEY
   - **Build command error:** Leave build command empty for static sites
   - **Publish directory error:** Leave publish directory empty

### **If Database Connection Fails:**
1. **Verify Environment Variables**
   - Check they're correctly set in Netlify
   - Ensure no extra spaces or quotes

2. **Check Supabase Settings**
   - Verify project is active
   - Check if RLS (Row Level Security) is enabled

### **If Recommendations Don't Work:**
1. **Check Browser Console**
   - Open browser developer tools
   - Look for JavaScript errors
   - Check network requests

2. **Verify Database Tables**
   - Go to Supabase Table Editor
   - Ensure all tables exist
   - Check if sample data is present

## ✅ **Success Checklist**

- [ ] Netlify account created and connected to GitHub
- [ ] Site deployed from GitHub repository
- [ ] Supabase account created and project set up
- [ ] Database schema created (tables exist)
- [ ] Environment variables added to Netlify
- [ ] Site redeployed with new variables
- [ ] Basic functionality tested
- [ ] Recommendation system tested
- [ ] Rating system tested

## 🎯 **Your Live Site**

Once deployed, your site will be available at:
- **Netlify URL:** `https://your-site-name.netlify.app`
- **Custom Domain:** `https://yourdomain.com` (if configured)

## 💡 **Pro Tips**

1. **Keep Supabase credentials secure**
2. **Test thoroughly before going live**
3. **Monitor your Supabase usage**
4. **Set up automatic deployments from GitHub**
5. **Use Netlify's preview deployments for testing**

## 📞 **Need Help?**

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Netlify and Supabase documentation
3. Check browser console for errors
4. Verify all environment variables are set correctly
