import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'YTD';

  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed
    const currentDate = today.getDate();

    let startDate: string;
    let endDate: string;
    let previousStartDate: string;
    let previousEndDate: string;
    let label: string;

    switch (period) {
      case 'WTD':
        // Week to Date - Monday to today
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek.toISOString();
        endDate = today.toISOString();
        
        // Previous week - same days
        const previousWeekStart = new Date(startOfWeek);
        previousWeekStart.setDate(previousWeekStart.getDate() - 7);
        const previousWeekEnd = new Date(today);
        previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);
        previousStartDate = previousWeekStart.toISOString();
        previousEndDate = previousWeekEnd.toISOString();
        label = 'WTD';
        break;

      case 'MTD':
        // Month to Date
        startDate = new Date(currentYear, currentMonth, 1).toISOString();
        endDate = today.toISOString();
        
        // Previous month - same days
        const previousMonth = new Date(today);
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        previousStartDate = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1).toISOString();
        previousEndDate = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), currentDate).toISOString();
        label = 'MTD';
        break;

      case 'YTD':
      default:
        // Year to Date
        startDate = new Date(currentYear, 0, 1).toISOString();
        endDate = today.toISOString();
        
        // Previous year - same days
        const previousYear = currentYear - 1;
        previousStartDate = new Date(previousYear, 0, 1).toISOString();
        previousEndDate = new Date(previousYear, currentMonth, currentDate).toISOString();
        label = 'YTD';
        break;
    }

    // Fetch current period converted revenue from customers
    const { data: currentCustomersData, error: currentCustomersError } = await supabase
      .from('customers')
      .select('purchase_amount, created_at')
      .is('deleted_at', null)
      .not('purchase_amount', 'is', null)
      .gt('purchase_amount', 0)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (currentCustomersError) {
      console.error('Error fetching current customers:', currentCustomersError);
      return NextResponse.json({ error: 'Failed to fetch current converted revenue data' }, { status: 500 });
    }

    // Fetch previous period converted revenue for comparison
    const { data: previousCustomersData, error: previousCustomersError } = await supabase
      .from('customers')
      .select('purchase_amount, created_at')
      .is('deleted_at', null)
      .not('purchase_amount', 'is', null)
      .gt('purchase_amount', 0)
      .gte('created_at', previousStartDate)
      .lte('created_at', previousEndDate);

    if (previousCustomersError) {
      console.error('Error fetching previous customers:', previousCustomersError);
      return NextResponse.json({ error: 'Failed to fetch previous converted revenue data' }, { status: 500 });
    }

    // Calculate totals from purchase amounts
    const currentTotal = currentCustomersData?.reduce((sum, customer) => sum + (customer.purchase_amount || 0), 0) || 0;
    const previousTotal = previousCustomersData?.reduce((sum, customer) => sum + (customer.purchase_amount || 0), 0) || 0;

    // Calculate percentage change
    let percentageChange = 0;
    if (previousTotal > 0) {
      percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
    } else if (currentTotal > 0) {
      percentageChange = 100; // 100% increase from 0
    }

    return NextResponse.json({
      period: label,
      currentTotal,
      previousTotal,
      percentageChange: parseFloat(percentageChange.toFixed(1)),
      formattedCurrent: `₹${currentTotal.toLocaleString('en-IN')}`,
      formattedPrevious: `₹${previousTotal.toLocaleString('en-IN')}`,
    });

  } catch (error) {
    console.error('Unexpected error in gross-sales API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 