'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export interface CreateCustomerData {
  full_name: string;
  email: string;
  phone?: string | null;
  lead_status: string; // Should match your lead_status_enum
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
  address_country?: string | null;
  notes?: string | null;
}

export interface CreateCustomerResult {
  success: boolean;
  error?: string | null;
  customerId?: string | null;
}

export async function createCustomerAction(
  data: CreateCustomerData
): Promise<CreateCustomerResult> {
  const supabase = createServerActionClient({ cookies });

  // Get current user session
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (sessionError || !user) {
    console.error("Create Customer Action: User not authenticated", sessionError);
    return { success: false, error: "User not authenticated. Please log in again." };
  }

  // Get user's profile to find assigned_showroom_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('assigned_showroom_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error("Create Customer Action: Profile not found for user", user.id, profileError);
    return { success: false, error: "User profile not found. Cannot create customer." };
  }
  
  if (profile.role !== 'salesperson' && profile.role !== 'manager' && profile.role !== 'admin') {
    // Allowing managers/admins to also create customers if they are acting in a salesperson capacity or for setup
    // You might want to restrict this to only 'salesperson' based on exact business rules
    console.warn(`Create Customer Action: User ${user.id} with role ${profile.role} is creating a customer.`);
    // return { success: false, error: "User does not have permission to create customers." };
  }

  if (!profile.assigned_showroom_id) {
    console.error("Create Customer Action: User not assigned to a showroom", user.id);
    return { success: false, error: "You must be assigned to a showroom to create customers." };
  }

  try {
    const { data: newCustomer, error: insertError } = await supabase
      .from('customers')
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone,
        lead_status: data.lead_status as any, // Cast to any if type mismatch with enum, ensure valid value
        address_street: data.address_street,
        address_city: data.address_city,
        address_state: data.address_state,
        address_zip: data.address_zip,
        address_country: data.address_country,
        notes: data.notes,
        assigned_salesperson_id: user.id, // Current logged-in user is the salesperson
        assigned_showroom_id: profile.assigned_showroom_id,
        // tenant_id will be handled by RLS or default value if you set it up that way
      })
      .select('id') // Select the ID of the newly created customer
      .single();

    if (insertError) {
      console.error("Create Customer Action: Error inserting customer (raw):", JSON.stringify(insertError, null, 2));
      let errorMessage = "Failed to create customer. Please check server logs for details.";
      if (insertError.code === '23505') {
        errorMessage = "A customer with this email already exists.";
      } else if (insertError.message) {
        // Check for specific column not found error
        if (insertError.message.includes("column") && insertError.message.includes("does not exist")) {
            errorMessage = `Failed to create customer: Schema mismatch. ${insertError.message}. Please check your 'customers' table schema.`;
        } else if (insertError.message.includes("Could not find the") && insertError.message.includes("column")) {
            errorMessage = `Failed to create customer: Schema mismatch. ${insertError.message}. Please check your 'customers' table schema.`;
        } else {
            errorMessage = `Failed to create customer: ${insertError.message}`;
        }
      } else if (insertError.code) {
        errorMessage = `Failed to create customer. Error code: ${insertError.code}. Details: ${insertError.details || 'No additional details provided.'}`;
      }
      return { success: false, error: errorMessage };
    }

    if (!newCustomer || !newCustomer.id) {
        console.error("Create Customer Action: Customer created but ID not returned.");
        return { success: false, error: "Customer created but failed to get ID." };
    }

    console.log("Create Customer Action: Customer created successfully", newCustomer.id);
    // Revalidate paths to update caches
    revalidatePath('/salesperson/customers');
    revalidatePath(`/salesperson/customers/${newCustomer.id}`);

    return { success: true, customerId: newCustomer.id };

  } catch (e: any) {
    console.error("Create Customer Action: Unexpected error", e);
    return { success: false, error: e.message || "An unexpected error occurred." };
  }
}

export interface SearchedCustomer {
  id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
}

