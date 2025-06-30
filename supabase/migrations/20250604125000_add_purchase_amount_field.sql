-- Add purchase_amount field for converted revenue when design is selected
ALTER TABLE public.customers 
ADD COLUMN purchase_amount DECIMAL(12,2) DEFAULT NULL;

-- Add comment to describe the column
COMMENT ON COLUMN public.customers.purchase_amount IS 'Purchase amount when design is selected - counts as converted revenue';

-- Create index for better performance on revenue queries
CREATE INDEX idx_customers_purchase_amount ON public.customers (purchase_amount) WHERE purchase_amount IS NOT NULL; 