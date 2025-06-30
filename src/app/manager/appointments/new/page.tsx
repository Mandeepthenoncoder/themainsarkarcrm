"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CalendarIcon } from 'lucide-react';

// Placeholder for salespeople in the showroom - for assignment
const showroomSalespeople = [
  { id: 'sp1', name: 'Aisha Sharma' },
  { id: 'sp2', name: 'Rohan Verma' },
  { id: 'sp3', name: 'Priya Mehta' },
  { id: 'sp4', name: 'Karan Singh' },
  { id: 'unassigned', name: 'Unassigned / Walk-in Pool'}
];

function ScheduleNewAppointmentForm() {
  const searchParams = useSearchParams();
  const customerIdFromUrl = searchParams.get('customerId');
  const customerNameFromUrl = searchParams.get('customerName');

  const [customerName, setCustomerName] = useState(customerNameFromUrl || '');
  const [customerId, setCustomerId] = useState(customerIdFromUrl || ''); // For pre-filling if coming from customer page
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [assignedSalespersonId, setAssignedSalespersonId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // If navigating directly or params change, update state
    setCustomerName(customerNameFromUrl || '');
    setCustomerId(customerIdFromUrl || '');
    // Clear other fields if customerId is not present (fresh form)
    if (!customerIdFromUrl) {
        setAppointmentDate('');
        setAppointmentTime('');
        setAssignedSalespersonId('');
        setPurpose('');
        setNotes('');
    }
  }, [customerIdFromUrl, customerNameFromUrl]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const appointmentData = {
      customerId, // This might be an ID of an existing customer or null/temp for a new one
      customerName, // If new customer, this name is used
      appointmentDate,
      appointmentTime,
      assignedSalespersonId,
      purpose,
      notes,
      status: assignedSalespersonId === 'unassigned' || !assignedSalespersonId ? 'Pending Assignment' : 'Scheduled'
    };
    console.log("New Appointment Data (Manager):", appointmentData);
    // TODO: Implement actual Supabase call to save appointment
    // TODO: Redirect to /manager/appointments or the new appointment's detail page
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        {customerId && customerName && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                Scheduling appointment for: <Link href={`/manager/customers/${customerId}`} className="font-semibold text-primary hover:underline">{customerName}</Link>
            </div>
        )}
        {!customerId && (
            <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-foreground mb-1.5">Customer Name (if new or not yet in system)</label>
                <Input type="text" name="customerName" id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter customer name" required={!customerId} />
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-foreground mb-1.5">Appointment Date</label>
                <Input type="date" name="appointmentDate" id="appointmentDate" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="appointmentTime" className="block text-sm font-medium text-foreground mb-1.5">Appointment Time</label>
                <Input type="time" name="appointmentTime" id="appointmentTime" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} required />
            </div>
        </div>

        <div>
            <label htmlFor="assignedSalesperson" className="block text-sm font-medium text-foreground mb-1.5">Assign to Salesperson</label>
            <Select value={assignedSalespersonId} onValueChange={setAssignedSalespersonId} required>
                <SelectTrigger id="assignedSalesperson">
                <SelectValue placeholder="Select salesperson" />
                </SelectTrigger>
                <SelectContent>
                {showroomSalespeople.map(sp => (
                    <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>

        <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-foreground mb-1.5">Purpose of Appointment</label>
            <Input type="text" name="purpose" id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g., Diamond ring selection, Repair inquiry" required />
        </div>

        <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">Notes (Optional)</label>
            <Textarea name="notes" id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional details for the appointment" />
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3">
            <Link href="/manager/appointments">
                <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
            </Link>
            <Button type="submit" className="w-full sm:w-auto">
                Schedule Appointment
            </Button>
        </div>
    </form>
  );
}

export default function ManagerScheduleNewAppointmentPage() {
  return (
    <div className="space-y-6">
        <header className="bg-card shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3">
                <Link href="/manager/appointments">
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back to Appointments</span>
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Schedule New Showroom Appointment</h1>
                    <p className="text-muted-foreground mt-1">Set up a new appointment and assign it to a salesperson.</p>
                </div>
            </div>
        </header>
        <section className="bg-card shadow-sm rounded-lg p-6 md:p-8">
            <Suspense fallback={<div>Loading form...</div>}>
                <ScheduleNewAppointmentForm />
            </Suspense>
        </section>
    </div>
  );
} 