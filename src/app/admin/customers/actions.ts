'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export interface CustomerForAdminView {
    id: string;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    avatar_url: string | null;
    assigned_showroom: { id: string; name: string | null; } | null;
    salesperson: { id: string; full_name: string | null; } | null;
    lead_status: string | null;
    created_at: string;
    last_contacted_date: string | null;
}

export async function getCustomersForAdminView(
    filters?: { [key: string]: string | undefined }
): Promise<{ customers: CustomerForAdminView[], error: string | null }> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        let query = supabase
            .from('customers')
            .select(`
                id,
                full_name,
                email,
                phone_number,
                avatar_url,
                lead_status,
                created_at,
                last_contacted_date,
                interest_level,
                address_city,
                interest_categories_json,
                assigned_showroom_id,
                showrooms (id, name),
                assigned_salesperson_id,
                salesperson:profiles (id, full_name)
            `);

        // Apply filters
        if (filters) {
            if (filters.q) {
                const searchTerm = `%${filters.q}%`;
                query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},phone_number.ilike.${searchTerm}`);
            }
            if (filters.status) {
                query = query.eq('lead_status', filters.status as any);
            }
            if (filters.interestLevel) {
                query = query.eq('interest_level', filters.interestLevel as any);
            }
            if (filters.location) {
                query = query.ilike('address_city', `%${filters.location}%`);
            }
            if (filters.interestCategory) {
                // This is a more complex query for a JSONB field.
                // For simplicity, we'll do a basic text search on the JSONB column.
                // A more robust solution might use an RPC function in Supabase.
                query = query.like('interest_categories_json::text', `%${filters.interestCategory}%`);
            }
        }
            
        const { data, error } = await query;

        if (error) {
            console.error("Error fetching customers for admin view:", error);
            return { customers: [], error: error.message };
        }
        
        const customers = data.map(c => ({
            id: c.id,
            full_name: c.full_name,
            email: c.email,
            phone_number: c.phone_number,
            avatar_url: c.avatar_url,
            lead_status: c.lead_status,
            created_at: c.created_at,
            last_contacted_date: c.last_contacted_date,
            assigned_showroom: c.showrooms ? { id: c.assigned_showroom_id!, name: c.showrooms.name } : null,
            salesperson: c.salesperson ? { id: c.assigned_salesperson_id!, full_name: c.salesperson.full_name } : null,
        }));

        return { customers: customers as CustomerForAdminView[], error: null };

    } catch (e: any) {
        console.error('Unexpected error in getCustomersForAdminView:', e);
        return { customers: [], error: "An unexpected server error occurred." };
    }
} 