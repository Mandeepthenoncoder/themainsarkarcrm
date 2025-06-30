# 🚀 Jewelry CRM Setup Guide

This guide will help you set up and run the Jewelry CRM application locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Docker Desktop** - [Download here](https://docs.docker.com/desktop/) (for local Supabase development)

## 🏗️ Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Mandeepthenoncoder/crmzero.git
cd crmzero
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

#### Copy Environment Template
```bash
cp .env.example .env.local
```

#### Get Your Supabase Credentials

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project" → "New Project"
   - Choose your organization and create a new project
   - Wait for the project to be set up (2-3 minutes)

2. **Get Your Keys**:
   - In your Supabase dashboard, go to **Settings** → **API**
   - Copy the following values:
     - **Project URL** (starts with `https://`)
     - **anon/public key** (starts with `eyJ`)
     - **service_role key** (starts with `eyJ`) - ⚠️ Keep this secret!

3. **Update .env.local**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Database Setup

#### Run Database Migrations
The database schema is already defined in the `supabase/migrations` folder.

**Option A: Using Supabase CLI (Recommended)**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project (get project-ref from your Supabase URL)
supabase link --project-ref your-project-ref

# Push migrations to your database
supabase db push
```

**Option B: Manual SQL Execution**
1. Go to your Supabase dashboard → **SQL Editor**
2. Run the files in this order:
   - `supabase/migrations/20250604120203_create_enum_types.sql`
   - `supabase/migrations/20250604120257_create_table_schemas.sql`
   - `supabase/migrations/20250604122824_create_rls_policies.sql`

### 5. Create Your First Admin User

1. Go to your Supabase dashboard → **Authentication** → **Users**
2. Click **"Add User"** and create an admin account:
   - Email: `admin@yourcompany.com`
   - Password: Choose a secure password
   - Confirm email: ✅ (checked)

3. Go to **Database** → **Table Editor** → **profiles** table
4. Click **"Insert row"** and add:
   ```
   id: [paste the auth user ID from step 2]
   email: admin@yourcompany.com
   full_name: Admin User
   role: admin
   status: active
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Login
- Go to `/login`
- Use the admin credentials you created
- You'll be redirected to the admin dashboard

## 👥 User Management

### Creating Additional Users

**As an Admin, you can:**
- Create **Managers** via the Admin Dashboard
- Create **Showrooms** and assign managers
- View all system data

**As a Manager, you can:**
- Create **Salespeople** via the Manager Dashboard
- Manage your showroom's customers and appointments
- Assign tasks to your team

**As a Salesperson, you can:**
- Manage your customers
- Schedule appointments
- Complete assigned tasks

## 🔧 Configuration Options

### Email Configuration (Optional)
For email features like appointment reminders:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Custom Domain (Production)
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🛠️ Development Tools

### Database Management
- **Supabase Dashboard**: Web-based database management
- **Local Development**: Use `supabase start` for local Supabase instance

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🔒 Security Notes

⚠️ **Important Security Reminders:**
- Never commit `.env.local` or any file containing actual API keys
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges - keep it secret
- Use Row Level Security (RLS) policies (already implemented)
- Regularly rotate your API keys
- Use environment variables for all sensitive data

## 📚 Additional Resources

- **Supabase Documentation**: [docs.supabase.com](https://docs.supabase.com)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
- **Project Requirements**: See `PROJECT_REQUIREMENTS.md`

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify your Supabase URL and keys in `.env.local`
- Check if migrations have been applied
- Ensure your Supabase project is active

**Authentication Not Working**
- Verify auth keys are correct
- Check if user profile exists in the `profiles` table
- Ensure RLS policies are applied

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Getting Help
- Check the GitHub Issues
- Review the Supabase logs in your dashboard
- Verify environment variables are loaded correctly

## 📝 License

This project is private and proprietary. All rights reserved. 