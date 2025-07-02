import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Edit3, CalendarPlus, ArrowLeft, AlertCircle, Info, UserCheck, Users, Home, Gift, ShoppingBag, Heart, MessageSquare, Edit, Eye, Briefcase, MapPin, Star, Clock, Phone, TrendingUp, DollarSign } from 'lucide-react'; // Added Phone, TrendingUp, DollarSign
import { AddVisitLogDialog } from '@/components/customers/AddVisitLogDialog';
import { AddCallLogDialog } from '@/components/customers/AddCallLogDialog'; // Added import
import { EditableLeadStatus } from '@/components/customers/EditableLeadStatus'; // Added import
import { EditableInterestLevel } from '@/components/customers/EditableInterestLevel'; // Added import
import { addCallLogAction, addVisitLogAction } from '../actions'; // Import server actions
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // For tabbed log display
import { ScrollArea } from "@/components/ui/scroll-area"; // For scrollable logs
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Commented out for now
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"; // Commented out for now
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Alert is still used for manager override, but not for general error/success in this server component for now
// import { Textarea } from '@/components/ui/textarea'; // Commented out for now

interface InterestProductDetail {
  product_name: string;
  price_range: string;
  diamond_color?: string;
  diamond_stone?: string;
  diamond_fancy?: string;
  diamond_pressure_setting?: string;
  diamond_solitaire?: string;
  diamond_traditional?: string;
  gold_internal_categories?: string[];
  polki_categories?: string[];
}

interface InterestCategoryItem {
  id: string;
  category_type: 'Diamond' | 'Gold' | 'Polki' | '';
  products: InterestProductDetail[];
  customer_preferences?: CustomerPreferences; // Nested preferences
}

interface CustomerPreferences {
  design_selected?: boolean;
  wants_more_discount?: boolean;
  checking_other_jewellers?: boolean;
  felt_less_variety?: boolean;
  others?: string;
}

// --- Log Structures ---
interface LogEntry {
  id: string; // Should be unique, e.g., cuid() or uuid() generated when log is created
  date: string; // ISO 8601 format
  notes: string;
  salesperson_id?: string; // To track who made the log, if needed
  // We can add salesperson_name here if we join and fetch it when retrieving logs
}

interface VisitLogEntry extends LogEntry {
  // Potentially add visit-specific fields like 'location' if ever needed
  // For now, it's the same as LogEntry
}

interface CallLogEntry extends LogEntry {
  duration_minutes?: number;
  call_type?: 'Incoming' | 'Outgoing' | 'Missed'; // Added call_type
}

interface Customer {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  lead_status: 'New Lead' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost' | 'On Hold' | 'Future Opportunity' | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  address_country: string | null;
  notes: string | null; // Salesperson notes (summary_notes from form)
  manager_notes: string | null;
  lead_source: string | null;
  created_at: string;
  updated_at: string;
  birth_date: string | null;
  anniversary_date: string | null;
  catchment_area: string | null;
  community: string | null;
  mother_tongue: string | null;
  reason_for_visit: string | null;
  age_of_end_user: string | null;
  customer_preferences: CustomerPreferences | null; // This is the old, top-level preferences object. We will handle both.
  follow_up_date: string | null;
  interest_categories_json: InterestCategoryItem[] | null; // JSONB
  assigned_showroom_id: string | null; // Assuming we might want to display this or fetch showroom name later
  showrooms: { name: string | null } | null; // For showroom name
  assigned_salesperson_id: string | null; // Assuming we might want to display this or fetch salesperson name later
  profiles: { // For salesperson
    full_name: string | null;
    supervising_manager_id: string | null;
    manager: { // For supervising manager, joining profiles again
      full_name: string | null;
    } | null;
  } | null;
  visit_logs: VisitLogEntry[] | null;
  call_logs: CallLogEntry[] | null;
  interest_level: 'Hot' | 'Warm' | 'Cold' | 'None' | null; // Added interest_level
  monthly_saving_scheme_status?: 'Joined' | 'Interested' | 'Not Interested' | null;
  purchase_amount: number | null; // Converted revenue when design is selected
}

