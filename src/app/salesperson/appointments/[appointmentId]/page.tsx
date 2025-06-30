import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CalendarClock, Edit3, Info } from 'lucide-react';

interface AppointmentDetailPageProps {
  params: {
    appointmentId: string;
  };
}

interface DetailedAppointment {
  id: string;
  appointment_datetime: string;
  service_type: string;
  status: string | null;
  notes: string | null;
  customers: { full_name: string | null; } | null;
  // Add any other fields you might need, e.g., salesperson_id, showroom_id if relevant for this view
}

// Helper function for appointment status badge colors (can be moved to a shared utils file)
const getAppointmentStatusColor = (status: string | null) => {
  if (!status) return 'bg-muted text-muted-foreground';
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

export default async function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
  const { appointmentId } = params;
  const supabase = createServerComponentClient({ cookies });

  let appointment: DetailedAppointment | null = null;
  let fetchError: string | null = null;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This should ideally be handled by middleware or a layout redirecting to login
    fetchError = "User not authenticated. Please log in to view appointment details.";
  } else {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_datetime,
        service_type,
        status,
        notes,
        customers (full_name)
      `)
      .eq('id', appointmentId)
      // Add .eq('salesperson_id', user.id) if salespeople should only see their own appointments
      .single(); // Use .single() as we expect one record or null

    if (error) {
      console.error(`[AppointmentDetailPage] Error fetching appointment ${appointmentId}:`, error);
      fetchError = `Failed to fetch appointment details: ${error.message}`;
      if (error.code === 'PGRST116') { // PostgREST error code for "Fetched 0 rows"
        fetchError = `Appointment with ID ${appointmentId} not found or you may not have permission to view it.`;
      }
    } else {
      appointment = data as unknown as DetailedAppointment;
      console.log(`[AppointmentDetailPage] Fetched appointment ${appointmentId} data:`, JSON.stringify(appointment, null, 2));
    }
  }

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Appointment Details
            </h1>
            <p className="text-muted-foreground mt-1">Viewing details for a specific appointment.</p>
          </div>
          <Link href="/salesperson/appointments">
            <Button variant="outline">&larr; Back to Appointments List</Button>
          </Link>
        </div>
      </header>

      {fetchError && (
        <section className="bg-destructive/10 border border-destructive/50 text-destructive p-6 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <h2 className="text-xl font-semibold">Error Loading Appointment</h2>
            <p>{fetchError}</p>
          </div>
        </section>
      )}

      {!fetchError && !appointment && (
        <section className="bg-card shadow-sm rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-center">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Appointment Not Found</h2>
          <p className="text-muted-foreground">
            The appointment with ID <span className="font-medium text-foreground">{appointmentId}</span> could not be loaded or does not exist.
          </p>
        </section>
      )}

      {appointment && (
        <>
          <section className="bg-card shadow-sm rounded-lg p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Appointment Information</h2>
                    <p className="text-sm text-muted-foreground">ID: {appointment.id}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Link href={`/salesperson/appointments/${appointment.id}/edit`}>
                        <Button variant="outline"><Edit3 className="mr-2 h-4 w-4"/>Edit</Button>
                    </Link>
                    {/* For Reschedule, it often means editing date/time, so it can also point to edit page */}
                    <Link href={`/salesperson/appointments/${appointment.id}/edit?reschedule=true`}> 
                        <Button variant="outline"><CalendarClock className="mr-2 h-4 w-4"/>Reschedule</Button>
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Customer Name:</p>
                <p className="text-lg text-foreground">{appointment.customers?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Date & Time:</p>
                <p className="text-lg text-foreground">
                  {format(new Date(appointment.appointment_datetime), 'PPP p')} {/* e.g., Jun 15, 2024 2:00 PM */}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Purpose / Service:</p>
                <p className="text-lg text-foreground">{appointment.service_type || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Status:</p>
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getAppointmentStatusColor(appointment.status)}`}>
                  {appointment.status || 'Unknown'}
                </span>
              </div>
              {appointment.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notes:</p>
                  <p className="text-base text-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}