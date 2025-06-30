'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export interface SalespersonForAdminView {
    id: string;
    full_name: string | null;
    employee_id: string | null;
    email: string | null;
    avatar_url: string | null;
    assigned_showroom: { id: string; name: string | null; } | null;
    supervising_manager: { id: string; full_name: string | null; } | null;
    status: string | null;
    created_at: string;
}

export async function getSalespeopleForAdminView(): Promise<{ salespeople: SalespersonForAdminView[], error: string | null }> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        // First, get all salespeople
        const { data: salespeopleData, error: salespeopleError } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                employee_id,
                email,
                avatar_url,
                status,
                created_at,
                assigned_showroom_id,
                supervising_manager_id
            `)
            .eq('role', 'salesperson');

        if (salespeopleError) {
            console.error("Error fetching salespeople:", salespeopleError);
            return { salespeople: [], error: salespeopleError.message };
        }

        if (!salespeopleData || salespeopleData.length === 0) {
            return { salespeople: [], error: null };
        }

        // Now enrich each salesperson with their showroom and manager info
        const enrichedSalespeople = await Promise.all(
            salespeopleData.map(async (salesperson) => {
                // Get showroom info if assigned
                let assignedShowroom = null;
                if (salesperson.assigned_showroom_id) {
                    const { data: showroomData } = await supabase
                        .from('showrooms')
                        .select('id, name')
                        .eq('id', salesperson.assigned_showroom_id)
                        .single();
                    
                    if (showroomData) {
                        assignedShowroom = showroomData;
                    }
                }

                // Get supervising manager info if assigned
                let supervisingManager = null;
                if (salesperson.supervising_manager_id) {
                    const { data: managerData } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .eq('id', salesperson.supervising_manager_id)
                        .single();
                    
                    if (managerData) {
                        supervisingManager = managerData;
                    }
                }

                return {
                    id: salesperson.id,
                    full_name: salesperson.full_name,
                    employee_id: salesperson.employee_id,
                    email: salesperson.email,
                    avatar_url: salesperson.avatar_url,
                    status: salesperson.status,
                    created_at: salesperson.created_at,
                    assigned_showroom: assignedShowroom,
                    supervising_manager: supervisingManager
                } as SalespersonForAdminView;
            })
        );

        return { salespeople: enrichedSalespeople, error: null };

    } catch (e: any) {
        console.error('Unexpected error in getSalespeopleForAdminView:', e);
        return { salespeople: [], error: "An unexpected server error occurred." };
    }
} 