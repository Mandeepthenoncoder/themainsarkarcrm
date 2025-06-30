# 🚀 Sarkar Jewellers CRM - Deployment Guide

This guide will help you deploy your Sarkar Jewellers CRM to production using GitHub and Vercel.

## 📋 Pre-Deployment Checklist

### ✅ Files Already Hidden (via .gitignore):
- `.env.local` - Contains your Supabase credentials
- `bulk_create_all_users.sql` - Contains user passwords
- `setup_cloud_organization.sql` - Contains organization setup
- `setup_sarkar_jewellers.sql` - Contains showroom/staff data
- `node_modules/` - Dependencies
- `.next/` - Build files
- IDE and OS files

### 🔒 Important Security Notes:
1. **Never commit .env.local** - Contains your Supabase project URL and anon key
2. **SQL files are hidden** - They contain sensitive organization data
3. **Supabase database is separate** - Your data stays in Supabase cloud

## 🚀 Step 1: Push to GitHub

### Option A: Create New Repository
1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it: `sarkar-jewellers-crm` 
3. Make it **Private** for security
4. Don't initialize with README (you already have one)

### Option B: Use Existing Repository
If you already have a repository, note down the URL.

### Push Commands:
```bash
# Check current status
git status

# Add all files (sensitive files will be ignored)
git add .

# Commit your changes
git commit -m "Initial commit: Sarkar Jewellers CRM with purchase tracking"

# Add your GitHub repository (replace with your actual URL)
git remote add origin https://github.com/yourusername/sarkar-jewellers-crm.git

# Push to GitHub
git push -u origin main
```

## 🌐 Step 2: Deploy on Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import from GitHub - select your `sarkar-jewellers-crm` repository
4. Vercel will auto-detect it's a Next.js project

### Method 2: Vercel CLI
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new? [Create new]
# - Project name: sarkar-jewellers-crm
# - Directory: ./
# - Override settings? [No]
```

## ⚙️ Step 3: Configure Environment Variables on Vercel

**CRITICAL**: You must add your environment variables to Vercel:

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables (get values from your `.env.local` file):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### To get your values:
```bash
# View your current .env.local (DO NOT SHARE THESE VALUES)
type .env.local
```

## 🔧 Step 4: Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `crm.sarkarjewellers.com`)
3. Follow Vercel's DNS setup instructions

## 📊 Step 5: Verify Deployment

### Test These Features:
- [ ] Admin login: `divesh@sarkarjewellers.com` / `admin123`
- [ ] Manager login: `satellite.manager@sarkarjewellers.com` / `SatelliteManager123!`
- [ ] Sales login: `chiragbhai@sarkarjewellers.com` / `sales123`
- [ ] Customer creation with purchase amounts
- [ ] Dashboard metrics showing converted revenue
- [ ] All customer lists showing purchase amounts

### Check These URLs:
- `/admin/customers` - Should show purchase amounts
- `/manager/customers` - Should show purchase amounts  
- `/salesperson/customers` - Should show purchase amounts
- All dashboards should display converted revenue metrics

## 🚨 Important Production Notes

### Database:
- Your Supabase database remains the same
- All data (customers, sales, etc.) is preserved
- No database migration needed

### Security:
- All sensitive files are hidden via .gitignore
- Environment variables are secure in Vercel
- Supabase handles authentication and RLS

### Performance:
- Vercel provides global CDN
- Automatic SSL certificates
- Edge functions for optimal performance

## 🔄 Future Updates

To update your live app:
```bash
# Make changes to your code
git add .
git commit -m "Description of changes"
git push

# Vercel automatically redeploys on git push!
```

## 📞 Support

If you encounter issues:
1. Check Vercel function logs in dashboard
2. Verify environment variables are set correctly
3. Ensure Supabase project is accessible
4. Check that your domain DNS is configured properly

## 🎉 Success!

Once deployed, your Sarkar Jewellers CRM will be live and accessible to:
- **Admins**: Full system oversight with converted revenue tracking
- **Managers**: Team customer management with purchase visibility  
- **Salespeople**: Customer management and revenue conversion tracking

Your unified customer experience with purchase amount visibility is now live in production! 