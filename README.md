# 💎 Jewelry CRM System

A comprehensive Customer Relationship Management (CRM) system specifically designed for jewelry businesses. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

### 👥 **Multi-Role System**
- **Admin**: Global oversight, user management, business analytics
- **Manager**: Team management, showroom operations, performance tracking  
- **Salesperson**: Customer relationships, appointments, sales tracking

### 🏪 **Core Functionality**
- **Customer Management**: Detailed profiles, interests, purchase history
- **Appointment Scheduling**: Complete appointment lifecycle management
- **Sales Tracking**: Revenue, transactions, pipeline management
- **Task Management**: Team collaboration and follow-ups
- **Goal Setting**: Performance targets and progress tracking
- **Communication**: Announcements and team messaging
- **Multi-Showroom Support**: Location-based access control

### 🛡️ **Security & Performance**
- **Row Level Security**: Supabase RLS for data protection
- **Role-based Access**: Granular permissions per user type
- **Real-time Updates**: Live data synchronization
- **Modern UI**: Responsive design with shadcn/ui components

## 🚀 Quick Start

### 📋 Prerequisites
- Node.js 18+
- Supabase account
- Git

### ⚡ Setup
```bash
# Clone the repository
git clone https://github.com/Mandeepthenoncoder/crmzero.git
cd crmzero

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Run the application
npm run dev
```

**📖 For detailed setup instructions, see [SETUP.md](./SETUP.md)**

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: Vercel-ready

### Database Schema
- **15+ Tables**: Users, customers, appointments, sales, etc.
- **Comprehensive RLS**: Role-based data access
- **Migration System**: Version-controlled database changes

## 📱 User Interfaces

### Admin Dashboard
- Business-wide analytics
- User and showroom management
- System configuration
- Comprehensive reporting

### Manager Dashboard  
- Team performance overview
- Customer escalation management
- Goal tracking and analytics
- Task assignment

### Salesperson Dashboard
- Customer relationship management
- Appointment scheduling
- Personal performance metrics
- Task completion

## 🔐 Authentication Flow

1. **Single Login URL**: `/login` for all users
2. **Automatic Routing**: Role-based dashboard redirection
3. **Session Management**: Persistent authentication state
4. **Access Control**: Route protection and data filtering

## 📊 Key Metrics Tracked

- **Sales Pipeline**: Customer interests and deal values
- **Performance**: Individual and team KPIs
- **Customer Lifecycle**: Lead status and conversion tracking
- **Appointments**: Scheduling and completion rates
- **Revenue**: Transaction tracking and reporting

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
```

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin interface
│   ├── manager/           # Manager interface  
│   ├── salesperson/       # Salesperson interface
│   └── login/             # Authentication
├── components/            # Reusable UI components
├── contexts/              # React contexts (Auth)
└── lib/                   # Utilities and types
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables
3. Deploy automatically

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📚 Documentation

- **[Setup Guide](./SETUP.md)**: Detailed installation and configuration
- **[Project Requirements](./PROJECT_REQUIREMENTS.md)**: Complete feature specifications
- **[Supabase Guide](../SUPABASE_GUIDE.md)**: Database management workflow

## 🤝 Contributing

This is a private project. For development:

1. Follow the setup guide
2. Create feature branches
3. Test thoroughly before committing
4. Follow the existing code style

## 📄 License

This project is private and proprietary. All rights reserved.

---

**🔗 Links**
- [Live Demo](#) (Coming soon)
- [Documentation](./SETUP.md)
- [Support](#) (GitHub Issues)
