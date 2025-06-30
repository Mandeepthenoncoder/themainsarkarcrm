// "use client"; // Converted to Server Component

import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'; // Added for server-side Supabase
import { cookies } from 'next/headers'; // Added for server-side Supabase
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Tables, type Enums } from '../../../lib/database.types'; // Added import for DB types
import {
    LayoutDashboard,
    Store,
    Users,
    BarChart3,
    Settings2,
    Building,
    UsersRound,
    DollarSign,
    AlertCircle,
    ArrowUpRight,
    UserPlus,
    CalendarClock,
    Send,
    Activity,
    Filter
} from 'lucide-react';
import { parsePriceRange } from '@/lib/utils'; // Added for pipeline value calculation
import { Badge } from "@/components/ui/badge";

// Define interfaces for fetched data
interface DashboardKPIs {
    totalShowrooms: number;
    totalManagers: number;
    totalSalespeople: number;
    totalGrossSales: string; // Or number, formatting can be done in JSX
    salesYtdPercentageChange: number; // Added for YTD sales % change
    totalNewCustomersMTD: number; // Renamed for clarity
    totalActivePipelineValue: string;
    countOpenOpportunities: number;
    totalConvertedRevenue: string; // New: converted revenue from purchase amounts
    convertedCustomersCount: number; // New: number of customers who made purchases
    conversionRate: string; // New: conversion rate percentage
}

interface WalkoutReason {
    reason: string;
    count: number;
}

interface CategoryConversion {
    category: string;
    conversionRate: number;
    seen: number;
    bought: number;
}

interface SalespersonPerformance {
    id: string;
    name: string;
    salesCount: number;
}

interface AlertItem {
    id: string;
    message: string;
    type: 'warning' | 'info' | 'error';
    link?: string;
}

interface TopShowroom {
    id: string;
    name: string;
    managerName?: string; // Assuming manager name will be fetched
    sales: string; // Or number
    leads: number;
}

interface RecentManager {
    id: string;
    name: string;
    showroomName?: string; // Assuming showroom name will be fetched
    dateAdded: string;
}

interface CustomerWithInterest extends Partial<Tables<'customers'>> {
  interest_categories_json?: { products: { price_range: string }[] }[] | null;
}

interface LeadSourceBreakdown {
    source: string;
    count: number;
}

interface AdminDashboardData {
    kpis: DashboardKPIs;
    alerts: AlertItem[];
    topShowrooms: TopShowroom[];
    recentManagers: RecentManager[];
    topWalkoutReasons: WalkoutReason[];
    lowestCategoryConversion: CategoryConversion[];
    bottomSalespersonPerformance: SalespersonPerformance[];
    leadSourceBreakdown: LeadSourceBreakdown[];
}

// Placeholder data - will be replaced by fetched data
// const adminDashboardData = { ... }; // Remove old placeholder

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateString; // Return original on error
    }
};

