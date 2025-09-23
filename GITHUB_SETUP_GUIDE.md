# GitHub Setup Guide - Step by Step

## 🚀 **Complete GitHub Setup Process**

### **Step 1: Create GitHub Repository**
1. **Go to GitHub.com**
   - Sign in to your account
   - Click the "+" icon in top right
   - Select "New repository"

2. **Repository Settings**
   - **Repository name:** `travel-event-recommender`
   - **Description:** `Travel and Event Recommender with AI-powered recommendations`
   - **Visibility:** Public (or Private if you prefer)
   - **DO NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

### **Step 2: Initialize Git in Your Project**
1. **Open Command Prompt/Terminal**
   - Navigate to your project folder
   - Run: `cd "C:\Users\Pranav Patil\Downloads\travel-event-recommender-website"`

2. **Initialize Git Repository**
   ```bash
   git init
   ```

3. **Add All Files**
   ```bash
   git add .
   ```

4. **Create First Commit**
   ```bash
   git commit -m "Initial commit: Travel Event Recommender with AI recommendations"
   ```

### **Step 3: Connect to GitHub**
1. **Add Remote Origin**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/travel-event-recommender.git
   ```
   (Replace YOUR_USERNAME with your actual GitHub username)

2. **Set Main Branch**
   ```bash
   git branch -M main
   ```

3. **Push to GitHub**
   ```bash
   git push -u origin main
   ```

### **Step 4: Verify Upload**
1. **Check GitHub Repository**
   - Go to your repository on GitHub
   - Verify all files are uploaded
   - Check that the folder structure is correct

## 📁 **Files That Will Be Uploaded**

### **Main Application Files:**
- `index.html` - Main application page
- `script.js` - Main JavaScript logic
- `shared-database.js` - Database client
- `recommendation-engine.js` - AI recommendation system
- `sample_events.json` - Sample event data
- `sample_reviews.js` - Sample reviews
- `package.json` - Dependencies

### **Netlify Functions:**
- `netlify/functions/` - All serverless functions
  - `get-events.js`
  - `get-reviews.js`
  - `submit-review.js`
  - `add-event.js`
  - `get-user-ratings.js`
  - `get-all-users.js`
  - `get-event-by-id.js`
  - `save-user-preferences.js`
  - `get-user-recommendation-history.js`
  - `get-user-data.js`
  - `save-user-data.js`
  - `update-user-preferences.js`

### **Database & Setup:**
- `supabase-setup.sql` - Database schema
- `SHARED_DATABASE_SETUP.md` - Database setup guide
- `NETLIFY_DEPLOYMENT_CHECKLIST.md` - Deployment guide

### **Testing & Demo Files:**
- `test-recommendations.html` - Local testing
- `user-identification-demo.html` - User ID demo
- `user-identification-options.md` - User ID options

### **Documentation:**
- `README.md` - Project documentation
- `DEPLOYMENT.md` - Deployment instructions
- `GITHUB_SETUP_GUIDE.md` - This guide

## 🔧 **Troubleshooting**

### **If Git is not installed:**
1. Download Git from [git-scm.com](https://git-scm.com/)
2. Install with default settings
3. Restart command prompt
4. Try the commands again

### **If you get authentication errors:**
1. **Use Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with repo permissions
   - Use token as password when prompted

2. **Or use GitHub CLI:**
   ```bash
   gh auth login
   ```

### **If files are too large:**
- GitHub has a 100MB file limit
- If you have large files, add them to `.gitignore`
- Most of your files should be under the limit

### **If you get "repository already exists" error:**
- Check if you already have a repository with this name
- Either delete the existing one or use a different name

## ✅ **Success Checklist**

- [ ] GitHub repository created
- [ ] Git initialized in project folder
- [ ] All files added to git
- [ ] First commit created
- [ ] Remote origin added
- [ ] Files pushed to GitHub
- [ ] Repository verified on GitHub

## 🎯 **Next Steps After GitHub Upload**

1. **Connect to Netlify:**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Connect to your GitHub repository
   - Deploy

2. **Set up Supabase:**
   - Create Supabase account
   - Run the SQL setup file
   - Add environment variables to Netlify

3. **Test Deployment:**
   - Visit your deployed site
   - Test the recommendation system
   - Rate some events to see it learn

## 💡 **Pro Tips**

1. **Use meaningful commit messages**
2. **Keep your repository organized**
3. **Add a good README.md**
4. **Use branches for different features**
5. **Regular commits for better version control**
