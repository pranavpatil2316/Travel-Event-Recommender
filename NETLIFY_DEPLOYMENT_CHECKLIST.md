# Netlify Deployment Checklist

## 🚀 **Step-by-Step Deployment Guide**

### **Step 1: Prepare Your Files**
✅ **Files to upload to Netlify:**
- `index.html` (main page)
- `script.js` (main JavaScript)
- `shared-database.js` (database client)
- `recommendation-engine.js` (recommendation system)
- `sample_events.json` (sample data)
- `sample_reviews.js` (sample reviews)
- `package.json` (dependencies)
- `netlify/functions/` (all function files)
- `supabase-setup.sql` (database schema)

### **Step 2: Set Up Supabase Database**
1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free account
   - Create new project

2. **Run Database Setup**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste entire `supabase-setup.sql` file
   - Click "Run" to execute

3. **Get Database Credentials**
   - Go to Settings → API
   - Copy your Project URL and anon/public key

### **Step 3: Deploy to Netlify**
1. **Upload Files**
   - Go to your Netlify dashboard
   - Drag and drop all files to deploy
   - OR connect to GitHub repository

2. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add these variables:
     ```
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Deploy**
   - Netlify will automatically detect the functions
   - Wait for deployment to complete

### **Step 4: Test Your Deployment**
1. **Visit your site**
2. **Test the form** (select country, get recommendations)
3. **Rate some events** to test the recommendation system
4. **Check browser console** for any errors

## 🔧 **Required Setup**

### **Database Setup (Required)**
- ✅ Supabase account (free)
- ✅ Run `supabase-setup.sql` in SQL Editor
- ✅ Get Project URL and anon key
- ✅ Add environment variables to Netlify

### **Netlify Functions (Required)**
- ✅ All function files in `netlify/functions/` folder
- ✅ `package.json` with dependencies
- ✅ Environment variables set

### **Frontend Files (Required)**
- ✅ `index.html` (updated with recommendation engine)
- ✅ `script.js` (updated with recommendation system)
- ✅ `shared-database.js` (database client)
- ✅ `recommendation-engine.js` (recommendation system)
- ✅ `sample_events.json` (sample data)
- ✅ `sample_reviews.js` (sample reviews)

## 🚨 **Common Issues & Solutions**

### **"Failed to fetch" errors**
- Check environment variables are set correctly
- Verify Supabase project is active
- Check browser console for specific errors

### **Functions not working**
- Ensure `package.json` includes `@supabase/supabase-js`
- Check Netlify function logs in dashboard
- Verify all function files are uploaded

### **Database errors**
- Run the SQL setup file completely
- Check Supabase project is not paused
- Verify RLS policies are created

### **Recommendations not showing**
- Rate at least 3 events first
- Check browser console for errors
- Verify user preferences are being saved

## 📋 **Pre-Deployment Checklist**

- [ ] Supabase account created
- [ ] Database schema run (supabase-setup.sql)
- [ ] Environment variables ready
- [ ] All files prepared for upload
- [ ] package.json includes dependencies
- [ ] Functions folder uploaded
- [ ] Main files updated with recommendation system

## 🎯 **Post-Deployment Testing**

- [ ] Site loads without errors
- [ ] Form submission works
- [ ] Events display correctly
- [ ] Rating system works
- [ ] Recommendations appear after rating events
- [ ] No console errors
- [ ] Functions respond correctly

## 💡 **Pro Tips**

1. **Test locally first** using the test files
2. **Check Netlify function logs** if something breaks
3. **Use browser dev tools** to debug issues
4. **Start with sample data** before adding real events
5. **Monitor Supabase usage** to stay within free limits
