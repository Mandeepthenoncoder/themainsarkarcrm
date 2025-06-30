import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    BarChart3,
    DollarSign,
    UsersRound,
    Filter as FilterIcon,
    Building,
    Download
} from 'lucide-react';
import { getAdminReportsPageData, ReportFilterData, ReportData } from './actions';


const formatCurrency = (value: number) => {
    if (isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
};

export default async function AdminReportsPage() {
    const { filters, reports, error } = await getAdminReportsPageData();

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading Reports</CardTitle>
                        <CardDescription>There was an error fetching the data for the reports page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <div className="flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reporting & Analytics</h1>
                            <p className="text-muted-foreground mt-1">Key performance indicators from across the system.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" disabled><Download className="h-4 w-4 mr-2"/> Export Page Data</Button>
                    </div>
                </div>
            </header>

            {/* Global Filters Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg"><FilterIcon className="h-5 w-5 mr-2 text-primary"/> Global Report Filters</CardTitle>
                    <CardDescription>Apply filters to refine the data shown. (Filtering functionality coming soon)</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="showroomFilterGlobal" className="block text-sm font-medium text-muted-foreground mb-1.5">Showroom</label>
                        <Select name="showroomFilterGlobal" disabled>
                            <SelectTrigger id="showroomFilterGlobal"><SelectValue placeholder="All Showrooms" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Showrooms</SelectItem>
                                {filters.showrooms.map(sr => <SelectItem key={sr.id} value={sr.id}>{sr.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="managerFilterGlobal" className="block text-sm font-medium text-muted-foreground mb-1.5">Manager</label>
                        <Select name="managerFilterGlobal" disabled>
                            <SelectTrigger id="managerFilterGlobal"><SelectValue placeholder="All Managers" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Managers</SelectItem>
                                {filters.managers.map(mgr => <SelectItem key={mgr.id} value={mgr.id}>{mgr.full_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <label htmlFor="salespersonFilterGlobal" className="block text-sm font-medium text-muted-foreground mb-1.5">Salesperson</label>
                        <Select name="salespersonFilterGlobal" disabled>
                            <SelectTrigger id="salespersonFilterGlobal"><SelectValue placeholder="All Salespeople" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Salespeople</SelectItem>
                                {filters.salespeople.map(sp => <SelectItem key={sp.id} value={sp.id}>{sp.full_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Sales & Revenue Analytics */}
            <section className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center"><DollarSign className="h-6 w-6 mr-2 text-green-600"/> Sales & Revenue Analytics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>TOTAL REVENUE</CardDescription>
                            <CardTitle className="text-3xl">{formatCurrency(reports.totalRevenue)}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">All time gross sales</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>AVG. TRANSACTION VALUE</CardDescription>
                            <CardTitle className="text-3xl">{formatCurrency(reports.avgTransactionValue)}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Across all transactions</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>TOTAL TRANSACTIONS</CardDescription>
                            <CardTitle className="text-3xl">{reports.totalTransactions}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">All time transactions</p></CardContent>
                    </Card>
                </div>
            </section>

            {/* Customer & Lead Analytics */}
            <section className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center"><UsersRound className="h-6 w-6 mr-2 text-blue-600"/> Customer & Lead Analytics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>TOTAL CUSTOMERS</CardDescription>
                            <CardTitle className="text-3xl">{reports.newCustomers}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Overall customer base</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>LEAD CONVERSION RATE</CardDescription>
                            <CardTitle className="text-3xl">{reports.leadConversionRate.toFixed(1)}%</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">New Lead to Closed Won</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>TOP SHOWROOM (REVENUE)</CardDescription>
                            <CardTitle className="text-lg">{reports.topShowroomByRevenue.name}</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">{formatCurrency(reports.topShowroomByRevenue.total)} revenue</p></CardContent>
                    </Card>
                </div>
            </section>
            
            {/* Note about future enhancements */}
             <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-sm text-blue-700">
                    This is the first version of the live reports page. Interactive charts, date filtering, and more detailed breakdowns will be added in the future.
                </p>
            </div>
        </div>
    );
} 