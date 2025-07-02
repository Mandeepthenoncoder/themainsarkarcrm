import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { format } from 'date-fns'; // For formatting date and time

// Helper function for appointment status badge colors
const getAppointmentStatusColor = (status: string | null) => {
  if (!status) return 'bg-muted text-muted-foreground'; // Handle null status
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-success/10 text-success';
    case 'completed':
      return 'bg-green-700/10 text-green-700';
    case 'scheduled':
      return 'bg-sky-500/10 text-sky-600';
    case 'pending confirmation':
      return 'bg-warning/10 text-yellow-600';
    case 'cancelled':
      return 'bg-destructive/10 text-destructive';
    case 'no show':
      return 'bg-red-700/10 text-red-700';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

interface Appointment {
  id: string;
  appointment_datetime: string;
  service_type: string;
  status: string | null;
  notes: string | null;
  customers: { full_name: string | null; } | null;
}

export default async function AppointmentsPage() {
  const supabase = createServerComponentClient({ cookies });
  let appointments: Appointment[] = [];
  let fetchError: string | null = null;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This case should ideally be handled by middleware or a layout redirecting to login
    // For now, show a message or an empty list.
    fetchError = "User not authenticated. Please log in to see appointments.";
  } else {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_datetime,
        service_type,
        status,
        notes,
        customers!inner (full_name, deleted_at)
      `)
      .eq('salesperson_id', user.id)
      .is('customers.deleted_at', null)
      .order('appointment_datetime', { ascending: false }); // Show newest first, or true for upcoming

    if (error) {
      console.error('Error fetching appointments:', error);
      fetchError = `Failed to fetch appointments: ${error.message}`;
      appointments = [];
    } else {
      appointments = data as unknown as Appointment[];
      // Log the fetched appointments structure to the server console
      console.log("[AppointmentsPage] Fetched appointments data:", JSON.stringify(appointments, null, 2));
    }
  }

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Appointments Management</h1>
            <p className="text-muted-foreground mt-1">View and manage your customer appointments.</p>
          </div>
          <Link href="/salesperson/appointments/new">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2 px-4 rounded-md shadow transition-colors">
              Schedule New Appointment
            </button>
          </Link>
        </div>
      </header>

      {/* Filter Section */}
      <section className="bg-card shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Filter Appointments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <input type="text" placeholder="Search by customer name..." className="col-span-1 md:col-span-2 block w-full px-3 py-2 border border-border bg-card rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary sm:text-sm" />
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-foreground mb-1">Date</label>
            <input type="date" name="dateRange" id="dateRange" className="block w-full px-3 py-2 border border-border bg-card rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary sm:text-sm" />
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select id="statusFilter" name="statusFilter" className="block w-full px-3 py-2 border border-border bg-card rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary sm:text-sm">
              <option>All</option>
              <option>Scheduled</option>
              <option>Confirmed</option>
              <option>Completed</option>
              <option>Cancelled</option>
              <option>No Show</option>
            </select>
          </div>
          <button className="border border-border text-foreground hover:bg-muted font-semibold py-2 px-4 rounded-md shadow transition-colors h-fit">
            Apply Filters
          </button>
        </div>
      </section>

      {/* Appointments List Table */}
      <section className="bg-card shadow-sm rounded-lg">
         <h2 className="text-xl font-semibold text-foreground mb-4 px-6 pt-6">My Appointments</h2>
         {fetchError && (
            <div className="px-6 py-4">
                <p className="text-destructive text-center">{fetchError}</p>
            </div>
         )}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-card">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Purpose/Notes</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {appt.customers?.full_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {format(new Date(appt.appointment_datetime), 'PPP p')} {/* e.g., Jun 15, 2024 2:00 PM */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {appt.service_type}
                    {appt.notes && <span className="block text-xs text-muted-foreground/80">Notes: {appt.notes}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAppointmentStatusColor(appt.status)}`}>
                      {appt.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Link href={`/salesperson/appointments/${appt.id}`} className="text-primary hover:text-primary/90 font-semibold">
                      View
                    </Link>
                    <Link href={`/salesperson/appointments/${appt.id}/edit`} className="text-primary hover:text-primary/90 font-semibold">
                       Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && !fetchError && (
                 <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {appointments.length > 0 && (
          <div className="py-6 px-6 border-t border-border flex justify-center">
            <p className="text-sm text-muted-foreground">Pagination controls (placeholder)</p>
          </div>
        )}
      </section>
    </div>
  );
} 