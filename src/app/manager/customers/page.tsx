import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit3, Layers, Users, AlertTriangle, Search } from 'lucide-react';
import { getManagedCustomersAction, ManagedCustomer } from './actions'; // Import the action and type
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For salesperson avatar
import { Badge } from '@/components/ui/badge'; // For status
import { format, parseISO, isValid } from 'date-fns'; // For date formatting
import {
  Card, 
  CardContent, 
  CardDescription,  // Added back just in case, though not used in current error block
  CardHeader, 
  CardTitle
} from "@/components/ui/card"; // Re-added Card component imports

// Placeholder for salespeople in the showroom - for filtering - WILL BE REPLACED/UPDATED
// const showroomSalespeople = [
//   { id: 'sp1', name: 'Aisha Sharma' },
//   { id: 'sp2', name: 'Rohan Verma' },
//   { id: 'sp3', name: 'Priya Mehta' },
//   { id: 'sp4', name: 'Karan Singh' },
// ];

const getInitials = (name: string | null | undefined) => { // Allow undefined
  if (!name) return 'N/A';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const formatDateSafe = (dateString: string | null | undefined, includeTime = false) => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid Date';
    return format(date, includeTime ? 'MMM dd, yyyy HH:mm' : 'MMM dd, yyyy');
  } catch (e) {
    return dateString; // return original if error
  }
};


const getStatusColor = (status: string | null | undefined): string => {
  if (!status) return 'bg-muted text-muted-foreground';
  // Ensure consistent casing for status comparison if necessary
  switch (status.toLowerCase()) {
    case 'hot': return 'bg-red-500/10 text-red-600 border border-red-500/30';
    case 'warm': return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30';
    case 'cold': return 'bg-sky-500/10 text-sky-600 border border-sky-500/30';
    case 'new': return 'bg-green-500/10 text-green-600 border border-green-500/30';
    case 'converted': return 'bg-purple-500/10 text-purple-600 border border-purple-500/30';
    case 'lost': return 'bg-slate-500/10 text-slate-600 border border-slate-500/30';
    default: return 'bg-muted text-muted-foreground border border-border';
  }
};


export default async function ManagedCustomersPage() { // Renamed and made async
  // Fetch actual data
  const { customers, error, success } = await getManagedCustomersAction();

  // TODO: Add state for filters if they need to be interactive
  // const [salespersonFilter, setSalespersonFilter] = useState('all');
  // const [statusFilter, setStatusFilter] = useState('all');

  if (!success) {
    return (
      <div className="space-y-6">
        <header className="bg-card shadow-sm rounded-lg p-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center"><Users className="w-8 h-8 mr-3 text-primary"/>Customer Oversight</h1>
              <p className="text-muted-foreground mt-1">View customers managed by your team.</p>
            </div>
          </div>
        </header>
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">Error Loading Customers</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error || "Could not load customers. Please try again later."}</p>
            </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center"><Users className="w-8 h-8 mr-3 text-primary"/>Customer Oversight</h1>
            <p className="text-muted-foreground mt-1">View customers managed by your team. ({customers?.length || 0} customers)</p>
          </div>
        </div>
      </header>

      {/* Filters Section - Will be made interactive later */}
      <section className="bg-card shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Filter Customers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input type="text" placeholder="Search by name, email, phone..." className="col-span-1 md:col-span-2 lg:col-span-1" />
          
          <div>
            <label htmlFor="salespersonFilterTrigger" className="block text-sm font-medium text-foreground mb-1">Assigned Salesperson</label>
            <Select defaultValue="all" disabled> {/* Disabled for now */}
              <SelectTrigger id="salespersonFilterTrigger">
                <SelectValue placeholder="All Salespeople" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salespeople</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {/* showroomSalespeople.map(sp => (
                  <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                )) */}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="statusFilterTrigger" className="block text-sm font-medium text-foreground mb-1">Lead Status</label>
            <Select defaultValue="all" disabled> {/* Disabled for now */}
              <SelectTrigger id="statusFilterTrigger">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {/* Add actual statuses from your data or a predefined list */}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="h-fit" disabled> {/* Disabled for now */}
            <Search className="mr-2 h-4 w-4"/> Search / Filter
          </Button>
        </div>
      </section>

      <section className="bg-card shadow-sm rounded-lg">
         <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Team's Customer List ({customers?.length || 0})</h2>
         </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-card">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purchase Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Next Follow-up</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Last Interaction</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {customers && customers.map((customer: ManagedCustomer) => (
                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{customer.full_name || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground md:hidden">{customer.email || customer.phone_number || 'No contact'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-muted-foreground">{customer.email || 'No email'}</div>
                    <div className="text-xs text-muted-foreground/80">{customer.phone_number || 'No phone'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant="outline" className={`text-xs ${getStatusColor(customer.lead_status)}`}>
                      {customer.lead_status || 'N/A'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                    <div className="flex items-center">
                       <Avatar className="h-6 w-6 mr-2 text-xs">
                          <AvatarImage src={customer.profiles?.avatar_url || undefined} alt={customer.profiles?.full_name || 'S'} />
                          <AvatarFallback className="text-xs">{getInitials(customer.profiles?.full_name)}</AvatarFallback>
                        </Avatar>
                        {customer.profiles?.full_name || 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {(customer as any).purchase_amount && (customer as any).purchase_amount > 0 ? (
                      <span className="font-semibold text-green-600">
                        ₹{(customer as any).purchase_amount.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground hidden lg:table-cell">{formatDateSafe(customer.follow_up_date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground hidden lg:table-cell">{formatDateSafe(customer.last_contacted_date, true)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                    <Link href={`/manager/customers/${customer.id}`} title="View Customer Details">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Layers className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {(!customers || customers.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No customers found for your team.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {customers && customers.length > 0 && (
          <div className="py-4 px-6 border-t border-border flex justify-center">
            {/* Placeholder for pagination if needed */}
            {/* <p className="text-sm text-muted-foreground">Pagination controls (placeholder)</p> */}
          </div>
        )}
      </section>
    </div>
  );
} 