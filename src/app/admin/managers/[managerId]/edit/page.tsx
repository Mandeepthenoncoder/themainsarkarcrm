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
import { Edit3, ChevronLeft, Activity, AlertTriangle } from 'lucide-react';

// Define API Response Types
interface ManagerSuccessResponse {
  success: true;
  data: { id: string; [key: string]: any };
}
interface ManagerErrorResponse {
  success: false;
  message: string;
}
type UpdateManagerApiResponse = ManagerSuccessResponse | ManagerErrorResponse;

// Interface for form data
interface ManagerFormData {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatarUrl?: string;
    employeeId: string; // Usually not editable
    role: string; // Usually not editable
    assignedShowroomsInput: string; // Comma-separated IDs/names for simplicity
    status: "Active" | "Pending Approval" | "Suspended";
    notes?: string;
}

// Mock fetch existing manager data (similar to detail page, but for form)
const mockManagersForEdit: Array<Omit<ManagerFormData, 'assignedShowroomsInput'> & { assignedShowrooms: Array<{id: string, name: string}>}> = [
    {
        id: 'mgr001',
        fullName: 'Ms. Priya Sharma',
        email: 'priya.sharma@example.com',
        phoneNumber: '+91 98765 43210',
        avatarUrl: 'https://i.pravatar.cc/100?u=priya.sharma@example.com',
        employeeId: 'EMP7001',
        role: 'Showroom Manager',
        assignedShowrooms: [{ id: 'sr001', name: 'Jaipur Flagship' }],
        status: 'Active',
        notes: 'Experienced manager with a strong background in luxury retail. Consistently exceeds targets.',
    },
    {
        id: 'mgr003',
        fullName: 'Ms. Sunita Rao',
        email: 'sunita.rao@example.com',
        phoneNumber: '+91 99887 76655',
        avatarUrl: 'https://i.pravatar.cc/100?u=sunita.rao@example.com',
        employeeId: 'EMP7003',
        role: 'Showroom Manager',
        assignedShowrooms: [{ id: 'sr003', name: 'Delhi CP'}],
        status: 'Pending Approval',
        notes: 'New manager hire, pending final onboarding and system access approval.'
    },
];

const fetchManagerForEdit = async (id: string): Promise<ManagerFormData | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const manager = mockManagersForEdit.find(m => m.id === id);
    if (manager) {
        return {
            ...manager,
            assignedShowroomsInput: manager.assignedShowrooms.map(sr => sr.id).join(', ') // or sr.name
        };
    }
    return null;
};

const updateManagerAPI = async (id: string, data: Partial<ManagerFormData>): Promise<UpdateManagerApiResponse> => {
  console.log(`Updating manager ID: ${id} with data:`, data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, data: { ...data, id } };
  // return { success: false, message: "Failed to update manager. Email might be in use by another account." };
};

export default function EditManagerPage() {
    const router = useRouter();
    const params = useParams();
    const managerIdFromParams = params.managerId as string;

    const [formData, setFormData] = useState<Partial<ManagerFormData>>({});
    const [initialManagerName, setInitialManagerName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (managerIdFromParams) {
            setIsFetching(true);
            fetchManagerForEdit(managerIdFromParams)
                .then(data => {
                    if (data) {
                        setFormData(data);
                        setInitialManagerName(data.fullName || "Manager");
                    } else {
                        setError("Manager not found. Cannot edit.");
                    }
                })
                .catch(err => {
                    console.error("Error fetching manager for edit:", err);
                    setError("Failed to load manager data for editing.");
                })
                .finally(() => setIsFetching(false));
        }
    }, [managerIdFromParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: keyof ManagerFormData, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value as ManagerFormData['status'] })); // Ensure type for status
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.id) {
            setError("Cannot save, manager ID is missing.");
            return;
        }
        setIsLoading(true);
        setError(null);

        const dataToSubmit = {
            ...formData,
            // In a real app, parse assignedShowroomsInput into an array of objects or IDs
            assignedShowrooms: formData.assignedShowroomsInput?.split(',').map(s => s.trim()).filter(s => s !== '') || [] 
        };
        delete (dataToSubmit as any).assignedShowroomsInput; // Remove the temporary input field

        try {
            const response = await updateManagerAPI(formData.id, dataToSubmit);
            if (response.success) {
                router.push(`/admin/managers/${formData.id}`); // Redirect to detail page
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
        return <div className="flex items-center justify-center h-64"><Activity className="h-8 w-8 animate-spin mr-2" /> Loading manager data...</div>;
    }

    if (error && !formData.id) {
        return (
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive text-lg mb-2">{error}</p>
                <Button onClick={() => router.push('/admin/managers')}>Back to Managers List</Button>
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
                    <Edit3 className="h-7 w-7 mr-3 text-primary" /> Edit Manager: {initialManagerName}
                </h1>
            </div>
            
            <form onSubmit={handleSubmit}>
                 <div className="grid grid-cols-1 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                                    <Input id="fullName" value={formData.fullName || ''} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                                    <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} required />
                                    {/* Consider making email read-only or adding warnings if changed */}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input id="phoneNumber" type="tel" value={formData.phoneNumber || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                                    <Input id="avatarUrl" value={formData.avatarUrl || ''} onChange={handleInputChange} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="employeeId">Employee ID</Label>
                                    <Input id="employeeId" value={formData.employeeId || ''} readOnly disabled className="bg-muted/50"/>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="role">Role</Label>
                                    <Input id="role" value={formData.role || 'Manager'} disabled readOnly className="bg-muted/50"/>
                                </div>
                            </div>
                            {/* Password change typically handled separately */}
                            {/* <Button type="button" variant="outline" disabled>Change Password</Button> */}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment & Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="assignedShowroomsInput">Assigned Showroom(s) (IDs, comma-separated)</Label>
                                    <Input id="assignedShowroomsInput" value={formData.assignedShowroomsInput || ''} onChange={handleInputChange} />
                                    <p className="text-xs text-muted-foreground">Placeholder. Actual assignment UI will be more robust.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="status">Account Status</Label>
                                    <Select value={formData.status || 'Pending Approval'} onValueChange={(value) => handleSelectChange('status', value)}>
                                        <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                                            <SelectItem value="Suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="space-y-1.5">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" value={formData.notes || ''} onChange={handleInputChange} rows={3}/>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mt-4">Error: {error}</p>}

                <CardFooter className="mt-6 border-t pt-6 flex flex-col sm:flex-row justify-end gap-3 px-0">
                    <Button type="button" variant="outline" onClick={() => router.push(formData.id ? `/admin/managers/${formData.id}` : '/admin/managers')} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || isFetching || !formData.id}>
                        {isLoading ? "Saving Changes..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </form>
        </div>
    );
} 