async function getAdminDashboardData(): Promise<AdminDashboardData> {
    const supabase = createServerComponentClient({ cookies });

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed
    const currentDate = today.getDate();

    // Dates for YTD calculations
    const currentYearStartDate = new Date(currentYear, 0, 1).toISOString(); // Jan 1st of current year
    // today.toISOString() will be up to the current moment for YTD

    const previousYear = currentYear - 1;
    const previousYearStartDate = new Date(previousYear, 0, 1).toISOString(); // Jan 1st of previous year
    const previousYearEndDateComparable = new Date(previousYear, currentMonth, currentDate).toISOString(); // Same date last year

    // Dates for MTD calculations (for New Customers MTD and for sales % change)
    const currentMonthStartDate = new Date(currentYear, currentMonth, 1).toISOString();
    const previousMonthDate = new Date(today); // new Date to avoid modifying `today`
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    const previousMonthStartDate = new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth(), 1).toISOString();
    const previousMonthEndDate = new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth() + 1, 0, 23, 59, 59, 999).toISOString(); // End of previous month

    const openLeadStatuses: Enums<'lead_status_enum'>[] = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation'];

    // --- Fetch ALL required customer and profile data in one go ---
    const { data: allCustomers, error: customersError } = await supabase
        .from('customers')
        .select(`
            lead_status,
            interest_categories_json,
            assigned_salesperson_id,
            created_at,
            lead_source,
            purchase_amount,
            profiles (id, full_name)
        `);

    const { data: allSalespeople, error: salespeopleListError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'salesperson');

    // --- KPIs and Existing Logic (adapted to use allCustomers data) ---

    // --- Fetch KPIs ---
    const { count: totalShowroomsCount, error: showroomsError } = await supabase
        .from('showrooms')
        .select('* ', { count: 'exact', head: true });

    const { count: totalManagersCount, error: managersError } = await supabase
        .from('profiles')
        .select('* ', { count: 'exact', head: true })
        .eq('role', 'manager');

    const { count: totalSalespeopleCount, error: salespeopleError } = await supabase
        .from('profiles')
        .select('* ', { count: 'exact', head: true })
        .eq('role', 'salesperson');

    // Gross Sales for Current YTD
    const { data: currentYtdSalesData, error: currentYtdSalesError } = await supabase
        .from('sales_transactions')
        .select('total_amount')
        .gte('transaction_date', currentYearStartDate)
        .lte('transaction_date', today.toISOString()); // Up to now
    const totalGrossSalesYTD = currentYtdSalesData?.reduce((sum, transaction) => sum + transaction.total_amount, 0) || 0;

    // Gross Sales for Previous YTD (for comparison)
    const { data: previousYtdSalesData, error: previousYtdSalesError } = await supabase
        .from('sales_transactions')
        .select('total_amount')
        .gte('transaction_date', previousYearStartDate)
        .lte('transaction_date', previousYearEndDateComparable);
    const totalGrossSalesPreviousYTD = previousYtdSalesData?.reduce((sum, transaction) => sum + transaction.total_amount, 0) || 0;
    
    let salesYtdPercentageChange = 0;
    if (totalGrossSalesPreviousYTD > 0) {
        salesYtdPercentageChange = ((totalGrossSalesYTD - totalGrossSalesPreviousYTD) / totalGrossSalesPreviousYTD) * 100;
    } else if (totalGrossSalesYTD > 0) {
        salesYtdPercentageChange = 100; // If previous was 0 and current is >0, it's effectively a 100% increase from 0 base
    }

    // Fetch totalNewCustomers (MTD)
    const { count: totalNewCustomersMTD, error: newCustomersError } = await supabase
        .from('customers')
        .select('* ', { count: 'exact', head: true })
        .gte('created_at', currentMonthStartDate)
        .lte('created_at', today.toISOString()); // Up to now for MTD new customers

    // --- Fetch Pipeline Data ---
    const openOpportunitiesData = allCustomers?.filter(c => openLeadStatuses.includes(c.lead_status as any)) || [];

    let totalActivePipelineValue = 0;
    let countOpenOpportunities = 0;

    if (openOpportunitiesData) {
        countOpenOpportunities = openOpportunitiesData.length;
        openOpportunitiesData.forEach(opp => {
            if (opp.interest_categories_json) {
                opp.interest_categories_json.forEach((category: any) => {
                    if (category.products && Array.isArray(category.products)) {
                        category.products.forEach((product: any) => {
                            totalActivePipelineValue += parsePriceRange(product.price_range);
                        });
                    }
                });
            }
        });
    }

    // --- Calculate Converted Revenue Metrics ---
    let totalConvertedRevenue = 0;
    let convertedCustomersCount = 0;
    
    if (allCustomers) {
        allCustomers.forEach(customer => {
            if (customer.purchase_amount && customer.purchase_amount > 0) {
                totalConvertedRevenue += customer.purchase_amount;
                convertedCustomersCount++;
            }
        });
    }

    const conversionRate = allCustomers?.length 
        ? ((convertedCustomersCount / allCustomers.length) * 100).toFixed(1) 
        : '0.0';
    if (customersError) console.error("Error fetching customers:", customersError.message);
    if (salespeopleListError) console.error("Error fetching salespeople:", salespeopleListError.message);

    // --- New Analytics Calculations ---
    let topWalkoutReasons: WalkoutReason[] = [];
    let lowestCategoryConversion: CategoryConversion[] = [];
    let bottomSalespersonPerformance: SalespersonPerformance[] = [];
    let leadSourceBreakdown: LeadSourceBreakdown[] = [];

    if (allCustomers && allSalespeople) {
        // 1. Top 3 reasons for walk out
        const walkoutReasonCounts: Record<string, number> = {
            'Wants More Discount': 0,
            'Checking Other Jewellers': 0,
            'Felt Less Variety': 0,
            'Other Reasons': 0,
        };
        
        const walkoutCustomers = allCustomers.filter(c => c.lead_status !== 'Closed Won');

        walkoutCustomers.forEach(customer => {
            if (customer.interest_categories_json) {
                customer.interest_categories_json.forEach((interest: any) => {
                    if (interest.customer_preferences) {
                        if (interest.customer_preferences.wants_more_discount) walkoutReasonCounts['Wants More Discount']++;
                        if (interest.customer_preferences.checking_other_jewellers) walkoutReasonCounts['Checking Other Jewellers']++;
                        if (interest.customer_preferences.felt_less_variety) walkoutReasonCounts['Felt Less Variety']++;
                        if (interest.customer_preferences.others) walkoutReasonCounts['Other Reasons']++;
                    }
                });
            }
        });

        topWalkoutReasons = Object.entries(walkoutReasonCounts)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        // 2. Top 5 category has the lowest conversion
        const categoryStats: Record<string, { seen: number; bought: number }> = {};

        allCustomers.forEach(customer => {
            if (customer.interest_categories_json) {
                const isSale = customer.lead_status === 'Closed Won';
                const categoriesInVisit = new Set<string>();

                customer.interest_categories_json.forEach((interest: any) => {
                    if (interest.category_type) {
                        categoriesInVisit.add(interest.category_type);
                    }
                });

                categoriesInVisit.forEach(category => {
                    if (!categoryStats[category]) {
                        categoryStats[category] = { seen: 0, bought: 0 };
                    }
                    categoryStats[category].seen++;
                    if (isSale) {
                        categoryStats[category].bought++;
                    }
                });
            }
        });

        lowestCategoryConversion = Object.entries(categoryStats)
            .map(([category, stats]) => ({
                category,
                conversionRate: stats.seen > 0 ? (stats.bought / stats.seen) * 100 : 0,
                ...stats,
            }))
            .sort((a, b) => a.conversionRate - b.conversionRate)
            .slice(0, 5);

        // 3. Bottom 5 salesperson performance
        const salespersonSales: Record<string, { name: string, salesCount: number }> = {};

        allSalespeople.forEach(sp => {
            salespersonSales[sp.id] = { name: sp.full_name || 'Unnamed', salesCount: 0 };
        });

        const soldCustomers = allCustomers.filter(c => c.lead_status === 'Closed Won');
        soldCustomers.forEach(customer => {
            if (customer.assigned_salesperson_id && salespersonSales[customer.assigned_salesperson_id]) {
                salespersonSales[customer.assigned_salesperson_id].salesCount++;
            }
        });
        
        bottomSalespersonPerformance = Object.entries(salespersonSales)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => a.salesCount - b.salesCount)
            .slice(0, 5);

        // 4. Lead Source Breakdown
        const leadSourceCounts: Record<string, number> = {};
        allCustomers.forEach(customer => {
            const source = customer.lead_source || 'Unknown';
            leadSourceCounts[source] = (leadSourceCounts[source] || 0) + 1;
        });

        leadSourceBreakdown = Object.entries(leadSourceCounts)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count);
    }

    // --- Fetch Alerts ---
    const { data: pendingManagers, error: pendingManagersError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'manager')
        .eq('status', 'pending_approval')
        .limit(5);

    const alerts: AlertItem[] = [];
    if (pendingManagers) {
        pendingManagers.forEach(pm => {
            alerts.push({
                id: `pending-mgr-${pm.id}`,
                message: `New manager registration pending approval: ${pm.full_name || 'N/A'}.`,
                type: 'warning',
                link: `/admin/managers?status=pending_approval`
            });
        });
    }
    // TODO: Add other alert types (e.g., showroom performance)

    // --- Fetch Top Showrooms (YTD) ---
    const { data: showrooms, error: topShowroomsError } = await supabase
        .from('showrooms')
        .select(`
            id,
            name,
            profiles!showrooms_manager_id_fkey ( full_name ),
            sales_transactions ( total_amount, transaction_date ),
            customers ( id, created_at )
        `)
        // Removed .gte and .lte from here as it will be filtered in JS map below for YTD period
        ;

    let topShowroomsData: TopShowroom[] = [];
    if (showrooms) {
        topShowroomsData = showrooms.map(sr => {
            const ytdSales = sr.sales_transactions.reduce((sum: number, st: any) => {
                const transactionDate = new Date(st.transaction_date);
                // Ensure transaction is within the current YTD period
                if (transactionDate.getFullYear() === currentYear && transactionDate.toISOString() >= currentYearStartDate && transactionDate.toISOString() <= today.toISOString()) {
                    return sum + st.total_amount;
                }
                return sum;
            }, 0);

            const ytdLeads = sr.customers.reduce((count: number, cust: any) => {
                 const customerDate = new Date(cust.created_at);
                 // Ensure customer was created within the current YTD period
                 if (customerDate.getFullYear() === currentYear && customerDate.toISOString() >= currentYearStartDate && customerDate.toISOString() <= today.toISOString()) {
                    return count + 1;
                 }
                 return count;
            }, 0);

            return {
                id: sr.id,
                name: sr.name,
                // @ts-ignore - Supabase type for manager might need explicit casting or selection adjustment
                managerName: sr.profiles?.full_name || 'N/A',
                sales: `₹${ytdSales.toLocaleString('en-IN')}`,
                leads: ytdLeads,
            };
        })
        .sort((a, b) => parseFloat(b.sales.replace(/[^\d.-]/g, '')) - parseFloat(a.sales.replace(/[^\d.-]/g, ''))) // Sort by sales numerically
        .slice(0, 5); // Get top 5
    }

    // --- Fetch Recent Managers ---
    const { data: recentManagersData, error: recentManagersError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at, assigned_showroom_id')
        .eq('role', 'manager')
        .order('created_at', { ascending: false })
        .limit(3);

    const recentManagers: RecentManager[] = recentManagersData?.map(m => ({
        id: m.id,
        name: m.full_name || 'N/A',
        showroomName: m.assigned_showroom_id ? `ID: ${m.assigned_showroom_id.substring(0, 8)}...` : 'Not Assigned',
        dateAdded: m.created_at
    })) || [];

    if (showroomsError) console.error("Error fetching showrooms count:", showroomsError.message);
    if (managersError) console.error("Error fetching managers count:", managersError.message);
    if (salespeopleError) console.error("Error fetching salespeople count:", salespeopleError.message);
    if (currentYtdSalesError) console.error("Error fetching current YTD gross sales:", currentYtdSalesError.message);
    if (previousYtdSalesError) console.error("Error fetching previous YTD gross sales:", previousYtdSalesError.message);
    if (newCustomersError) console.error("Error fetching new customers count:", newCustomersError.message);
    if (pendingManagersError) console.error("Error fetching pending managers:", pendingManagersError.message);
    if (topShowroomsError) console.error("Error fetching top showrooms data:", topShowroomsError.message);
    if (recentManagersError) console.error("Error fetching recent managers:", recentManagersError.message);

    return {
        kpis: {
            totalShowrooms: totalShowroomsCount || 0,
            totalManagers: totalManagersCount || 0,
            totalSalespeople: totalSalespeopleCount || 0,
            totalGrossSales: `₹${totalGrossSalesYTD.toLocaleString('en-IN')}`,
            salesYtdPercentageChange: parseFloat(salesYtdPercentageChange.toFixed(1)), // Keep one decimal place
            totalNewCustomersMTD: allCustomers?.filter(c => new Date(c.created_at!) >= new Date(currentMonthStartDate)).length || 0,
            totalActivePipelineValue: `₹${totalActivePipelineValue.toLocaleString('en-IN')}`,
            countOpenOpportunities: countOpenOpportunities,
            totalConvertedRevenue: `₹${totalConvertedRevenue.toLocaleString('en-IN')}`,
            convertedCustomersCount: convertedCustomersCount,
            conversionRate: conversionRate,
        },
        alerts,
        topShowrooms: topShowroomsData,
        recentManagers,
        topWalkoutReasons,
        lowestCategoryConversion,
        bottomSalespersonPerformance,
        leadSourceBreakdown,
    };
}

