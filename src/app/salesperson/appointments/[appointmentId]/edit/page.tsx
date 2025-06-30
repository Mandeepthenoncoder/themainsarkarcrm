"use client";

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

// EditAppointmentPageProps is no longer needed for the default export
// interface EditAppointmentPageProps {
//   params: {
//     appointmentId: string;
//   };
// }

// Client component to access searchParams for the reschedule flag
function EditAppointmentForm({ appointmentId }: { appointmentId: string }) {
  const searchParams = useSearchParams();
  const isRescheduleMode = searchParams.get('reschedule') === 'true';

  // TODO: Fetch existing appointment data based on appointmentId
  // TODO: Create a form to edit appointment details (date, time, notes, status etc.)
  // TODO: Implement an update action to save changes

  console.log(`[EditAppointmentForm] Editing appointment ID: ${appointmentId}, Reschedule Mode: ${isRescheduleMode}`);

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {isRescheduleMode ? 'Reschedule Appointment' : 'Edit Appointment Details'}
          </h1>
          <Link href={`/salesperson/appointments/${appointmentId}`}>
            <Button variant="outline">&larr; Back to Appointment Details</Button>
          </Link>
        </div>
        <p className="text-muted-foreground mt-1">
          {isRescheduleMode 
            ? `Adjust the date, time, or other details for appointment ID: ${appointmentId}.`
            : `Modify the details for appointment ID: ${appointmentId}.`
          }
        </p>
      </header>

      <section className="bg-card shadow-sm rounded-lg p-6 md:p-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Edit Form</h2>
        <p className="text-muted-foreground">
          The form to {isRescheduleMode ? 'reschedule' : 'edit'} appointment <span className="font-medium text-foreground">{appointmentId}</span> will be here.
        </p>
        {/* Placeholder for form fields */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Date</label>
            <input type="date" className="mt-1 block w-full px-3 py-2 border border-border bg-card rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Time</label>
            <input type="time" className="mt-1 block w-full px-3 py-2 border border-border bg-card rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Notes</label>
            <textarea className="mt-1 block w-full px-3 py-2 border border-border bg-card rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary sm:text-sm min-h-[80px]"></textarea>
          </div>
          <Button type="submit">Save Changes</Button>
        </div>
      </section>
    </div>
  );
}

// Main page component - now a Client Component due to "use client" at the top of the module.
export default function EditAppointmentPage() {
  const routeParams = useParams(); // Use the useParams hook
  // useParams returns an object like { appointmentId: 'some-id' }.
  // It can also return string[] if it's a catch-all route, so handle that (though not strictly necessary for [appointmentId]).
  const appointmentId = Array.isArray(routeParams.appointmentId) 
    ? routeParams.appointmentId[0] 
    : routeParams.appointmentId;

  if (!appointmentId) {
    // This case should ideally not be hit if the route is matched correctly.
    return <div>Error: Appointment ID not found in URL.</div>;
  }

  return (
    // Suspense is still good practice if EditAppointmentForm might perform async operations or heavy rendering.
    <Suspense fallback={<div>Loading editor...</div>}>
      <EditAppointmentForm appointmentId={appointmentId} />
    </Suspense>
  );
} 