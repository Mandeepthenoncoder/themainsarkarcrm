-- Add missing enum type for interest level
CREATE TYPE interest_level_enum AS ENUM (
    'High',
    'Medium',
    'Low',
    'None'
);

-- Add missing columns to customers table that are referenced in the application code
ALTER TABLE public.customers 
ADD COLUMN interest_categories_json JSONB,
ADD COLUMN customer_preferences JSONB,
ADD COLUMN birth_date DATE,
ADD COLUMN anniversary_date DATE,
ADD COLUMN catchment_area TEXT,
ADD COLUMN community TEXT,
ADD COLUMN mother_tongue TEXT,
ADD COLUMN reason_for_visit TEXT,
ADD COLUMN age_of_end_user TEXT,
ADD COLUMN follow_up_date TIMESTAMPTZ,
ADD COLUMN interest_level interest_level_enum,
ADD COLUMN visit_logs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN call_logs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN monthly_saving_scheme_status TEXT;

-- Create index on JSONB columns for better performance
CREATE INDEX idx_customers_interest_categories ON public.customers USING GIN (interest_categories_json);
CREATE INDEX idx_customers_customer_preferences ON public.customers USING GIN (customer_preferences);

-- Add comments to describe the columns
COMMENT ON COLUMN public.customers.interest_categories_json IS 'JSONB array storing customer interest categories and product preferences';
COMMENT ON COLUMN public.customers.customer_preferences IS 'JSONB object storing various customer preferences and settings';
COMMENT ON COLUMN public.customers.visit_logs IS 'JSONB array storing visit history logs';
COMMENT ON COLUMN public.customers.call_logs IS 'JSONB array storing call history logs'; 