export async function searchCustomersAction(query: string): Promise<{ success: boolean; data?: SearchedCustomer[]; error?: string }> {
  if (!query || query.trim().length < 2) {
    return { success: true, data: [] };
  }
  const supabase = createServerActionClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated." };
  }

  // Fetch salesperson's profile to get their showroom_id to filter customers by showroom
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('assigned_showroom_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.assigned_showroom_id) {
    console.error("Error fetching profile or showroom for search:", profileError);
    return { success: false, error: "Could not determine user's showroom for customer search." };
  }


  const searchString = `%${query.trim()}%`;

  const { data, error } = await supabase
    .from('customers')
    .select('id, full_name, phone_number, email')
    .eq('assigned_showroom_id', profile.assigned_showroom_id) // Filter by salesperson's showroom
    .or(`full_name.ilike.${searchString},phone_number.ilike.${searchString},email.ilike.${searchString}`)
    .limit(10);

  if (error) {
    console.error("Error searching customers:", error);
    return { success: false, error: "Failed to search customers." };
  }

  return { success: true, data: data as SearchedCustomer[] };
}

// --- Log Entry Structures (aligning with page.tsx) ---
interface LogEntry { // Base LogEntry to be used by specific log types
  id: string; 
  date: string; 
  notes: string;
  salesperson_id: string; 
}

interface VisitLogEntry extends LogEntry {
  // Currently no visit-specific fields beyond LogEntry
}

interface CallLogEntry extends LogEntry {
  duration_minutes?: number;
  call_type?: 'Incoming' | 'Outgoing' | 'Missed';
}

// --- End Log Entry Structures ---

// --- Comprehensive Customer Creation ---

export interface InterestCategoryItemProduct {
  id: string; // FE unique key, made required
  product_name: string;
  price_range: string;
  // Diamond specific (optional, based on your form structure)
  diamond_color_stone?: boolean;
  diamond_fancy?: boolean;
  diamond_pressure_setting?: boolean;
  diamond_solitaire?: boolean;
  diamond_traditional?: boolean;
  // Gold specific
  gold_internal_categories?: string[]; // Array of selected internal gold categories
  // Polki specific
  polki_categories?: string[]; // Array of selected polki categories
}

export interface InterestCategoryItem {
  id: string; // FE unique key, made required
  category_type: 'Diamond' | 'Gold' | 'Polki' | '';
  products: InterestCategoryItemProduct[];
  customer_preference_design_selected?: boolean;
  customer_preference_wants_more_discount?: boolean;
  customer_preference_checking_other_jewellers?: boolean;
  customer_preference_felt_less_variety?: boolean;
  customer_preference_others?: string | null;
}

export interface NewComprehensiveCustomerData {
  full_name: string;
  phone_number: string;
  email?: string | null;
  birth_date?: string | null;
  anniversary_date?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_country?: string | null; // Default to India
  catchment_area?: string | null;
  community?: string | null;
  mother_tongue?: string | null;
  reason_for_visit?: string | null;
  lead_source?: string | null;
  age_of_end_user?: string | null;
  interest_level?: 'Hot' | 'Warm' | 'Cold' | 'None' | null;
  interest_categories: InterestCategoryItem[];
  customer_preference_design_selected?: boolean;
  customer_preference_wants_more_discount?: boolean;
  customer_preference_checking_other_jewellers?: boolean;
  customer_preference_felt_less_variety?: boolean;
  customer_preference_others?: string | null;
  purchase_amount?: number | null; // Converted revenue when design is selected
  follow_up_date?: string | null;
  summary_notes?: string | null; // This will map to 'notes' in the DB for general visit summary
  assigned_salesperson_id: string;
  monthly_saving_scheme_status?: 'Joined' | 'Interested' | 'Not Interested' | null;
}

