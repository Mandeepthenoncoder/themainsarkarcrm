"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Edit3, ArrowLeft, CalendarIcon, ChevronLeft, Activity, AlertTriangle } from 'lucide-react';
import { format, parseISO } from "date-fns"; // Added parseISO

// Define API Response Types (can be shared or redefined if different)
interface ShowroomSuccessResponse {
  success: true;
  data: { id: string; [key: string]: any };
}

interface ShowroomErrorResponse {
  success: false;
  message: string;
}

type UpdateShowroomApiResponse = ShowroomSuccessResponse | ShowroomErrorResponse;

// Extended Showroom interface to match detail page for fetching
interface ShowroomFormData {
    id: string;
    name: string;
    showroomIdForDisplay: string; // showroomId from URL, may not be editable
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    contactPhone: string;
    contactEmail: string;
    primaryManager: string; 
    operationalStatus: string;
    openingDate?: Date; 
    notes?: string;
}

// Mock fetch existing showroom data (similar to detail page, simplified)
const mockShowroomsForEdit: any[] = [
    { 
        id: 'sr001', 
        name: 'Jaipur Flagship Store',
        showroomIdForDisplay: 'sr001',
        addressLine1: '123 Johari Bazaar Rd', city: 'Jaipur', stateProvince: 'Rajasthan', postalCode: '302001', country: 'India',
        contactPhone: '+91 141 234 5678',
        contactEmail: 'jaipur.store@mangathriya.com',
        primaryManager: 'Ms. Priya Sharma (mgr001)', // Simplified
        operationalStatus: 'Active',
        openingDate: '2020-01-15', // String date
        notes: 'Our flagship store, specializing in high-end bridal jewelry and custom designs. Features a private viewing lounge.',
    },
    { 
        id: 'sr002', 
        name: 'Mumbai Bandra Boutique',
        showroomIdForDisplay: 'sr002',
        addressLine1: '45 Linking Road', addressLine2: 'Bandra West', city: 'Mumbai', stateProvince: 'Maharashtra', postalCode: '400050', country: 'India',
        contactPhone: '+91 22 2600 1234',
        contactEmail: 'mumbai.store@mangathriya.com',
        primaryManager: 'Mr. Anand Verma (mgr003)',
        operationalStatus: 'Active',
        openingDate: '2021-03-20',
        notes: 'Focuses on contemporary designs and celebrity clientele.',
    },
];

const fetchShowroomForEdit = async (id: string): Promise<ShowroomFormData | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const showroom = mockShowroomsForEdit.find(sr => sr.id === id);
    if (showroom) {
        return {
            ...showroom,
            openingDate: showroom.openingDate ? parseISO(showroom.openingDate) : undefined, // Convert string to Date
        };
    }
    return null;
};

