import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePickerWithRange } from "@/components/ui/date-picker-range"; // Assuming we'll create this
import { AlertTriangle, LineChart, BarChart2, PieChart, Download, Filter, DollarSign, Users, ShoppingBag, Percent, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getManagerDashboardKpisAction, ManagerKpiData } from './actions'; // Assuming actions.ts is in the same directory
import { Badge } from "@/components/ui/badge";

// Placeholder data - in a real app, this would come from state/props after fetching
const kpiData = {
  totalRevenue: "₹5,67,890",
  avgDealSize: "₹42,500",
  conversionRate: "18.5%",
  newCustomers: "23",
  salesBySalesperson: [
    { name: "Aisha Sharma", sales: "₹1,80,000" },
    { name: "Rohan Verma", sales: "₹1,55,000" },
    { name: "Priya Mehta", sales: "₹1,20,000" },
    { name: "Karan Singh", sales: "₹1,12,890" },
  ],
  salesByCategory: [
    { name: "Diamond Rings", sales: "₹2,50,000" },
    { name: "Gold Necklaces", sales: "₹1,50,000" },
    { name: "Platinum Bracelets", sales: "₹95,000" },
    { name: "Other", sales: "₹72,890" },
  ]
};

// Helper to render KPI cards
const KpiCard = ({
  title,
  value,
  trend,
  icon: Icon,
  metricNote
}: {
  title: string;
  value: string;
  trend?: string;
  icon: React.ElementType;
  metricNote?: string;
}) => {
  const isPositive = trend && parseFloat(trend) > 0;
  const isNegative = trend && parseFloat(trend) < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500';

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trendColor} flex items-center mt-1`}>
            <TrendIcon className="h-4 w-4 mr-1" />
            {trend} vs last period
          </p>
        )}
      </CardContent>
      {metricNote && 
        <CardFooter className="text-xs text-muted-foreground pt-0">
            <p>{metricNote}</p>
        </CardFooter>
      }
    </Card>
  );
};

export default async function ManagerAnalyticsPage() {
  const result = await getManagerDashboardKpisAction();

  let kpis: ManagerKpiData | null = null;
  let errorMessage: string | null = null;

  if (result.success) {
    kpis = result.kpis;
  } else {
    errorMessage = result.error;
  }

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex items-center gap-3">
          <LineChart className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Team Performance Analytics</h1>
            <p className="text-muted-foreground mt-1">Key insights into your team's activities and results.</p>
          </div>
        </div>
      </header>

      {errorMessage && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Could not load analytics data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{errorMessage}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please try again later. If the issue persists, contact support.
            </p>
          </CardContent>
        </Card>
      )}

      {kpis && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard 
            title="Total Revenue (Est.)"
            value={kpis.totalRevenue.value}
            trend={kpis.totalRevenue.trend}
            icon={DollarSign}
            metricNote="Based on completed deals this period."
          />
          <KpiCard 
            title="Avg. Deal Size (Est.)"
            value={kpis.avgDealSize.value}
            trend={kpis.avgDealSize.trend}
            icon={ShoppingBag} 
            metricNote="Average value of closed deals."
            />
          <KpiCard 
            title="Conversion Rate (Est.)"
            value={kpis.conversionRate.value}
            trend={kpis.conversionRate.trend}
            icon={Percent} 
            metricNote="Appointments to closed deals."
            />
          <KpiCard 
            title="New Customers (This Month)"
            value={kpis.newCustomersThisMonth.value}
            trend={kpis.newCustomersThisMonth.trend}
            icon={Users} 
            metricNote="Count of newly acquired customers."
            />
        </div>
      )}
      
      <Card className="mt-6">
        <CardHeader>
            <CardTitle>Data & Reporting Notice</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                The Key Performance Indicators (KPIs) displayed above are currently based on placeholder data and illustrative examples.
                To show real-time analytics reflecting your actual team performance, the following steps are needed:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-3 space-y-1">
                <li>Definition of specific metrics and calculation logic (e.g., how revenue is tracked, what constitutes a 'conversion').</li>
                <li>Implementation of database queries to fetch and aggregate the required data from your sales, appointments, and customer tables.</li>
                <li>Potential creation of new tables or fields if the necessary data isn't currently being stored (e.g., a 'deals' or 'sales_orders' table).</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
                Please provide details on the exact analytics you need, and I can proceed with implementing the data fetching and calculations.
                Future enhancements can include interactive charts and detailed report generation.
            </p>
        </CardContent>
      </Card>

    </div>
  );
} 