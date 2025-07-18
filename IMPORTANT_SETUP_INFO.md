#  IMPORTANT SETUP INFO - Jewelry CRM

## � Quick Reference for Environment Variables

### Required Environment Variables

Create a \.env.local\ file in the project root with these variables:

\\\env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
\\\

##  How to Get Your Supabase Keys

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click **\
New
Project\**
4. Choose organization and create project
5. Wait 2-3 minutes for setup

### Step 2: Get API Keys
1. Go to your project dashboard
2. Click **Settings** (gear icon) in sidebar
3. Click **API** in the settings menu
4. Copy these values

##  Database Setup

Apply these migrations in order via Supabase SQL Editor:
1. supabase/migrations/20250604120203_create_enum_types.sql
2. supabase/migrations/20250604120257_create_table_schemas.sql  
3. supabase/migrations/20250604122824_create_rls_policies.sql

##  Create First Admin User

1. Go to Authentication  Users in Supabase
2. Add user with email/password
3. Copy User ID
4. Add profile record in profiles table with role: admin

Repository: https://github.com/Mandeepthenoncoder/crmzero.git