// Re-using from customers/page.tsx - consider moving to a shared utils file
// const getStatusBadgeClass = (status: Customer['lead_status']) => { // Function removed
//   if (status === null) { 
//     return 'bg-slate-100 text-slate-700 border-slate-300';
//   }
//   switch (status) {
//     case 'New Lead': return 'bg-blue-100 text-blue-700 border-blue-300';
//     case 'Contacted': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
//     case 'Qualified': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
//     case 'Proposal Sent': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
//     case 'Negotiation': return 'bg-purple-100 text-purple-700 border-purple-300';
//     case 'Closed Won': return 'bg-green-100 text-green-700 border-green-300';
//     case 'Closed Lost': return 'bg-red-100 text-red-700 border-red-300';
//     case 'On Hold': return 'bg-orange-100 text-orange-700 border-orange-300';
//     case 'Future Opportunity': return 'bg-teal-100 text-teal-700 border-teal-300';
//     default:
//       // This ensures all non-null enum values are handled by the switch.
//       const exhaustiveCheck: never = status;
//       return 'bg-slate-100 text-slate-700 border-slate-300'; 
//   }
// };

const getFollowUpStatus = (dateString: string | null): { text: string; className: string; isActionable: boolean, date: string | null } => {
  if (!dateString) return { text: 'Not set', className: 'text-muted-foreground', isActionable: false, date: null };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  // Supabase date might be YYYY-MM-DD, ensure proper parsing, especially for UTC vs local
  // Adjusting for potential timezone issues if dates are stored as simple date strings
  const parts = dateString.split('-');
  const followUpDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  followUpDate.setHours(0,0,0,0);

  const formattedDate = followUpDate.toLocaleDateString();

  if (followUpDate < today) {
    return { text: `Overdue`, className: 'text-red-600 font-semibold', isActionable: true, date: formattedDate };
  } else if (followUpDate.getTime() === today.getTime()) {
    return { text: `Today`, className: 'text-orange-500 font-semibold', isActionable: true, date: formattedDate };
  } else {
    return { text: `Upcoming`, className: 'text-green-600', isActionable: true, date: formattedDate };
  }
};

