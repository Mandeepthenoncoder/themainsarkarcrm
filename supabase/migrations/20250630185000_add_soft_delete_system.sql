-- Add soft delete system to customers table
-- This allows "deleted" customers to be stored temporarily and recovered

-- Add soft delete columns to customers table
ALTER TABLE customers 
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN deleted_by UUID DEFAULT NULL REFERENCES auth.users(id);

-- Add index for performance on deleted_at queries
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_customers_active ON customers(id) WHERE deleted_at IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN customers.deleted_at IS 'Timestamp when customer was soft deleted. NULL means not deleted.';
COMMENT ON COLUMN customers.deleted_by IS 'ID of admin user who deleted this customer'; 