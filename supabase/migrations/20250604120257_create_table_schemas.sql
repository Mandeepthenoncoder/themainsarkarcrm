-- Helper function to update 'updated_at' column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table Schemas

-- Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE, -- Kept for easier joins, ensure it's consistent with auth.users.email
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone_number TEXT,
    role user_role_enum NOT NULL,
    status user_status_enum NOT NULL DEFAULT 'pending_approval',
    employee_id TEXT UNIQUE,
    date_hired DATE,
    assigned_showroom_id UUID, -- Foreign key added later after showrooms table
    supervising_manager_id UUID REFERENCES public.profiles(id), -- Self-referential FK for salesperson to manager
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Showrooms Table
CREATE TABLE public.showrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location_address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone_number TEXT,
    email_address TEXT UNIQUE,
    date_established DATE,
    status showroom_status_enum NOT NULL DEFAULT 'active',
    operating_hours JSONB,
    manager_id UUID UNIQUE REFERENCES public.profiles(id), -- Manager supervising this showroom
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.showrooms ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_showrooms_updated
  BEFORE UPDATE ON public.showrooms
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Add FK constraint from profiles to showrooms (deferred due to creation order)
ALTER TABLE public.profiles
ADD CONSTRAINT fk_profiles_assigned_showroom
FOREIGN KEY (assigned_showroom_id) REFERENCES public.showrooms(id);

-- Customers Table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone_number TEXT,
    avatar_url TEXT,
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    address_country TEXT,
    date_added TIMESTAMPTZ DEFAULT now() NOT NULL,
    last_contacted_date TIMESTAMPTZ,
    lead_status lead_status_enum NOT NULL DEFAULT 'New Lead',
    lead_source TEXT,
    assigned_showroom_id UUID NOT NULL REFERENCES public.showrooms(id),
    assigned_salesperson_id UUID REFERENCES public.profiles(id),
    notes TEXT,
    manager_notes TEXT,
    manager_lead_status_override manager_lead_override_enum,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_customers_updated
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Appointments Table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    salesperson_id UUID REFERENCES public.profiles(id),
    manager_id UUID REFERENCES public.profiles(id), -- If handled directly by a manager
    showroom_id UUID NOT NULL REFERENCES public.showrooms(id),
    appointment_datetime TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,
    service_type TEXT NOT NULL,
    status appointment_status_enum NOT NULL DEFAULT 'Scheduled',
    notes TEXT,
    internal_notes TEXT,
    created_by_user_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_appointments_updated
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Tasks Table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to_user_id UUID NOT NULL REFERENCES public.profiles(id),
    assigned_by_user_id UUID REFERENCES public.profiles(id),
    customer_id UUID REFERENCES public.customers(id),
    appointment_id UUID REFERENCES public.appointments(id),
    due_date TIMESTAMPTZ NOT NULL,
    priority task_priority_enum NOT NULL DEFAULT 'Medium',
    status task_status_enum NOT NULL DEFAULT 'To Do',
    completion_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_tasks_updated
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Goals Table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    target_metric TEXT NOT NULL,
    target_value_numeric DECIMAL,
    target_value_text TEXT,
    current_value_numeric DECIMAL DEFAULT 0,
    current_value_text TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    goal_type goal_type_enum NOT NULL,
    assignee_id UUID NOT NULL, 
    created_by_manager_id UUID NOT NULL REFERENCES public.profiles(id),
    status goal_status_enum NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_goals_updated
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Announcements Table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES public.profiles(id),
    status announcement_status_enum NOT NULL DEFAULT 'Draft',
    is_pinned BOOLEAN DEFAULT false,
    target_audience_role announcement_target_role_enum, 
    publish_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_announcements_updated
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- announcement_showrooms (Junction Table)
CREATE TABLE public.announcement_showrooms (
    announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    showroom_id UUID NOT NULL REFERENCES public.showrooms(id) ON DELETE CASCADE,
    PRIMARY KEY (announcement_id, showroom_id)
);
ALTER TABLE public.announcement_showrooms ENABLE ROW LEVEL SECURITY;

-- Escalations Table
CREATE TABLE public.escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    issue_title TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    priority escalation_priority_enum NOT NULL DEFAULT 'Medium',
    status escalation_status_enum NOT NULL DEFAULT 'Open',
    reported_by_user_id UUID NOT NULL REFERENCES public.profiles(id),
    assigned_to_manager_id UUID REFERENCES public.profiles(id),
    resolution_details TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_escalations_updated
  BEFORE UPDATE ON public.escalations
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Activity Log Table
CREATE TABLE public.activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id), 
    related_entity_type TEXT,
    related_entity_id TEXT, 
    action_type TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- System Settings Table
CREATE TABLE public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    description TEXT,
    data_type TEXT NOT NULL, 
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL 
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_system_settings_updated
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Account Flags Table
CREATE TABLE public.account_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    flagged_by_user_id UUID NOT NULL REFERENCES public.profiles(id),
    description TEXT NOT NULL,
    severity flag_severity_enum NOT NULL DEFAULT 'low',
    date_added TIMESTAMPTZ DEFAULT now() NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL, 
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL  
);
ALTER TABLE public.account_flags ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_account_flags_updated
  BEFORE UPDATE ON public.account_flags
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Sales Transactions Table
CREATE TABLE public.sales_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    salesperson_id UUID NOT NULL REFERENCES public.profiles(id),
    showroom_id UUID NOT NULL REFERENCES public.showrooms(id),
    transaction_date TIMESTAMPTZ DEFAULT now() NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL, 
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.sales_transactions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_sales_transactions_updated
  BEFORE UPDATE ON public.sales_transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Transaction Items Table
CREATE TABLE public.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.sales_transactions(id) ON DELETE CASCADE,
    product_sku TEXT,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL, 
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_transaction_items_updated
  BEFORE UPDATE ON public.transaction_items
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