export async function createComprehensiveCustomerAction(
  data: NewComprehensiveCustomerData
): Promise<CreateCustomerResult> {
  const supabase = createServerActionClient({ cookies });
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return { success: false, error: "User not authenticated." };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('assigned_showroom_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.assigned_showroom_id) {
    console.error("Error fetching profile or showroom for comprehensive customer creation:", profileError);
    return { success: false, error: "Could not retrieve user profile or showroom." };
  }

  const customerToInsert = {
    full_name: data.full_name,
    phone_number: data.phone_number,
    email: data.email,
    birth_date: data.birth_date || null,
    anniversary_date: data.anniversary_date || null,
    address_street: data.address_street,
    address_city: data.address_city,
    address_state: data.address_state,
    address_country: data.address_country || 'India',
    catchment_area: data.catchment_area,
    community: data.community,
    mother_tongue: data.mother_tongue,
    reason_for_visit: data.reason_for_visit,
    lead_source: data.lead_source,
    age_of_end_user: data.age_of_end_user,
    interest_level: data.interest_level || 'None',
    // Storing as JSONB
    interest_categories_json: data.interest_categories.length > 0 ? data.interest_categories.map(interest => ({
        category_type: interest.category_type,
        products: interest.products,
        customer_preferences: {
            design_selected: interest.customer_preference_design_selected,
            wants_more_discount: interest.customer_preference_wants_more_discount,
            checking_other_jewellers: interest.customer_preference_checking_other_jewellers,
            felt_less_variety: interest.customer_preference_felt_less_variety,
            others: interest.customer_preference_others
        }
    })) : null,
    follow_up_date: data.follow_up_date || null,
    notes: data.summary_notes, // Map summary_notes from form to general 'notes'
    assigned_salesperson_id: data.assigned_salesperson_id,
    assigned_showroom_id: profile.assigned_showroom_id,
    monthly_saving_scheme_status: data.monthly_saving_scheme_status,
    purchase_amount: data.purchase_amount || null,
    // Initialize logs as empty arrays if needed, or handle null in UI
    visit_logs: [], 
    call_logs: []
  };

  try {
    const { data: newCustomer, error: insertError } = await supabase
      .from('customers')
      .insert(customerToInsert)
      .select('id')
      .single();

    if (insertError) {
      console.error("Create Comprehensive Customer Action: Error inserting customer:", JSON.stringify(insertError, null, 2));
       let errorMessage = `Failed to create customer: ${insertError.message}`;
       if (insertError.message.includes("Could not find the") && insertError.message.includes("column")) {
            errorMessage = `Failed to create customer: Schema mismatch. ${insertError.message}. Please check your 'customers' table schema.`;
       }
      return { success: false, error: errorMessage };
    }

    if (!newCustomer || !newCustomer.id) {
      return { success: false, error: "Customer created but failed to get ID." };
    }

    revalidatePath('/salesperson/customers');
    revalidatePath(`/salesperson/customers/${newCustomer.id}`);
    return { success: true, customerId: newCustomer.id };

  } catch (e: any) {
    console.error("Create Comprehensive Customer Action: Unexpected error", e);
    return { success: false, error: e.message || "An unexpected error occurred." };
  }
}

