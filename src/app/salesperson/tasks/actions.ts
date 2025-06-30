'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types'; // Assuming this path is correct

export type SalespersonTaskDetails = Database['public']['Tables']['tasks']['Row'] & {
  // Potentially include related data if needed, e.g., customer name
  customers: {
    id: string;
    full_name: string | null;
  } | null;
};

interface ActionSuccessResult {
  success: true;
  task: SalespersonTaskDetails;
}

interface ActionErrorResult {
  success: false;
  error: string;
  details?: string;
}

export type GetSalespersonTaskDetailsResult = ActionSuccessResult | ActionErrorResult;

export async function getSalespersonTaskDetailsAction(taskId: string): Promise<GetSalespersonTaskDetailsResult> {
  const supabase = createServerActionClient<Database>({ cookies });

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error fetching user:', userError);
    return { success: false, error: 'Authentication required. Please log in.' };
  }

  if (!taskId) {
    return { success: false, error: 'Task ID is required.' };
  }

  try {
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        customers (
          id,
          full_name
        )
      `)
      .eq('id', taskId)
      .eq('assigned_to_user_id', user.id) // Crucial: Ensure task belongs to the logged-in salesperson
      .single();

    if (taskError) {
      console.error('Error fetching task details from DB:', taskError);
      if (taskError.code === 'PGRST116') { // PostgREST error code for "Fetched 0 rows"
        return { success: false, error: 'Task not found or you do not have permission to view it.', details: taskError.message };
      }
      return { success: false, error: 'Failed to fetch task details.', details: taskError.message };
    }

    if (!task) {
      return { success: false, error: 'Task not found or you do not have permission to view it.' };
    }
    
    // Cast to SalespersonTaskDetails to satisfy the return type, 
    // assuming the select query matches the interface structure.
    return { success: true, task: task as SalespersonTaskDetails };

  } catch (e: any) {
    console.error('Unexpected error in getSalespersonTaskDetailsAction:', e);
    return { success: false, error: 'An unexpected error occurred.', details: e.message };
  }
} 