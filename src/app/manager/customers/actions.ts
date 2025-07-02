'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

// Re-using a more comprehensive Customer type, potentially from a shared location or defined here
// For now, let's define what a manager might want to see in a list.
export type ManagedCustomer = Database['public']['Tables']['customers']['Row'] & {
  // last_interaction_date?: string | null; // Will be covered by customers.Row if it exists with correct name
  profiles: {
    full_name: string | null; // Salesperson full name
    avatar_url?: string | null;
  } | null; // Assigned salesperson
};

interface GetManagedCustomersResult {
  success: boolean;
  customers?: ManagedCustomer[];
  error?: string;
}

export async function getManagedCustomersAction(): Promise<GetManagedCustomersResult> {
  const supabase = createServerActionClient<Database>({ cookies });

  const { data: { user: managerUser }, error: managerUserError } = await supabase.auth.getUser();
  if (managerUserError || !managerUser) {
    return { success: false, error: 'Manager not authenticated.' };
  }

  // Step 1: Get IDs of salespeople managed by this manager
  const { data: managedSalespeople, error: salespeopleError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('supervising_manager_id', managerUser.id)
    .eq('role', 'salesperson');

  if (salespeopleError) {
    return { success: false, error: `Failed to fetch team member IDs: ${salespeopleError.message}` };
  }

  if (!managedSalespeople || managedSalespeople.length === 0) {
    return { success: true, customers: [] };
  }

  const salespersonIds = managedSalespeople.map(sp => sp.id);

  // Step 2: Fetch customers assigned to these salespeople
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select(`
      *,
      profiles ( full_name, avatar_url )
    `)
    .in('assigned_salesperson_id', salespersonIds)
    .is('deleted_at', null)
    .order('last_contacted_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (customersError) {
    return { success: false, error: `Failed to fetch customers for the team: ${customersError.message}` };
  }

  return { success: true, customers: customers as ManagedCustomer[] };
}

// Future actions:
// - getManagedCustomerDetailsAction (for /manager/customers/[customerId])
// - managerUpdateCustomerAction (e.g., reassign, update status) 