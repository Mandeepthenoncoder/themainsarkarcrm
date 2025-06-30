-- Helper function to get user's role from profiles table
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- Important for RLS, so it runs with definer's permissions
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN (SELECT role::TEXT FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- Helper function to get user's assigned showroom_id
CREATE OR REPLACE FUNCTION public.get_my_assigned_showroom_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN (SELECT assigned_showroom_id FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- Helper function to check if a user is a manager of a specific showroom
CREATE OR REPLACE FUNCTION public.is_manager_of_showroom(user_id_to_check UUID, showroom_id_to_check UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.showrooms
    WHERE id = showroom_id_to_check AND manager_id = user_id_to_check
  );
END;
$$;


-- RLS Policies for 'profiles' table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admins can do anything on profiles
CREATE POLICY "Profiles: Admins full access"
ON public.profiles FOR ALL
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');

-- Users can view their own profile
CREATE POLICY "Profiles: Authenticated users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile (limited fields - actual field restriction happens in app logic or triggers if complex)
CREATE POLICY "Profiles: Authenticated users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Managers can view profiles of users in their assigned showroom (if applicable, or their team)
-- This is a placeholder and needs refinement based on how teams/showrooms are fully structured for managers.
-- For now, let's assume a manager might need to see salespeople assigned to their showroom.
CREATE POLICY "Profiles: Managers can view their showroom's salespeople"
ON public.profiles FOR SELECT
USING (
  public.get_my_role() = 'manager' AND
  EXISTS (
    SELECT 1 FROM public.showrooms s
    WHERE s.manager_id = auth.uid() AND s.id = profiles.assigned_showroom_id
  )
);


-- RLS Policies for 'showrooms' table
ALTER TABLE public.showrooms ENABLE ROW LEVEL SECURITY;

-- Admins can do anything on showrooms
CREATE POLICY "Showrooms: Admins full access"
ON public.showrooms FOR ALL
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');

-- Authenticated users (e.g., managers, salespeople) can view showroom information.
CREATE POLICY "Showrooms: Authenticated users can view"
ON public.showrooms FOR SELECT
USING (auth.role() = 'authenticated');


-- RLS Policies for 'customers' table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Admins can do anything on customers
CREATE POLICY "Customers: Admins full access"
ON public.customers FOR ALL
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');

-- Salespeople can manage customers assigned to them OR in their showroom
CREATE POLICY "Customers: Salespeople can manage their assigned/showroom customers"
ON public.customers FOR ALL
USING (
    public.get_my_role() = 'salesperson' AND
    (assigned_salesperson_id = auth.uid() OR assigned_showroom_id = public.get_my_assigned_showroom_id())
)
WITH CHECK (
    public.get_my_role() = 'salesperson' AND
    (assigned_salesperson_id = auth.uid() OR assigned_showroom_id = public.get_my_assigned_showroom_id())
);

-- Managers can manage customers in showrooms they manage
CREATE POLICY "Customers: Managers can manage customers in their showroom(s)"
ON public.customers FOR ALL
USING (
    public.get_my_role() = 'manager' AND
    public.is_manager_of_showroom(auth.uid(), assigned_showroom_id)
)
WITH CHECK (
    public.get_my_role() = 'manager' AND
    public.is_manager_of_showroom(auth.uid(), assigned_showroom_id)
);


-- RLS Policies for 'appointments' table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Appointments: Admins full access"
ON public.appointments FOR ALL
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');

-- Users involved in the appointment (customer (via created_by for now), salesperson, manager) or in the showroom can view
-- This is a simplified view policy. INSERT/UPDATE/DELETE will need more specific checks.
CREATE POLICY "Appointments: Involved parties or showroom staff can view"
ON public.appointments FOR SELECT
USING (
    auth.uid() = created_by_user_id OR -- The user who created it (could be salesperson for customer)
    auth.uid() = salesperson_id OR
    auth.uid() = manager_id OR
    (public.get_my_role() = 'salesperson' AND showroom_id = public.get_my_assigned_showroom_id()) OR
    (public.get_my_role() = 'manager' AND public.is_manager_of_showroom(auth.uid(), showroom_id))
);

-- Salespeople/Managers can create appointments for their showroom
CREATE POLICY "Appointments: Staff can create for their showroom"
ON public.appointments FOR INSERT
WITH CHECK (
    (
        public.get_my_role() = 'salesperson' AND
        showroom_id = public.get_my_assigned_showroom_id() AND
        created_by_user_id = auth.uid() -- Salesperson creates it
    ) OR
    (
        public.get_my_role() = 'manager' AND
        public.is_manager_of_showroom(auth.uid(), showroom_id) AND
        created_by_user_id = auth.uid() -- Manager creates it
    )
);

-- TODO: Add more granular RLS for other tables like tasks, goals, announcements, escalations etc.
-- These will follow similar patterns:
-- - Admins full access.
-- - Users can manage items assigned to them or created by them.
-- - Managers can manage items related to their team/showroom.
-- - Public/Authenticated users can view published announcements.
