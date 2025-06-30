import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // For lead status
import { PlusCircle } from 'lucide-react';

// Updated Customer interface
interface Customer {
  id: string;
  full_name: string | null; // Changed from first_name, last_name
  email: string | null;
  phone_number: string | null;
  lead_status: 'New Lead' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost' | 'On Hold' | 'Future Opportunity' | null;
}

// This function now expects actual enum values like 'New Lead'
const getLeadStatusVariant = (status: Customer['lead_status']): "default" | "secondary" | "destructive" | "outline" => {
  if (!status) return 'secondary';
  return 'outline'; 
};

// This function now expects actual enum values like 'New Lead'
const getStatusBadgeClass = (status: Customer['lead_status']) => {
  if (status === null) { // Handle null case explicitly first
    return 'bg-slate-100 text-slate-700 border-slate-300';
  }
  switch (status) {
    case 'New Lead': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'Contacted': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
    case 'Qualified': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'Proposal Sent': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    case 'Negotiation': return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'Closed Won': return 'bg-green-100 text-green-700 border-green-300';
    case 'Closed Lost': return 'bg-red-100 text-red-700 border-red-300';
    case 'On Hold': return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'Future Opportunity': return 'bg-teal-100 text-teal-700 border-teal-300';
    default:
      // This will now only run if status is a non-null value not covered above,
      // helping catch if the enum type expands and we miss a case.
      const exhaustiveCheck: never = status;
      return 'bg-slate-100 text-slate-700 border-slate-300'; 
  }
};


export default async function MyCustomersPage() {
  const supabase = createServerComponentClient({ cookies });
  let customers: Customer[] = [];
  let fetchError: string | null = null;

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    // This page should be protected by ProtectedRoute, but good to have a fallback
    fetchError = "User not authenticated. Please log in.";
  } else {
    // Updated select query to fetch full_name
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, email, phone_number, lead_status')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching customers (raw):", JSON.stringify(error, null, 2)); // Log the full error object
      fetchError = `Failed to load customers: ${error.message || 'Unknown error, check server logs for details.'}`;
      customers = [];
    } else {
      customers = data || [];
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Customer Database</h1>
            <p className="text-muted-foreground mt-1">View and manage your assigned customers.</p>
          </div>
          <Button asChild>
            <Link href="/salesperson/customers/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
            </Link>
          </Button>
        </div>
      </header>

      {/* Search and Filter Section - Placeholder for now */}
      {/* 
      <section className="bg-card shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Filter Customers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <input type="text" placeholder="Search by name, email, phone..." className="col-span-1 md:col-span-2 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary sm:text-sm" />
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-foreground mb-1">Lead Status</label>
            <select id="statusFilter" name="statusFilter" className="block w-full px-3 py-2 border border-border bg-card rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary sm:text-sm">
              <option>All</option>
              <option>NEW</option>
              <option>CONTACTED</option>
            </select>
          </div>
          <Button variant="outline">Search / Filter</Button>
        </div>
      </section>
      */}

      <section className="bg-card shadow-sm rounded-lg">
         <h2 className="text-xl font-semibold text-foreground mb-4 px-6 pt-6">Customer List</h2>
        {fetchError && (
          <div className="p-6">
            <p className="text-destructive">{fetchError}</p>
          </div>
        )}
        {!fetchError && (
          <Table>
            <TableCaption>{customers.length === 0 ? "No customers found. Start by adding a new customer!" : "A list of your customers."}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Lead Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.full_name || "N/A"}</TableCell>
                  <TableCell>{customer.email || "N/A"}</TableCell>
                  <TableCell>{customer.phone_number || "N/A"}</TableCell>
                  <TableCell>
                    {customer.lead_status ? (
                       <Badge variant={getLeadStatusVariant(customer.lead_status)} className={`${getStatusBadgeClass(customer.lead_status)}`}>
                        {customer.lead_status}
                      </Badge>
                    ) : <Badge variant="secondary">Unknown</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/salesperson/customers/${customer.id}`}>View Details</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
} 