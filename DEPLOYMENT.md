# 🚀 Deployment Guide - Jewelry CRM

This guide covers deploying the Jewelry CRM to various platforms.

## 🎯 Pre-Deployment Checklist

Before deploying, ensure you have:
- ✅ Working local development environment
- ✅ Database migrations applied to production Supabase
- ✅ Admin user created in production database
- ✅ Environment variables ready
- ✅ Domain name (optional)

## ☁️ Vercel Deployment (Recommended)

Vercel is the recommended platform for Next.js applications.

### Step 1: Prepare Your Repository
```bash
# Ensure your code is committed and pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"New Project"**
3. Connect your GitHub account
4. Select your `crmzero` repository
5. Click **"Import"**

### Step 3: Configure Environment Variables
In the Vercel dashboard, add these environment variables:

**Required Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

**Optional Variables:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-app-password
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Test your application at the provided URL

### Step 5: Custom Domain (Optional)
1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` environment variable
4. Redeploy

## 🌊 Netlify Deployment

Alternative deployment platform.

### Step 1: Build Settings
```bash
# Build command
npm run build

# Publish directory
.next
```

### Step 2: Environment Variables
Add the same environment variables as Vercel in Netlify's dashboard.

### Step 3: Deploy
1. Connect your GitHub repository
2. Set build settings
3. Add environment variables
4. Deploy

## 🚂 Railway Deployment

Good for applications needing more backend resources.

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Deploy
```bash
railway login
railway init
railway add
railway deploy
```

### Step 3: Environment Variables
Add environment variables through Railway dashboard.

## 🐳 Docker Deployment

For containerized deployments.

### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Step 2: Build and Run
```bash
docker build -t jewelry-crm .
docker run -p 3000:3000 --env-file .env.local jewelry-crm
```

## 📊 Database Setup for Production

### Supabase Production Setup
1. **Create Production Project**:
   - Create a new Supabase project for production
   - Use a different project from development

2. **Apply Migrations**:
   ```bash
   # Link to production project
   npx supabase link --project-ref your-prod-project-ref
   
   # Push migrations
   npx supabase db push
   ```

3. **Create Admin User**:
   - Follow the same process as development
   - Create admin user via Supabase dashboard
   - Add profile record in database

4. **Configure RLS**:
   - Verify Row Level Security policies are active
   - Test permissions with different user roles

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files with real credentials
- Use platform-specific secret management
- Rotate API keys regularly

### Database Security
- Enable Row Level Security (RLS) ✅ Already implemented
- Use service role key only for admin operations
- Monitor database activity

### Application Security
- Enable HTTPS (automatic on Vercel)
- Set up proper CORS policies
- Implement rate limiting if needed

## 📈 Monitoring & Analytics

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to your layout:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Supabase Monitoring
- Monitor database performance in Supabase dashboard
- Set up alerts for database usage
- Review query performance

## 🚨 Troubleshooting

### Common Deployment Issues

**Build Failures**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Environment Variable Issues**
- Double-check all environment variables are set
- Ensure no trailing spaces in values
- Verify Supabase project URL and keys

**Database Connection Issues**
- Verify Supabase project is active
- Check if migrations are applied
- Test database connection from Supabase dashboard

**Authentication Issues**
- Verify auth redirects are configured correctly
- Check site URL in Supabase auth settings
- Ensure profile records exist for users

### Performance Optimization

**Next.js Optimizations**
- Use Next.js Image component for images
- Implement proper caching strategies
- Enable compression

**Database Optimizations**
- Add database indexes for frequently queried columns
- Monitor slow queries in Supabase
- Implement proper data pagination

## 📝 Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Login functionality works
- [ ] All user roles can access their dashboards
- [ ] Database operations work correctly
- [ ] Email notifications work (if configured)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring and analytics set up
- [ ] Backup strategy in place

## 🔄 Continuous Deployment

Set up automatic deployments:

1. **Vercel**: Automatically deploys on Git push
2. **GitHub Actions**: Create CI/CD workflows
3. **Testing**: Set up automated testing pipeline

Example GitHub Action:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Vercel CLI
        run: npm i -g vercel
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test locally first
4. Create GitHub issue with detailed error information

---

**Happy Deploying! 🚀** 