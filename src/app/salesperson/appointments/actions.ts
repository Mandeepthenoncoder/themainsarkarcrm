"use server";

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export interface CreateAppointmentData {
  customerId: string;
  appointmentDate: string;
  appointmentTime: string;
  purpose: string; // This will map to service_type
  notes?: string; // This will map to the public notes
}

export async function createAppointmentAction(formData: CreateAppointmentData) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated." };
  }

  // Fetch salesperson's assigned showroom
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('assigned_showroom_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError);
    return { success: false, error: "Could not retrieve user profile information." };
  }

  if (!profile.assigned_showroom_id) {
    return { success: false, error: "You must be assigned to a showroom to create appointments." };
  }
  
  // Combine date and time into a timestamp with time zone
  // Assuming appointmentDate is YYYY-MM-DD and appointmentTime is HH:MM
  const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`);
  if (isNaN(appointmentDateTime.getTime())) {
    return { success: false, error: "Invalid date or time format." };
  }

  const appointmentToInsert = {
    customer_id: formData.customerId,
    salesperson_id: user.id, // Assuming the logged-in user is the salesperson
    showroom_id: profile.assigned_showroom_id,
    appointment_datetime: appointmentDateTime.toISOString(),
    service_type: formData.purpose,
    notes: formData.notes,
    // status defaults to 'Scheduled' in the DB
    created_by_user_id: user.id,
    // duration_minutes, manager_id, internal_notes are not yet handled by the form
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentToInsert)
    .select()
    .single();

  if (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error: `Failed to create appointment: ${error.message}` };
  }

  revalidatePath('/salesperson/appointments'); // Revalidate the appointments list page
  if (data && data.id) {
    revalidatePath(`/salesperson/appointments/${data.id}`); // Revalidate potential detail page
  }
  revalidatePath(`/salesperson/customers/${formData.customerId}`); // Revalidate customer detail page (e.g., to show upcoming appointments)


  return { success: true, data };
} 