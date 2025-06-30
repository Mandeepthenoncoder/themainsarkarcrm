import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use public client to see what RLS allows
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Try different query approaches
    
    // 1. Check all profiles with select *
    const { data: allProfilesStar, error: allErrorStar } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    // 2. Check all profiles with specific columns
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, assigned_showroom_id')
      .limit(10)
    
    // 3. Check specifically for salespeople
    const { data: salespeople, error: salesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, assigned_showroom_id')
      .eq('role', 'salesperson')
      .limit(20)
    
    // 4. Check all distinct roles
    const { data: distinctRoles, error: rolesError } = await supabase
      .from('profiles')
      .select('role')
      .neq('role', null)
    
    // 5. Check showrooms
    const { data: showrooms, error: showroomsError } = await supabase
      .from('showrooms')
      .select('id, name')
      .limit(10)
    
    return NextResponse.json({
      success: true,
      debug: {
        allProfilesStar: {
          count: allProfilesStar?.length || 0,
          data: allProfilesStar,
          error: allErrorStar
        },
        allProfiles: {
          count: allProfiles?.length || 0,
          data: allProfiles,
          error: allError
        },
        salespeople: {
          count: salespeople?.length || 0,
          data: salespeople,
          error: salesError
        },
        distinctRoles: {
          count: distinctRoles?.length || 0,
          data: distinctRoles,
          error: rolesError
        },
        showrooms: {
          count: showrooms?.length || 0,
          data: showrooms,
          error: showroomsError
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 