"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAppointmentAction, type CreateAppointmentData } from '../actions';
import { searchCustomersAction, type SearchedCustomer } from '../../customers/actions';
import { Loader2, XCircle } from 'lucide-react';

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
}

function ScheduleNewAppointmentForm() {
  const router = useRouter();
  const searchParamsHook = useSearchParams(); // Renamed to avoid conflict with component variable
  const customerIdFromUrl = searchParamsHook.get('customerId');
  const customerNameFromUrl = searchParamsHook.get('customerName');

  // State for form fields
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  
  // State for customer selection
  const [customerSearchQuery, setCustomerSearchQuery] = useState(customerNameFromUrl || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customerIdFromUrl);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(customerNameFromUrl);
  
  const [searchResults, setSearchResults] = useState<SearchedCustomer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Effect to handle pre-filled customer from URL
  useEffect(() => {
    if (customerIdFromUrl && customerNameFromUrl) {
      setSelectedCustomerId(customerIdFromUrl);
      setSelectedCustomerName(customerNameFromUrl);
      setCustomerSearchQuery(customerNameFromUrl);
    }
  }, [customerIdFromUrl, customerNameFromUrl]);

  const performSearch = async (query: string) => {
    if (query.trim().length < 2 || selectedCustomerId) { // Don't search if a customer is already selected or query is too short
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const result = await searchCustomersAction(query);
      if (result.success) {
        setSearchResults(result.data || []);
      } else {
        setSearchError(result.error || "Failed to search customers.");
        setSearchResults([]);
      }
    } catch (error) {
      setSearchError("An unexpected error occurred during search.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(debounce(performSearch, 300), [selectedCustomerId]);

  useEffect(() => {
    if (!selectedCustomerId) { // Only search if no customer is selected
        debouncedSearch(customerSearchQuery);
    }
  }, [customerSearchQuery, debouncedSearch, selectedCustomerId]);

  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setCustomerSearchQuery(query);
    if (selectedCustomerId) { // If user starts typing again, clear previous selection
      setSelectedCustomerId(null);
      setSelectedCustomerName(null);
    }
  };

  const handleCustomerSelect = (customer: SearchedCustomer) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomerName(customer.full_name);
    setCustomerSearchQuery(customer.full_name || '');
    setSearchResults([]); // Clear search results after selection
  };

  const clearCustomerSelection = () => {
    setSelectedCustomerId(null);
    setSelectedCustomerName(null);
    setCustomerSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!selectedCustomerId) {
      setSubmitError("Please select a customer to schedule the appointment.");
      return;
    }
    if (!appointmentDate || !appointmentTime || !purpose) {
        setSubmitError("Please fill in all required appointment details (Date, Time, Purpose).");
        return;
    }

    const appointmentData: CreateAppointmentData = {
      customerId: selectedCustomerId,
      appointmentDate,
      appointmentTime,
      purpose,
      notes,
    };
    
    setIsSubmitting(true);
    try {
      const result = await createAppointmentAction(appointmentData);
      if (result.success) {
        alert("Appointment scheduled successfully!");
        router.push('/salesperson/appointments');
      } else {
        setSubmitError(result.error || "An unknown error occurred.");
        alert(`Failed to schedule appointment: ${result.error}`);
      }
    } catch (err) {
      let errorMessage = "An unexpected error occurred while trying to schedule the appointment.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setSubmitError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Schedule New Appointment</h1>
          <Link href="/salesperson/appointments" className="text-sm text-primary hover:text-primary/90">
            &larr; Back to Appointments
          </Link>
        </div>
        <p className="text-muted-foreground mt-1">Fill in the details to schedule a new appointment.</p>
      </header>

      <section className="bg-card shadow-sm rounded-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-md">
              <p className="font-semibold">Error scheduling appointment:</p>
              <p>{submitError}</p>
            </div>
          )}
          
          {/* Customer Search Input */}
          <div className="relative">
            <label htmlFor="customerName" className="block text-sm font-medium text-foreground mb-1.5">
              Customer Name
            </label>
            <div className="flex items-center">
                <Input 
                type="text" 
                name="customerName" 
                id="customerName" 
                value={customerSearchQuery}
                onChange={handleCustomerSearchChange}
                placeholder="Type to search customer..."
                disabled={!!customerIdFromUrl && !!selectedCustomerId} // Disable only if pre-filled from URL AND selected
                />
                {selectedCustomerId && (!customerIdFromUrl || customerIdFromUrl !== selectedCustomerId) && (
                    <Button variant="ghost" size="icon" onClick={clearCustomerSelection} className="ml-2" title="Clear selection">
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                    </Button>
                )}
            </div>
            {isSearching && <Loader2 className="absolute right-3 top-10 h-4 w-4 animate-spin text-muted-foreground" />}
            
            {searchResults.length > 0 && !selectedCustomerId && (
              <ul className="absolute z-10 w-full bg-card border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {searchResults.map((customer) => (
                  <li 
                    key={customer.id} 
                    onClick={() => handleCustomerSelect(customer)}
                    className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                  >
                    {customer.full_name}
                  </li>
                ))}
              </ul>
            )}
            {searchError && <p className="text-xs text-destructive mt-1">{searchError}</p>}
            {selectedCustomerId && <p className="text-xs text-muted-foreground mt-1">Selected Customer ID: {selectedCustomerId}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-foreground mb-1.5">Appointment Date</label>
              <Input 
                type="date" 
                name="appointmentDate" 
                id="appointmentDate" 
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required 
                disabled={!selectedCustomerId} // Disable if no customer is selected
              />
            </div>
            <div>
              <label htmlFor="appointmentTime" className="block text-sm font-medium text-foreground mb-1.5">Appointment Time</label>
              <Input 
                type="time" 
                name="appointmentTime" 
                id="appointmentTime" 
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required 
                disabled={!selectedCustomerId} // Disable if no customer is selected
              />
            </div>
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-foreground mb-1.5">Purpose / Reason for Appointment</label>
            <Input 
              type="text" 
              name="purpose" 
              id="purpose" 
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Ring selection, Follow-up discussion" 
              required
              disabled={!selectedCustomerId} // Disable if no customer is selected
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">Internal Notes (Optional)</label>
            <Textarea 
              name="notes" 
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any internal notes for this appointment..." 
              className="min-h-[100px]"
              disabled={!selectedCustomerId} // Disable if no customer is selected
            />
          </div>
          
          <div className="pt-6 flex justify-end">
            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || !selectedCustomerId}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function ScheduleNewAppointmentPage() {
  return (
    <Suspense fallback={<div>Loading scheduler...</div>}>
      <ScheduleNewAppointmentForm />
    </Suspense>
  );
} 