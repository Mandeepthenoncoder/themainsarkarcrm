'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js'; // For admin client
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export type SalespersonProfile = Database['public']['Tables']['profiles']['Row'] & {
  showrooms: { name: string | null } | null; // For displaying showroom name
};

interface GetTeamMembersResult {
  success: boolean;
  teamMembers?: SalespersonProfile[];
  error?: string;
}

export async function getTeamMembersAction(): Promise<GetTeamMembersResult> {
  const supabase = createServerActionClient<Database>({ cookies });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('[getTeamMembersAction] User not authenticated:', userError);
    return { success: false, error: 'User not authenticated.' };
  }
  console.log('[getTeamMembersAction] Logged-in manager ID for query:', user.id);

  const { data: teamMembers, error } = await supabase
    .from('profiles')
    .select(`
      *,
      showrooms:assigned_showroom_id ( name )
    `)
    .eq('supervising_manager_id', user.id)
    .eq('role', 'salesperson'); // Ensure we only fetch salespeople

  if (error) {
    console.error('[getTeamMembersAction] Error fetching team members from DB:', error);
    return { success: false, error: `Failed to fetch team members: ${error.message}` };
  }

  console.log('[getTeamMembersAction] Raw teamMembers fetched from DB:', JSON.stringify(teamMembers, null, 2));

  if (!teamMembers) {
    console.log('[getTeamMembersAction] teamMembers array is null or undefined after fetch.');
    return { success: true, teamMembers: [] }; // Return empty array if null/undefined to avoid page error
  }

  return { success: true, teamMembers: teamMembers as SalespersonProfile[] };
}

// --- Fetch Showrooms for Dropdown ---
export interface ShowroomBasicInfo {
  id: string;
  name: string;
}
interface GetShowroomsResult {
  success: boolean;
  showrooms?: ShowroomBasicInfo[];
  error?: string;
}

export async function getShowroomsForManagerAction(): Promise<GetShowroomsResult> {
  const supabase = createServerActionClient<Database>({ cookies });
  // In a multi-tenant system or if managers are restricted to certain showrooms,
  // you might need to filter showrooms based on manager's permissions or assignments.
  // For now, fetching all showrooms.
  const { data, error } = await supabase
    .from('showrooms')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching showrooms:', error);
    return { success: false, error: 'Failed to fetch showrooms.' };
  }
  return { success: true, showrooms: data };
}

// --- Create Salesperson Action ---
export interface CreateSalespersonData {
  full_name: string;
  email: string;
  password?: string; // Made optional for now, but form should require it
  employee_id?: string | null;
  assigned_showroom_id: string;
}

interface CreateSalespersonResult {
  success: boolean;
  salespersonId?: string;
  error?: string;
}