export async function updateComprehensiveCustomerAction(
  customerId: string,
  data: NewComprehensiveCustomerData
): Promise<CreateCustomerResult> {
  const supabase = createServerActionClient({ cookies });
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return { success: false, error: "User not authenticated." };
  }

  // We don't need to check for showroom here, as we assume an existing customer is being updated.
  // RLS policies should prevent a salesperson from one showroom from updating a customer in another.

  const customerToUpdate = {
    full_name: data.full_name,
    phone_number: data.phone_number,
    email: data.email,
    birth_date: data.birth_date || null,
    anniversary_date: data.anniversary_date || null,
    address_street: data.address_street,
    address_city: data.address_city,
    address_state: data.address_state,
    address_country: data.address_country || 'India',
    catchment_area: data.catchment_area,
    community: data.community,
    mother_tongue: data.mother_tongue,
    reason_for_visit: data.reason_for_visit,
    lead_source: data.lead_source,
    age_of_end_user: data.age_of_end_user,
    interest_level: data.interest_level || 'None',
    interest_categories_json: data.interest_categories.length > 0 ? data.interest_categories.map(interest => ({
        category_type: interest.category_type,
        products: interest.products,
        customer_preferences: {
            design_selected: interest.customer_preference_design_selected,
            wants_more_discount: interest.customer_preference_wants_more_discount,
            checking_other_jewellers: interest.customer_preference_checking_other_jewellers,
            felt_less_variety: interest.customer_preference_felt_less_variety,
            others: interest.customer_preference_others
        }
    })) : null,
    follow_up_date: data.follow_up_date || null,
    notes: data.summary_notes,
    assigned_salesperson_id: data.assigned_salesperson_id,
    monthly_saving_scheme_status: data.monthly_saving_scheme_status,
    purchase_amount: data.purchase_amount || null,
    updated_at: new Date().toISOString(),
  };

  try {
    const { error: updateError } = await supabase
      .from('customers')
      .update(customerToUpdate)
      .eq('id', customerId);

    if (updateError) {
      console.error("Update Comprehensive Customer Action: Error updating customer:", JSON.stringify(updateError, null, 2));
       let errorMessage = `Failed to update customer: ${updateError.message}`;
       if (updateError.message.includes("Could not find the") && updateError.message.includes("column")) {
            errorMessage = `Failed to update customer: Schema mismatch. ${updateError.message}. Please check your 'customers' table schema.`;
       }
      return { success: false, error: errorMessage };
    }

    revalidatePath('/salesperson/customers');
    revalidatePath(`/salesperson/customers/${customerId}`);
    revalidatePath(`/salesperson/customers/${customerId}/edit`);

    return { success: true, customerId: customerId };

  } catch (e: any) {
    console.error("Update Comprehensive Customer Action: Unexpected error", e);
    return { success: false, error: e.message || "An unexpected error occurred." };
  }
}

// --- Call Log Action ---
export async function addCallLogAction(
  customerId: string,
  logData: { notes: string; duration_minutes?: number; call_type?: 'Incoming' | 'Outgoing' | 'Missed' }
): Promise<{ success: boolean; error?: string; newLog?: CallLogEntry }> {
  const supabase = createServerActionClient({ cookies });
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return { success: false, error: "User not authenticated." };
  }

  try {
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('call_logs')
      .eq('id', customerId)
      .single();

    if (fetchError || !customer) {
      console.error("Error fetching customer for call log:", fetchError);
      return { success: false, error: "Failed to fetch customer data." };
    }

    const newLogEntry: CallLogEntry = {
      id: crypto.randomUUID(), // Generate unique ID
      date: new Date().toISOString(), // Current timestamp
      notes: logData.notes,
      duration_minutes: logData.duration_minutes,
      call_type: logData.call_type,
      salesperson_id: user.id, // Logged-in user
    };

    const existingLogs = (customer.call_logs as CallLogEntry[] | null) || [];
    const updatedLogs = [...existingLogs, newLogEntry];

    const { error: updateError } = await supabase
      .from('customers')
      .update({ call_logs: updatedLogs })
      .eq('id', customerId);

    if (updateError) {
      console.error("Error updating call logs:", updateError);
      return { success: false, error: "Failed to add call log." };
    }

    revalidatePath(`/salesperson/customers/${customerId}`);
    return { success: true, newLog: newLogEntry };
  } catch (e: any) {
    console.error("Add Call Log Action: Unexpected error", e);
    return { success: false, error: e.message || "An unexpected error occurred." };
  }
}