// Mock function for API call to update
const updateShowroomAPI = async (id: string, data: any): Promise<UpdateShowroomApiResponse> => {
  console.log(`Updating showroom ID: ${id} with data:`, data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Simulate success
  return { success: true, data: { ...data, id } };
  // Simulate error
  // return { success: false, message: "Failed to update showroom. Please try again." };
};

export default function EditShowroomPage() {
    const router = useRouter();
    const params = useParams();
    const showroomIdFromParams = params.showroomId as string;

    const [formData, setFormData] = useState<Partial<ShowroomFormData>>({});
    const [initialShowroomName, setInitialShowroomName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (showroomIdFromParams) {
            setIsFetching(true);
            fetchShowroomForEdit(showroomIdFromParams)
                .then(data => {
                    if (data) {
                        setFormData(data);
                        setInitialShowroomName(data.name || "Showroom");
                    } else {
                        setError("Showroom not found. Cannot edit.");
                    }
                })
                .catch(err => {
                    console.error("Error fetching showroom for edit:", err);
                    setError("Failed to load showroom data for editing.");
                })
                .finally(() => setIsFetching(false));
        }
    }, [showroomIdFromParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: keyof ShowroomFormData, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleDateChange = (date?: Date) => {
        setFormData(prev => ({ ...prev, openingDate: date }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.id) {
            setError("Cannot save, showroom ID is missing.");
            return;
        }
        setIsLoading(true);
        setError(null);

        const dataToSubmit = {
            ...formData,
            openingDate: formData.openingDate ? format(formData.openingDate, "yyyy-MM-dd") : null,
        };

        try {
            const response = await updateShowroomAPI(formData.id, dataToSubmit);
            if (response.success) {
                // TODO: Add success toast/notification
                router.push(`/admin/showrooms/${formData.id}`); // Redirect to detail page
            } else {
                setError(response.message || "An unknown error occurred.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to submit form.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div className="flex items-center justify-center h-64"><Activity className="h-8 w-8 animate-spin mr-2" /> Loading showroom data for editing...</div>;
    }

    if (error && !formData.id) { // Show full page error if initial fetch failed badly
        return (
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive text-lg mb-2">{error}</p>
                <Button onClick={() => router.push('/admin/showrooms')}>Back to Showrooms List</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
                 <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
                    <Edit3 className="h-7 w-7 mr-3 text-primary" /> Edit: {initialShowroomName}
                </h1>
            </div>
            
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Showroom Details</CardTitle>
                        <CardDescription>Modify the information for showroom ID: {formData.showroomIdForDisplay || showroomIdFromParams}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Showroom Name <span className="text-destructive">*</span></Label>
                                <Input id="name" placeholder="e.g., Jaipur Flagship Store" value={formData.name || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="showroomIdForDisplay">Showroom ID (Display)</Label>
                                <Input id="showroomIdForDisplay" value={formData.showroomIdForDisplay || showroomIdFromParams} readOnly disabled className="bg-muted/50" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="addressLine1">Address Line 1 <span className="text-destructive">*</span></Label>
                            <Input id="addressLine1" placeholder="Street address" value={formData.addressLine1 || ''} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addressLine2">Address Line 2</Label>
                            <Input id="addressLine2" placeholder="Apartment, suite, etc." value={formData.addressLine2 || ''} onChange={handleInputChange} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                                <Input id="city" placeholder="e.g., Jaipur" value={formData.city || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stateProvince">State / Province <span className="text-destructive">*</span></Label>
                                <Input id="stateProvince" placeholder="e.g., Rajasthan" value={formData.stateProvince || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postalCode">Postal Code <span className="text-destructive">*</span></Label>
                                <Input id="postalCode" placeholder="e.g., 302001" value={formData.postalCode || ''} onChange={handleInputChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" value={formData.country || ''} onChange={handleInputChange} /> 
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">Contact Phone <span className="text-destructive">*</span></Label>
                                <Input id="contactPhone" type="tel" placeholder="+91 12345 67890" value={formData.contactPhone || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Contact Email <span className="text-destructive">*</span></Label>
                                <Input id="contactEmail" type="email" placeholder="contact@showroom.com" value={formData.contactEmail || ''} onChange={handleInputChange} required />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="primaryManager">Primary Manager (Placeholder)</Label>
                                <Input id="primaryManager" placeholder="Enter Manager ID or Name (temp)" value={formData.primaryManager || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="operationalStatus">Operational Status</Label>
                                <Select value={formData.operationalStatus || 'Active'} onValueChange={(value) => handleSelectChange('operationalStatus', value)}>
                                    <SelectTrigger id="operationalStatus"><SelectValue placeholder="Select status" /></SelectTrigger>
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
                                            !formData.openingDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.openingDate ? format(formData.openingDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.openingDate}
                                        onSelect={handleDateChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes / Description</Label>
                            <Textarea id="notes" placeholder="Any additional details..." value={formData.notes || ''} onChange={handleInputChange} rows={4}/>
                        </div>
                        
                        {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">Error: {error}</p>}

                    </CardContent>
                    <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.push(formData.id ? `/admin/showrooms/${formData.id}` : '/admin/showrooms')} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || isFetching || !formData.id}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
} 