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
        const { data, error } = await supabase
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
                showrooms (id, name),
                supervising_manager_id,
                manager:profiles!supervising_manager_id (id, full_name)
            `)
            .eq('role', 'salesperson');

        if (error) {
            console.error("Error fetching salespeople for admin view:", error);
            return { salespeople: [], error: error.message };
        }
        
        const salespeople = data.map(sp => ({
            id: sp.id,
            full_name: sp.full_name,
            employee_id: sp.employee_id,
            email: sp.email,
            avatar_url: sp.avatar_url,
            status: sp.status,
            created_at: sp.created_at,
            assigned_showroom: sp.showrooms ? { id: sp.assigned_showroom_id!, name: sp.showrooms.name } : null,
            supervising_manager: sp.manager ? { id: sp.supervising_manager_id!, full_name: sp.manager.full_name } : null
        }));

        return { salespeople: salespeople as SalespersonForAdminView[], error: null };

    } catch (e: any) {
        console.error('Unexpected error in getSalespeopleForAdminView:', e);
        return { salespeople: [], error: "An unexpected server error occurred." };
    }
} 