"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { PlusCircle, ArrowLeft, CalendarIcon, ChevronLeft } from 'lucide-react';
import { format } from "date-fns";

// Define API Response Types
interface ShowroomSuccessResponse {
  success: true;
  data: { id: string; [key: string]: any };
}

interface ShowroomErrorResponse {
  success: false;
  message: string;
}

type CreateShowroomApiResponse = ShowroomSuccessResponse | ShowroomErrorResponse;

// Mock function for API call
const createShowroomAPI = async (data: any): Promise<CreateShowroomApiResponse> => {
  console.log("Submitting showroom data:", data);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Change this to false to test the error path during development
  const simulateSuccess = true; 

  if (simulateSuccess) {
    return { success: true, data: { ...data, id: `sr${Math.floor(Math.random() * 10000)}` } };
  } else {
    return { success: false, message: "Failed to create showroom. Please try again." };
  }
};

export default function AddNewShowroomPage() {
    const router = useRouter();
    const [showroomName, setShowroomName] = useState("");
    const [showroomId, setShowroomId] = useState("");
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [city, setCity] = useState("");
    const [stateProvince, setStateProvince] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [country, setCountry] = useState("India");
    const [contactPhone, setContactPhone] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [primaryManager, setPrimaryManager] = useState("");
    const [operationalStatus, setOperationalStatus] = useState("Active");
    const [openingDate, setOpeningDate] = useState<Date | undefined>();
    const [notes, setNotes] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const showroomData = {
            name: showroomName,
            showroomId,
            address: {
                line1: addressLine1,
                line2: addressLine2,
                city,
                state: stateProvince,
                postalCode,
                country,
            },
            contact: {
                phone: contactPhone,
                email: contactEmail,
            },
            primaryManager,
            status: operationalStatus,
            openingDate: openingDate ? format(openingDate, "yyyy-MM-dd") : null,
            notes,
        };

        try {
            const response = await createShowroomAPI(showroomData);
            if (response.success) {
                // response is ShowroomSuccessResponse
                console.log("Showroom created:", response.data);
                // TODO: Add success toast/notification
                router.push("/admin/showrooms");
            } else {
                // response is ShowroomErrorResponse
                setError(response.message || "An unknown error occurred.");
            }
        } catch (err: any) {
            // Handle network errors or other exceptions from the API call itself
            setError(err.message || "Failed to submit the form due to a network or unexpected error.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="outline" size="icon" onClick={() => router.back() } className="shrink-0">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
                    <PlusCircle className="h-7 w-7 mr-3 text-primary" /> Add New Showroom
                </h1>
            </div>
            
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Showroom Details</CardTitle>
                        <CardDescription>Enter the information for the new showroom.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="showroomName">Showroom Name <span className="text-destructive">*</span></Label>
                                <Input id="showroomName" placeholder="e.g., Jaipur Flagship Store" value={showroomName} onChange={e => setShowroomName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="showroomId">Showroom ID</Label>
                                <Input id="showroomId" placeholder="e.g., SR-JAI-001 (Optional, can be auto-generated)" value={showroomId} onChange={e => setShowroomId(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="addressLine1">Address Line 1 <span className="text-destructive">*</span></Label>
                            <Input id="addressLine1" placeholder="Street address, P.O. box, company name, c/o" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addressLine2">Address Line 2</Label>
                            <Input id="addressLine2" placeholder="Apartment, suite, unit, building, floor, etc." value={addressLine2} onChange={e => setAddressLine2(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                                <Input id="city" placeholder="e.g., Jaipur" value={city} onChange={e => setCity(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stateProvince">State / Province <span className="text-destructive">*</span></Label>
                                <Input id="stateProvince" placeholder="e.g., Rajasthan" value={stateProvince} onChange={e => setStateProvince(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postalCode">Postal Code <span className="text-destructive">*</span></Label>
                                <Input id="postalCode" placeholder="e.g., 302001" value={postalCode} onChange={e => setPostalCode(e.target.value)} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            {/* Replace with Select if fixed list, or keep as Input for flexibility */}
                            <Input id="country" value={country} onChange={e => setCountry(e.target.value)} /> 
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">Contact Phone <span className="text-destructive">*</span></Label>
                                <Input id="contactPhone" type="tel" placeholder="+91 12345 67890" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Contact Email <span className="text-destructive">*</span></Label>
                                <Input id="contactEmail" type="email" placeholder="contact@showroom.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="primaryManager">Primary Manager (Placeholder)</Label>
                                <Input id="primaryManager" placeholder="Enter Manager ID or Name (temp)" value={primaryManager} onChange={e => setPrimaryManager(e.target.value)} />
                                {/* TODO: Replace with a Select component fetching managers from API */}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="operationalStatus">Operational Status</Label>
                                <Select value={operationalStatus} onValueChange={setOperationalStatus}>
                                    <SelectTrigger id="operationalStatus">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="Planned">Planned</SelectItem>
                                        <SelectItem value="Under Renovation">Under Renovation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="openingDate">Opening Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !openingDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {openingDate ? format(openingDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={openingDate}
                                        onSelect={setOpeningDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes / Description</Label>
                            <Textarea id="notes" placeholder="Any additional details about the showroom..." value={notes} onChange={e => setNotes(e.target.value)} rows={4}/>
                        </div>
                        
                        {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}

                    </CardContent>
                    <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.push('/admin/showrooms')} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Showroom"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
} 