// --- Visit Log Action ---
export async function addVisitLogAction(
  customerId: string,
  logData: { notes: string } // Visit logs might have fewer specific fields
): Promise<{ success: boolean; error?: string; newLog?: VisitLogEntry }> {
  const supabase = createServerActionClient({ cookies });
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return { success: false, error: "User not authenticated." };
  }

  try {
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('visit_logs')
      .eq('id', customerId)
      .single();

    if (fetchError || !customer) {
      console.error("Error fetching customer for visit log:", fetchError);
      return { success: false, error: "Failed to fetch customer data." };
    }

    const newLogEntry: VisitLogEntry = {
      id: crypto.randomUUID(), // Generate unique ID
      date: new Date().toISOString(), // Current timestamp
      notes: logData.notes,
      salesperson_id: user.id, // Logged-in user
    };

    const existingLogs = (customer.visit_logs as VisitLogEntry[] | null) || [];
    const updatedLogs = [...existingLogs, newLogEntry];

    const { error: updateError } = await supabase
      .from('customers')
      .update({ visit_logs: updatedLogs })
      .eq('id', customerId);

    if (updateError) {
      console.error("Error updating visit logs:", updateError);
      return { success: false, error: "Failed to add visit log." };
    }

    revalidatePath(`/salesperson/customers/${customerId}`);
    return { success: true, newLog: newLogEntry };
  } catch (e: any) {
    console.error("Add Visit Log Action: Unexpected error", e);
    return { success: false, error: e.message || "An unexpected error occurred." };
  }
}

// --- Update Customer Interest Level Action ---

// Assuming your Database types define this enum, or you have it defined elsewhere
// For example: export type CustomerInterestLevel = Database["public"]["Enums"]["customer_interest_level_enum"];
// If not, define it explicitly:
type CustomerInterestLevel = 'Hot' | 'Warm' | 'Cold' | 'None';

export async function updateCustomerInterestLevelAction(
  customerId: string,
  interestLevel: CustomerInterestLevel
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerActionClient({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'User not authenticated.' };
  }

  // Basic check: Does this user even have rights to update this customer?
  // This is a simplified check. A more robust check might involve checking
  // if the customer is assigned to this salesperson or their showroom, or if user is manager/admin.
  // For now, just checking authentication.

  const { error } = await supabase
    .from('customers')
    .update({ interest_level: interestLevel, updated_at: new Date().toISOString() })
    .eq('id', customerId);

  if (error) {
    console.error('Error updating customer interest level:', error);
    return { success: false, error: 'Failed to update interest level.' };
  }

  revalidatePath(`/salesperson/customers/${customerId}`);
  revalidatePath('/salesperson/dashboard'); // Dashboard might show interest levels
  revalidatePath('/manager/customers'); 
  revalidatePath(`/manager/customers/${customerId}`);

  return { success: true };
}

// --- Update Customer Lead Status ---

// Define the possible lead status values based on your enum
// Ensure this matches your Database["public"]["Enums"]["lead_status_enum"]
export type LeadStatusEnum = 
  | "New Lead"
  | "Contacted"
  | "Qualified"
  | "Proposal Sent"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

export async function updateCustomerLeadStatusAction(
  customerId: string,
  leadStatus: LeadStatusEnum
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerActionClient({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'User not authenticated.' };
  }

  // TODO: Add more robust RLS or explicit permission check here if needed.
  // e.g., is the user (salesperson/manager) allowed to update this specific customer?
  // For now, we rely on RLS for the update operation on the 'customers' table itself.

  const { error } = await supabase
    .from('customers')
    .update({ lead_status: leadStatus, updated_at: new Date().toISOString() })
    .eq('id', customerId);

  if (error) {
    console.error('Error updating customer lead status:', error);
    return { success: false, error: `Failed to update lead status: ${error.message}` };
  }

  revalidatePath(`/salesperson/customers/${customerId}`);
  revalidatePath('/salesperson/dashboard');
  revalidatePath('/salesperson/customers');
  revalidatePath('/manager/customers');
  revalidatePath(`/manager/customers/${customerId}`);
  revalidatePath('/manager/dashboard');

  return { success: true };
}

// Consider adding RLS policies for UPDATE on the customers table that allow
// assigned salespeople or relevant managers to update lead_status. 