export default async function AdminDashboardPage() {
    const adminDashboardData = await getAdminDashboardData();

    return (
        <div className="space-y-6 lg:space-y-8">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Admin Dashboard</h1>
                            <p className="text-muted-foreground mt-1">Global overview of your CRM operations.</p>
                        </div>
                    </div>
                    {/* <Button variant="outline">View Full Report</Button> */} 
                </div>
            </header>

            {/* KPI Cards Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                {/* Featured Converted Revenue Card */}
                <Card className="xl:col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">💰 Total Converted Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">{adminDashboardData.kpis.totalConvertedRevenue}</div>
                        <p className="text-xs text-green-600">{adminDashboardData.kpis.convertedCustomersCount} customers • {adminDashboardData.kpis.conversionRate}% conversion rate</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Showrooms</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminDashboardData.kpis.totalShowrooms}</div>
                        <p className="text-xs text-muted-foreground">Managed locations</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminDashboardData.kpis.totalManagers}</div>
                        <p className="text-xs text-muted-foreground">Overseeing operations</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Salespeople</CardTitle>
                        <UsersRound className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminDashboardData.kpis.totalSalespeople}</div>
                        <p className="text-xs text-muted-foreground">Across all showrooms</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gross Sales (YTD)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminDashboardData.kpis.totalGrossSales}</div>
                        <p className={`text-xs ${adminDashboardData.kpis.salesYtdPercentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {adminDashboardData.kpis.salesYtdPercentageChange >= 0 ? '+' : ''}{adminDashboardData.kpis.salesYtdPercentageChange}%
                            {adminDashboardData.kpis.salesYtdPercentageChange !== 0 ? ' from previous YTD' : ' (vs previous YTD)'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers (MTD)</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{adminDashboardData.kpis.totalNewCustomersMTD}</div>
                        <p className="text-xs text-muted-foreground">Added this month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Pipeline Value</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminDashboardData.kpis.totalActivePipelineValue}</div>
                        <p className="text-xs text-muted-foreground">Sum of open opportunities</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminDashboardData.kpis.countOpenOpportunities}</div>
                        <p className="text-xs text-muted-foreground">Currently active leads</p>
                    </CardContent>
                </Card>
            </section>

            {/* Quick Access Buttons Section */}
            <section className="bg-card shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Quick Access</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Link href="/admin/showrooms" passHref>
                        <Button variant="outline" className="w-full justify-start text-left py-6 hover:bg-muted/80 h-full">
                            <Store className="h-5 w-5 mr-3 text-primary shrink-0" />
                            <div>
                                <span className="font-semibold">Manage Showrooms</span>
                                <p className="text-xs text-muted-foreground">View, add, or edit locations</p>
                            </div>
                        </Button>
                    </Link>
                    <Link href="/admin/managers" passHref>
                        <Button variant="outline" className="w-full justify-start text-left py-6 hover:bg-muted/80 h-full">
                            <Users className="h-5 w-5 mr-3 text-primary shrink-0" />
                             <div>
                                <span className="font-semibold">Manage Managers</span>
                                <p className="text-xs text-muted-foreground">Oversee manager accounts</p>
                            </div>
                        </Button>
                    </Link>
                     <Link href="/admin/customers" passHref>
                        <Button variant="outline" className="w-full justify-start text-left py-6 hover:bg-muted/80 h-full">
                            <UsersRound className="h-5 w-5 mr-3 text-primary shrink-0" />
                            <div>
                                <span className="font-semibold">All Customers</span>
                                <p className="text-xs text-muted-foreground">View customer database</p>
                            </div>
                        </Button>
                    </Link>
                    <Link href="/admin/appointments" passHref>
                        <Button variant="outline" className="w-full justify-start text-left py-6 hover:bg-muted/80 h-full">
                            <CalendarClock className="h-5 w-5 mr-3 text-primary shrink-0" />
                            <div>
                                <span className="font-semibold">All Appointments</span>
                                <p className="text-xs text-muted-foreground">Manage all schedules</p>
                            </div>
                        </Button>
                    </Link>
                    <Link href="/admin/reports" passHref>
                        <Button variant="outline" className="w-full justify-start text-left py-6 hover:bg-muted/80 h-full">
                            <BarChart3 className="h-5 w-5 mr-3 text-primary shrink-0" />
                            <div>
                                <span className="font-semibold">Global Analytics</span>
                                <p className="text-xs text-muted-foreground">View company-wide reports</p>
                            </div>
                        </Button>
                    </Link>
                    <Link href="/admin/communication" passHref>
                        <Button variant="outline" className="w-full justify-start text-left py-6 hover:bg-muted/80 h-full">
                            <Send className="h-5 w-5 mr-3 text-primary shrink-0" />
                            <div>
                                <span className="font-semibold">Communications</span>
                                <p className="text-xs text-muted-foreground">Send system announcements</p>
                            </div>
                        </Button>
                    </Link>
                    <Link href="/admin/settings" passHref>
                        <Button variant="outline" className="w-full justify-start text-left py-6 hover:bg-muted/80 h-full md:col-start-3">
                            <Settings2 className="h-5 w-5 mr-3 text-primary shrink-0" />
                            <div>
                                <span className="font-semibold">System Settings</span>
                                <p className="text-xs text-muted-foreground">Configure CRM parameters</p>
                            </div>
                        </Button>
                    </Link>
                </div>
            </section>
            
            {/* Alerts Section */}
            {adminDashboardData.alerts.length > 0 && (
                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center"><AlertCircle className="h-5 w-5 mr-2 text-destructive" /> Important Alerts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {adminDashboardData.alerts.map(alert => (
                                <div key={alert.id} 
                                     className={`p-3 rounded-md text-sm flex justify-between items-center 
                                                ${alert.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-700' : 
                                                  alert.type === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-700' : 
                                                  'bg-blue-500/10 border border-blue-500/30 text-blue-700'}`}>
                                    <span>{alert.message}</span>
                                    {alert.link && 
                                        <Link href={alert.link} passHref>
                                            <Button variant="ghost" size="sm" className="text-xs hover:underline">
                                                View Details <ArrowUpRight className="h-3 w-3 ml-1"/>
                                            </Button>
                                        </Link>
                                    }
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* New Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Reasons for Walk-out</CardTitle>
                        <CardDescription>Most common reasons why non-converted customers walked out.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {adminDashboardData.topWalkoutReasons.map((item, index) => (
                                <li key={index} className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{item.reason}</span>
                                    <Badge variant="secondary">{item.count} customers</Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Lowest Conversion Categories</CardTitle>
                        <CardDescription>Top 5 categories most seen but least purchased.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ul className="space-y-3">
                            {adminDashboardData.lowestCategoryConversion.map((item, index) => (
                                <li key={index}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">{item.category}</span>
                                        <Badge variant="destructive">{item.conversionRate.toFixed(1)}%</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.bought} bought out of {item.seen} interests</p>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Bottom Sales Performers</CardTitle>
                        <CardDescription>Salespeople with the fewest "Closed Won" deals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {adminDashboardData.bottomSalespersonPerformance.map((item, index) => (
                                <li key={index} className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{item.name}</span>
                                    <Badge variant="outline">{item.salesCount} sales</Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Tables/Lists Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Top Performing Showrooms (YTD)</CardTitle>
                            <CardDescription>Based on gross sales figures.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Showroom Name</TableHead>
                                            <TableHead>Manager</TableHead>
                                            <TableHead className="text-right">Sales</TableHead>
                                            <TableHead className="text-right">New Leads</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {adminDashboardData.topShowrooms.map(sr => (
                                            <TableRow key={sr.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">{sr.name}</TableCell>
                                                <TableCell>{sr.managerName || 'N/A'}</TableCell>
                                                <TableCell className="text-right">{sr.sales}</TableCell>
                                                <TableCell className="text-right">{sr.leads}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                         <CardFooter className="pt-4 border-t">
                            <Link href="/admin/showrooms?sort=performance" className="w-full">
                                <Button variant="outline" size="sm" className="w-full">
                                    View All Showroom Performance
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </section>

                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Recently Added Managers</CardTitle>
                            <CardDescription>New managers onboarded to the system.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {adminDashboardData.recentManagers.length > 0 ? adminDashboardData.recentManagers.map(mgr => (
                                <div key={mgr.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{mgr.name}</p>
                                        <p className="text-xs text-muted-foreground">Assigned to: {mgr.showroomName || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Added: {formatDate(mgr.dateAdded)}</p>
                                        <Link href={`/admin/managers/${mgr.id}`} className="text-xs text-primary hover:underline">
                                            View Profile
                                        </Link>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No managers recently added.</p>
                            )}
                        </CardContent>
                        <CardFooter className="pt-4 border-t">
                            <Link href="/admin/managers?sort=recent" className="w-full">
                                <Button variant="outline" size="sm" className="w-full">
                                    View All Managers
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle>Lead Source Breakdown</CardTitle>
                        <CardDescription>Where your customers are coming from.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {adminDashboardData.leadSourceBreakdown.map((item, index) => (
                                <li key={index} className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{item.source}</span>
                                    <Badge variant="default">{item.count} customers</Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 