export async function createSalespersonAction(formData: CreateSalespersonData): Promise<CreateSalespersonResult> {
  // Check for necessary environment variables for admin client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase URL or Service Role Key not configured.');
    return { success: false, error: 'Server configuration error: Unable to create user. Please contact support.' };
  }

  // Create an admin client for user creation
  // IMPORTANT: SERVICE_ROLE_KEY should never be exposed to the client-side.
  // This action runs on the server, so it's safe here.
  const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const regularSupabaseClient = createServerActionClient<Database>({ cookies });
  const { data: { user: managerUser }, error: managerUserError } = await regularSupabaseClient.auth.getUser();

  if (managerUserError || !managerUser) {
    return { success: false, error: 'Manager not authenticated.' };
  }

  if (!formData.password) {
    return { success: false, error: 'Password is required to create a new salesperson account.' };
  }

  // Step 1: Create the Auth user
  const { data: authUserResponse, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true, // Optionally auto-confirm email, or set up a confirmation flow
    user_metadata: {
      full_name: formData.full_name,
      // We can add role here if we want it in auth.users table's user_metadata
      // role: 'salesperson', 
    }
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    // Provide a more user-friendly message for common errors
    if (authError.message.includes('User already registered') || (authError.message.includes('duplicate key value violates unique constraint') && authError.message.includes('users_email_key'))) {
      return { success: false, error: 'A user with this email address already exists.' };
    }
    return { success: false, error: `Failed to create user account: ${authError.message}` };
  }

  if (!authUserResponse || !authUserResponse.user) {
    return { success: false, error: 'Auth user creation did not return a user object.' };
  }

  const newAuthUserId = authUserResponse.user.id;

  // Define types for enum values to satisfy the linter and ensure type safety
  type UserRoleEnum = Database['public']['Enums']['user_role_enum'];
  type UserStatusEnum = Database['public']['Enums']['user_status_enum'];

  // Step 2: Insert into the 'profiles' table using the new Auth user's ID
  const profileToInsert: {
    id: string;
    full_name: string;
    email: string;
    employee_id?: string | null;
    assigned_showroom_id: string;
    supervising_manager_id: string;
    role: UserRoleEnum;
    status: UserStatusEnum;
  } = {
    id: newAuthUserId, 
    full_name: formData.full_name,
    email: formData.email, 
    employee_id: formData.employee_id,
    assigned_showroom_id: formData.assigned_showroom_id,
    supervising_manager_id: managerUser.id,
    role: 'salesperson' as UserRoleEnum, // Explicitly cast to the enum type
    status: 'active' as UserStatusEnum,    // Explicitly cast to the enum type
  };

  console.log('[createSalespersonAction] Data being inserted into profiles:', JSON.stringify(profileToInsert, null, 2));
  console.log('[createSalespersonAction] Current manager ID (auth.uid for RLS check):', managerUser.id);

  const { data: newProfile, error: insertProfileError } = await regularSupabaseClient
    .from('profiles')
    .insert(profileToInsert) // Now profileToInsert has stricter types
    .select('id')
    .single();

  if (insertProfileError) {
    console.error('Error creating salesperson profile after auth user creation:', insertProfileError);
    // Attempt to delete the created auth user if profile insertion fails to avoid orphaned auth users
    // This is a best-effort cleanup.
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(newAuthUserId);
    if (deleteUserError) {
        console.error('Failed to clean up (delete) orphaned auth user:', deleteUserError);
    }
    
    if (insertProfileError.code === '23505') { 
        if (insertProfileError.message.includes('profiles_employee_id_key')) {
             return { success: false, error: 'A user with this Employee ID already exists in profiles.' };
        }
        // Other unique constraint violations on profiles table
        return { success: false, error: 'This salesperson profile could not be created due to a conflict (e.g., duplicate data).' };
    }
    return { success: false, error: `Failed to create salesperson profile: ${insertProfileError.message}` };
  }

  if (!newProfile || !newProfile.id) {
    return { success: false, error: 'Salesperson profile created but failed to retrieve ID after auth user creation.' };
  }
  
  return { success: true, salespersonId: newProfile.id };
}

// --- Get Salesperson Details Action ---
interface GetSalespersonDetailsResult {
  success: boolean;
  salesperson?: SalespersonProfile; // Reusing SalespersonProfile which includes showroom name
  error?: string;
}

export async function getSalespersonDetailsAction(salespersonId: string): Promise<GetSalespersonDetailsResult> {
  const supabase = createServerActionClient<Database>({ cookies });

  // Optional: Verify manager has rights to view this salesperson if not their direct report,
  // though typically a manager would only access via links from their own team list.
  // For now, directly fetching based on ID.

  const { data: salesperson, error } = await supabase
    .from('profiles')
    .select(`
      *,
      showrooms:assigned_showroom_id ( name )
    `)
    .eq('id', salespersonId)
    .eq('role', 'salesperson') // Ensure it is a salesperson profile
    .single();

  if (error) {
    console.error('Error fetching salesperson details:', error);
    return { success: false, error: 'Failed to fetch salesperson details. Profile not found or access issue.' };
  }

  if (!salesperson) {
    return { success: false, error: 'Salesperson not found.' };
  }

  // Additional check: Ensure the logged-in manager is the supervisor of this salesperson
  const { data: { user: managerUser } } = await supabase.auth.getUser();
  if (!managerUser || salesperson.supervising_manager_id !== managerUser.id) {
    // If you want admins to bypass this, add a check for managerUser.role === 'admin'
    return { success: false, error: 'You are not authorized to view this salesperson\'s details.' };
  }

  return { success: true, salesperson: salesperson as SalespersonProfile };
}

// - updateSalespersonAction
// - getSalespersonDetailsAction (for the [salespersonId] page) 