export default async function CustomerDetailPage({ params }: { params: { customerId: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { customerId } = params;

  // Fetch current user to potentially display their name on logs they created
  // This is a basic approach; a more robust solution might involve joining profiles with logs
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: customer, error } = await supabase
    .from('customers')
    .select(`
      id, full_name, email, phone_number, lead_status, 
      address_street, address_city, address_state, address_zip, address_country,
      notes, manager_notes, lead_source, created_at, updated_at,
      birth_date, anniversary_date, catchment_area, community, mother_tongue,
      reason_for_visit, age_of_end_user, customer_preferences, follow_up_date,
      interest_categories_json, 
      assigned_showroom_id, showrooms ( name ), 
      assigned_salesperson_id, 
      profiles ( 
        full_name, 
        supervising_manager_id, 
        manager:profiles!supervising_manager_id ( full_name )
      ),
      visit_logs, call_logs,
      interest_level,
      monthly_saving_scheme_status,
      purchase_amount
    `)
    .eq('id', customerId)
    .is('deleted_at', null)
    .single<Customer>();

  if (error || !customer) {
    console.error(`Error fetching customer ${customerId}:`, error);
    notFound(); // Or show a specific error page
  }

  const fullAddress = [
    customer.address_street,
    customer.address_city,
    customer.address_state,
    customer.address_zip,
    customer.address_country,
  ].filter(Boolean).join(', ');

  return (
    <div className="space-y-6 lg:space-y-8 p-4 md:p-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center flex-wrap gap-x-3 gap-y-1">
              <span>{customer.full_name || 'N/A'}</span>
              <EditableLeadStatus 
                customerId={customer.id} 
                currentStatus={customer.lead_status}
                // getStatusBadgeClass={getStatusBadgeClass} // Prop removed
              />
              <EditableInterestLevel 
                customerId={customer.id}
                currentInterestLevel={customer.interest_level}
              />
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Customer ID: {customer.id}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/salesperson/customers"><ArrowLeft className="h-4 w-4 mr-2"/> Back to Customer List</Link>
          </Button>
        </div>
        {/* Placeholder for Manager Override Alert - will require fetching additional data or different RLS setup
        {customer.status_override_details?.isOverridden && (
            <Alert variant="default" className="mt-4 bg-blue-500/10 border-blue-500/30 text-blue-700">
                <Info className="h-4 w-4 !text-blue-700" />
                <AlertTitle className="font-semibold">Status Override by Manager</AlertTitle>
                <AlertDescription className="text-xs">
                    Current status set to <strong>{customer.status_override_details.newStatus}</strong> by {customer.status_override_details.managerName} on {new Date(customer.status_override_details.overrideDate).toLocaleDateString()}.
                    (Original: {customer.status_override_details.originalStatus}). Reason: "<em>{customer.status_override_details.reason}</em>"
                </AlertDescription>
            </Alert>
        )} 
        */}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Customer Details & Actions */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Customer Information</CardTitle>
              <Link href={`/salesperson/customers/${customerId}/edit`}> {/* Ensure this route exists or is planned */}
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Customer
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div><dt className="text-xs font-medium text-muted-foreground flex items-center"><UserCheck className="h-3 w-3 mr-1.5" />Full Name</dt><dd className="mt-0.5 text-sm text-foreground">{customer.full_name || 'N/A'}</dd></div>
                <div><dt className="text-xs font-medium text-muted-foreground flex items-center"><Briefcase className="h-3 w-3 mr-1.5" />Lead Status</dt><dd className="mt-0.5 text-sm text-foreground">
                    <EditableLeadStatus 
                        customerId={customer.id} 
                        currentStatus={customer.lead_status}
                        // getStatusBadgeClass={getStatusBadgeClass} // Prop removed
                      />
                </dd></div>
                <div><dt className="text-xs font-medium text-muted-foreground">Email</dt><dd className="mt-0.5 text-sm text-foreground">{customer.email || 'N/A'}</dd></div>
                <div><dt className="text-xs font-medium text-muted-foreground">Phone</dt><dd className="mt-0.5 text-sm text-foreground">{customer.phone_number || 'N/A'}</dd></div>
                
                {fullAddress &&                 <div className="md:col-span-2"><dt className="text-xs font-medium text-muted-foreground flex items-center"><Home className="h-3 w-3 mr-1.5" />Address</dt><dd className="mt-0.5 text-sm text-foreground">{fullAddress}</dd></div>}
                {customer.catchment_area && <div><dt className="text-xs font-medium text-muted-foreground flex items-center"><MapPin className="h-3 w-3 mr-1.5" />Catchment Area</dt><dd className="mt-0.5 text-sm text-foreground">{customer.catchment_area}</dd></div>}
                
                {customer.purchase_amount && customer.purchase_amount > 0 && (
                  <div className="md:col-span-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <dt className="text-xs font-medium text-green-800 flex items-center"><DollarSign className="h-3 w-3 mr-1.5" />Converted Revenue</dt>
                    <dd className="mt-0.5 text-lg font-semibold text-green-700">₹{customer.purchase_amount.toLocaleString('en-IN')}</dd>
                    <p className="text-xs text-green-600 mt-1">Customer has made a purchase - counted as converted revenue</p>
                  </div>
                )}

                {customer.community && <div><dt className="text-xs font-medium text-muted-foreground flex items-center"><Users className="h-3 w-3 mr-1.5" />Community</dt><dd className="mt-0.5 text-sm text-foreground">{customer.community}</dd></div>}
                {customer.mother_tongue && <div><dt className="text-xs font-medium text-muted-foreground">Mother Tongue</dt><dd className="mt-0.5 text-sm text-foreground">{customer.mother_tongue}</dd></div>}

                {customer.reason_for_visit && <div><dt className="text-xs font-medium text-muted-foreground flex items-center"><ShoppingBag className="h-3 w-3 mr-1.5" />Reason for Visit</dt><dd className="mt-0.5 text-sm text-foreground">{customer.reason_for_visit}</dd></div>}
                {customer.age_of_end_user && <div><dt className="text-xs font-medium text-muted-foreground">Age of End User</dt><dd className="mt-0.5 text-sm text-foreground">{customer.age_of_end_user}</dd></div>}
                
                {customer.monthly_saving_scheme_status && <div><dt className="text-xs font-medium text-muted-foreground">Monthly Saving Scheme</dt><dd className="mt-0.5 text-sm text-foreground">{customer.monthly_saving_scheme_status || 'N/A'}</dd></div>}
              </dl>
            </CardContent>
          </Card>

          {/* Updated to display customer.notes */}
          {customer.notes && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><MessageSquare className="h-5 w-5 mr-2 text-primary"/>Salesperson Notes</CardTitle>
                    <CardDescription>General notes about the customer, previously summary notes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 border rounded-md bg-muted/50">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{customer.notes}</p>
                    </div>
                </CardContent>
            </Card>
          )}

          {/* Customer Preferences - Show only if old data exists and new nested data does not */}
          {customer.customer_preferences && !customer.interest_categories_json?.some(i => i.customer_preferences) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Heart className="h-5 w-5 mr-2 text-primary"/>Customer Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {customer.customer_preferences.design_selected && <li>Selected a design during visit</li>}
                  {customer.customer_preferences.wants_more_discount && <li>Expressed desire for more discount</li>}
                  {customer.customer_preferences.checking_other_jewellers && <li>Mentioned checking other jewellers</li>}
                  {customer.customer_preferences.felt_less_variety && <li>Felt there was less variety</li>}
                  {customer.customer_preferences.others && <li>Other notes: {customer.customer_preferences.others}</li>}
                </ul>
                {Object.values(customer.customer_preferences).every(val => !val) && <p className="text-sm text-muted-foreground">No specific preferences noted.</p>}
              </CardContent>
            </Card>
          )}

          {/* Interest Categories */}
          {customer.interest_categories_json && customer.interest_categories_json.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Eye className="h-5 w-5 mr-2 text-primary"/>Interest Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.interest_categories_json.map((interest, index) => (
                  <div key={interest.id || index} className="p-3 border rounded-md bg-muted/30">
                    <h4 className="font-semibold text-md mb-2">{interest.category_type || 'Uncategorized'}</h4>
                    {interest.products.map((product, pIndex) => (
                      <div key={pIndex} className="text-sm mb-1 ml-2">
                        <p><strong>Product:</strong> {product.product_name}</p>
                        <p><strong>Price Range:</strong> {product.price_range}</p>
                        {/* Render Diamond specific fields */}
                        {product.diamond_color && <p>Color: {product.diamond_color}</p>}
                        {product.diamond_stone && <p>Stone: {product.diamond_stone}</p>}
                        {/* Add other diamond/gold/polki fields as needed */}
                      </div>
                    ))}
                    {interest.customer_preferences && (
                      <div className="mt-3 pt-3 border-t">
                        <h5 className="font-semibold text-sm mb-2">Preferences for this Interest</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {interest.customer_preferences.design_selected && <li>Selected a design during visit</li>}
                          {interest.customer_preferences.wants_more_discount && <li>Expressed desire for more discount</li>}
                          {interest.customer_preferences.checking_other_jewellers && <li>Mentioned checking other jewellers</li>}
                          {interest.customer_preferences.felt_less_variety && <li>Felt there was less variety</li>}
                          {interest.customer_preferences.others && <li>Other notes: {interest.customer_preferences.others}</li>}
                        </ul>
                        {Object.values(interest.customer_preferences).every(val => !val) && <p className="text-sm text-muted-foreground">No specific preferences noted for this interest.</p>}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* NEW: Key Dates & Follow-up Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Star className="h-5 w-5 mr-2 text-primary"/>Key Dates & Follow-up</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {customer.birth_date && 
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground flex items-center"><Gift className="h-3 w-3 mr-1.5" />Birth Date</dt>
                    <dd className="mt-0.5 text-sm text-foreground">{new Date(customer.birth_date).toLocaleDateString()}</dd>
                  </div>
                }
                {customer.anniversary_date && 
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground flex items-center"><Gift className="h-3 w-3 mr-1.5" />Anniversary Date</dt>
                    <dd className="mt-0.5 text-sm text-foreground">{new Date(customer.anniversary_date).toLocaleDateString()}</dd>
                  </div>
                }
                <div>
                  <dt className="text-xs font-medium text-muted-foreground flex items-center"><Clock className="h-3 w-3 mr-1.5" />Follow-up Status</dt>
                  <dd className={`mt-0.5 text-sm ${getFollowUpStatus(customer.follow_up_date).className}`}>
                    {getFollowUpStatus(customer.follow_up_date).text}
                    {getFollowUpStatus(customer.follow_up_date).isActionable && getFollowUpStatus(customer.follow_up_date).date !== null && 
                     getFollowUpStatus(customer.follow_up_date).text !== 'Today' && getFollowUpStatus(customer.follow_up_date).text !== 'Overdue' &&
                      <span> ({getFollowUpStatus(customer.follow_up_date).date})</span>
                    }
                     { (getFollowUpStatus(customer.follow_up_date).text === 'Today' || getFollowUpStatus(customer.follow_up_date).text === 'Overdue') && 
                        <span> ({getFollowUpStatus(customer.follow_up_date).date})</span>
                     }
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          {/* Manager Notes */}
          {customer.manager_notes && (
            <Card>
                <CardHeader>
                    <CardTitle  className="flex items-center"><Edit className="h-5 w-5 mr-2 text-primary"/>Manager Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 border rounded-md bg-muted/50">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{customer.manager_notes}</p>
                    </div>
                </CardContent>
            </Card>
          )}

          {/* Visit and Call Logs Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><MessageSquare className="h-5 w-5 mr-2 text-primary"/>Interaction Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="visits" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="visits">Visit Logs</TabsTrigger>
                  <TabsTrigger value="calls">Call Logs</TabsTrigger>
                </TabsList>
                <TabsContent value="visits">
                  <div className="flex justify-end mb-4 mt-2">
                    <AddVisitLogDialog customerId={customer.id} />
                  </div>
                  <ScrollArea className="h-72 w-full rounded-md border p-4">
                    {customer.visit_logs && customer.visit_logs.length > 0 ? (
                      <ul className="space-y-4">
                        {customer.visit_logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                          <li key={log.id} className="p-3 bg-muted/20 rounded-md border">
                            <div className="flex justify-between items-start">
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.date).toLocaleDateString()} - {new Date(log.date).toLocaleTimeString()}
                              </p>
                              {/* Later, we can fetch salesperson name by log.salesperson_id if needed */}
                              {/* <Badge variant="outline" className="text-xs">{log.salesperson_id.substring(0,8)}...</Badge> */}
                            </div>
                            <p className="text-sm mt-1">{log.notes}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No visit logs recorded yet.</p>
                    )}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="calls">
                  <div className="flex justify-end mb-4 mt-2">
                     <AddCallLogDialog customerId={customer.id} />
                  </div>
                  <ScrollArea className="h-72 w-full rounded-md border p-4">
                    {customer.call_logs && customer.call_logs.length > 0 ? (
                      <ul className="space-y-4">
                        {customer.call_logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                          <li key={log.id} className="p-3 bg-muted/20 rounded-md border">
                            <div className="flex justify-between items-start">
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.date).toLocaleDateString()} - {new Date(log.date).toLocaleTimeString()}
                              </p>
                              <div>
                                {log.call_type && <Badge variant="outline" className="text-xs mr-2">{log.call_type}</Badge>}
                                {log.duration_minutes && <Badge variant="secondary" className="text-xs">{log.duration_minutes} min</Badge>}
                              </div>
                            </div>
                            <p className="text-sm mt-1">{log.notes}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No call logs recorded yet.</p>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Additional Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {customer.lead_source && <div><dt className="text-xs font-medium text-muted-foreground">Lead Source</dt><dd className="mt-0.5 text-sm text-foreground">{customer.lead_source}</dd></div>}

                {customer.created_at && <div className="md:col-span-1"><dt className="text-xs font-medium text-muted-foreground">Date Added</dt><dd className="mt-0.5 text-sm text-foreground">{new Date(customer.created_at).toLocaleDateString()}</dd></div>}
                {customer.updated_at && <div className="md:col-span-1"><dt className="text-xs font-medium text-muted-foreground">Last Updated</dt><dd className="mt-0.5 text-sm text-foreground">{new Date(customer.updated_at).toLocaleDateString()}</dd></div>}
                
                {/* Display Salesperson Name */}
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Assigned Salesperson</dt>
                  <dd className="mt-0.5 text-sm text-foreground">{customer.profiles?.full_name || customer.assigned_salesperson_id || 'N/A'}</dd>
                </div>

                {/* Display Manager Name */}
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Supervising Manager</dt>
                  <dd className="mt-0.5 text-sm text-foreground">{customer.profiles?.manager?.full_name || 'N/A'}</dd>
                </div>

                {/* Display Showroom Name */}
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Assigned Showroom</dt>
                  <dd className="mt-0.5 text-sm text-foreground">{customer.showrooms?.name || customer.assigned_showroom_id || 'N/A'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Related Data (Appointments, Tasks, etc.) - Future */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>View and manage appointments for this customer.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* TODO: Fetch and display upcoming appointments for this customer */}
                    <p className="text-sm text-muted-foreground">No upcoming appointments scheduled. 
                        <Link href={`/salesperson/appointments/new?customerId=${customer.id}&customerName=${encodeURIComponent(customer.full_name || '')}`} className="text-primary hover:underline font-medium ml-1">
                            Schedule one now.
                        </Link>
                    </p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Briefcase className="h-5 w-5 mr-2 text-primary"/>Salesperson Tasks for this Customer</CardTitle>
                    <CardDescription>Reminders and tasks related to managing this customer relationship.</CardDescription>
                </CardHeader>
                <CardContent>
                    {customer.follow_up_date ? (
                        <div className="p-3 border rounded-md bg-muted/50">
                            <p className={`text-sm font-medium ${getFollowUpStatus(customer.follow_up_date).className}`}>
                                <Clock className="h-4 w-4 mr-1.5 inline-block align-text-bottom" />
                                Follow up on: {getFollowUpStatus(customer.follow_up_date).date} 
                                ({getFollowUpStatus(customer.follow_up_date).text})
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                This is based on the follow-up date set for the customer.
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No specific follow-up date set. Add one to create a reminder.</p>
                    )}
                    {/* Placeholder for manually added tasks in the future */}
                    {/* <Button variant="outline" size="sm" className="mt-4">Add Task (Coming Soon)</Button> */}
                </CardContent>
            </Card>

            {/* Manager Notes & Escalation placeholders - to be implemented later */}
            {/* 
            {customer.manager_notes_list && customer.manager_notes_list.length > 0 && (
              <Card>
                  <CardHeader><CardTitle>Manager&apos;s Notes</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                      {customer.manager_notes_list.map(note => (
                          <div key={note.id} className="p-3 border rounded-md bg-blue-500/5">
                              <p className="text-xs text-blue-700">From: {note.managerName} ({new Date(note.date).toLocaleDateString()})</p>
                              <p className="text-sm text-blue-800 whitespace-pre-wrap">{note.text}</p>
                          </div>
                      ))}
                  </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                  <CardTitle>Need Manager Assistance?</CardTitle>
                  <CardDescription>If you encounter issues or need a manager&apos;s intervention.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Button variant="destructive" className="w-full" disabled>
                      <AlertCircle className="h-4 w-4 mr-2" /> Escalate Issue (Coming Soon)
                  </Button>
              </CardContent>
            </Card> 
            */}
        </div>
      </div>
    </div>
  );
} 