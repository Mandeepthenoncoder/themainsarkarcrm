'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export interface ManagerForAdminView {
    id: string;
    full_name: string | null;
    employee_id: string | null;
    email: string | null;
    assigned_showrooms: Array<{ id: string; name:string | null; }> | null;
    salespeople_supervised_count: number;
    status: string | null;
    created_at: string;
    avatar_url: string | null;
}

export async function getManagersForAdminView(): Promise<{ managers: ManagerForAdminView[], error: string | null }> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        // First, get all managers
        const { data: managersData, error: managersError } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                employee_id,
                email,
                status,
                created_at,
                avatar_url
            `)
            .eq('role', 'manager');

        if (managersError) {
            console.error("Error fetching managers:", managersError);
            return { managers: [], error: managersError.message };
        }

        if (!managersData || managersData.length === 0) {
            return { managers: [], error: null };
        }

        // Now enrich each manager with their showrooms and salespeople count
        const enrichedManagers = await Promise.all(
            managersData.map(async (manager) => {
                // Get showrooms this manager manages (where showrooms.manager_id = manager.id)
                const { data: managedShowrooms } = await supabase
                    .from('showrooms')
                    .select('id, name')
                    .eq('manager_id', manager.id);

                // Get count of salespeople supervised by this manager
                const { count: salespeopleCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('supervising_manager_id', manager.id)
                    .eq('role', 'salesperson');

                return {
                    ...manager,
                    assigned_showrooms: managedShowrooms || [],
                    salespeople_supervised_count: salespeopleCount || 0
                } as ManagerForAdminView;
            })
        );

        return { managers: enrichedManagers, error: null };

    } catch (e: any) {
        console.error('Unexpected error in getManagersForAdminView:', e);
        return { managers: [], error: "An unexpected server error occurred." };
    }
} 