'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export interface AppointmentForAdminView {
    id: string;
    customer_name: string | null;
    customer_id: string | null;
    salesperson_name: string | null;
    salesperson_id: string | null;
    showroom_name: string | null;
    showroom_id: string | null;
    appointment_datetime: string;
    service_type: string | null;
    status: string | null;
    notes: string | null;
}

export async function getAppointmentsForAdminView(): Promise<{ appointments: AppointmentForAdminView[], error: string | null }> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                id,
                appointment_datetime,
                service_type,
                status,
                notes,
                customer_id,
                customers (full_name),
                salesperson_id,
                salesperson:profiles!appointments_salesperson_id_fkey (full_name),
                showroom_id,
                showrooms (name)
            `);

        if (error) {
            console.error("Error fetching appointments for admin view:", error);
            return { appointments: [], error: error.message };
        }
        
        const appointments = data.map(apt => ({
            id: apt.id,
            appointment_datetime: apt.appointment_datetime,
            service_type: apt.service_type,
            status: apt.status,
            notes: apt.notes,
            customer_id: apt.customer_id,
            customer_name: apt.customers?.full_name || null,
            salesperson_id: apt.salesperson_id,
            salesperson_name: apt.salesperson?.full_name || null,
            showroom_id: apt.showroom_id,
            showroom_name: apt.showrooms?.name || null,
        }));

        return { appointments: appointments as AppointmentForAdminView[], error: null };

    } catch (e: any) {
        console.error('Unexpected error in getAppointmentsForAdminView:', e);
        return { appointments: [], error: "An unexpected server error occurred." };
    }
} 