-- Fix RLS policy to allow salespeople to view other salespeople for customer assignment

-- Add policy allowing salespeople to view other salespeople in the same organization
-- This is needed for customer assignment functionality
CREATE POLICY "Profiles: Salespeople can view other salespeople for assignment"
ON public.profiles FOR SELECT
USING (
  public.get_my_role() = 'salesperson' AND 
  profiles.role = 'salesperson' AND
  profiles.status = 'active'
);

-- Add policy allowing salespeople to view managers for hierarchy understanding
CREATE POLICY "Profiles: Salespeople can view managers for hierarchy"
ON public.profiles FOR SELECT
USING (
  public.get_my_role() = 'salesperson' AND 
  profiles.role = 'manager' AND
  profiles.status = 'active'
); 