'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export type AppointmentStatusEnum = Database['public']['Enums']['appointment_status_enum'];

export type ManagedAppointment = Database['public']['Tables']['appointments']['Row'] & {
  customers: {
    full_name: string | null;
  } | null;
  // Explicitly name the profile relation if default is ambiguous
  // Assuming the FK from appointments to profiles for salesperson is 'salesperson_id'
  // and the profiles table is referenced as 'profiles' in the join.
  // If Supabase generated types use a different name for this relation, adjust here.
  salesperson: {
    full_name: string | null;
  } | null; 
};

interface GetManagedTeamAppointmentsResult {
  success: boolean;
  appointments?: ManagedAppointment[];
  error?: string;
}

export async function getManagedTeamAppointmentsAction(filters?: { 
    date_from?: string; 
    date_to?: string; 
    status?: AppointmentStatusEnum; // Use the specific enum type
    salesperson_id?: string 
}): Promise<GetManagedTeamAppointmentsResult> {
  const supabase = createServerActionClient<Database>({ cookies });

  const { data: { user: managerUser }, error: managerUserError } = await supabase.auth.getUser();
  if (managerUserError || !managerUser) {
    return { success: false, error: 'Manager not authenticated.' };
  }

  let salespersonIdsToQuery: string[];

  if (filters?.salesperson_id) {
    const { data: specificSalesperson, error: spError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', filters.salesperson_id)
        .eq('supervising_manager_id', managerUser.id)
        .eq('role', 'salesperson')
        .single();
    if (spError || !specificSalesperson) {
        return { success: false, error: 'Invalid salesperson selected or not managed by you.' };
    }
    salespersonIdsToQuery = [filters.salesperson_id];
  } else {
    const { data: managedSalespeople, error: salespeopleError } = await supabase
        .from('profiles')
        .select('id')
        .eq('supervising_manager_id', managerUser.id)
        .eq('role', 'salesperson');

    if (salespeopleError) {
        // console.error('Error fetching managed salespeople IDs:', salespeopleError);
        return { success: false, error: 'Failed to fetch team member IDs for appointment query.' };
    }
    if (!managedSalespeople || managedSalespeople.length === 0) {
        return { success: true, appointments: [] };
    }
    salespersonIdsToQuery = managedSalespeople.map(sp => sp.id);
  }
  
  if (salespersonIdsToQuery.length === 0) {
    return { success: true, appointments: [] };
  }

  let query = supabase
    .from('appointments')
    .select(`
      *,
      customers ( full_name ),
      salesperson:profiles!salesperson_id ( full_name )
    `)
    // The above hint salesperson:profiles!salesperson_id tells Supabase to use the
    // 'profiles' table joined via the 'salesperson_id' foreign key,
    // and name this relation 'salesperson' in the result.
    .in('salesperson_id', salespersonIdsToQuery);

  if (filters?.date_from) {
    query = query.gte('appointment_datetime', filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte('appointment_datetime', filters.date_to + 'T23:59:59');
  }
  if (filters?.status) {
    query = query.eq('status', filters.status); // Now using enum type
  }
  
  query = query.order('appointment_datetime', { ascending: false });

  const { data: appointments, error: appointmentsError } = await query;

  if (appointmentsError) {
    // console.error('Error fetching managed team appointments:', appointmentsError);
    return { success: false, error: 'Failed to fetch appointments for the team.' };
  }
  // The type assertion should be safer now with the explicit join hint and aliasing
  return { success: true, appointments: appointments as unknown as ManagedAppointment[] };
} 