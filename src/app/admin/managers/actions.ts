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
        const { data: managersData, error } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                employee_id,
                email,
                status,
                created_at,
                avatar_url,
                showrooms (id, name),
                salespeople_count:profiles!supervising_manager_id (count)
            `)
            .eq('role', 'manager');

        if (error) {
            console.error("Error fetching managers for admin view:", error);
            return { managers: [], error: error.message };
        }
        
        const managers = managersData.map(manager => ({
            ...manager,
            assigned_showrooms: manager.showrooms ? (Array.isArray(manager.showrooms) ? manager.showrooms : [manager.showrooms]) : [],
            salespeople_supervised_count: (manager.salespeople_count as any)?.[0]?.count || 0,
        }));
        
        // The type needs to be asserted because Supabase's generated types can be tricky with relations
        return { managers: managers as any as ManagerForAdminView[], error: null };

    } catch (e: any) {
        console.error('Unexpected error in getManagersForAdminView:', e);
        return { managers: [], error: "An unexpected server error occurred." };
    }
} 