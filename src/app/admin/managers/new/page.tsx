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
import { UserPlus, ChevronLeft } from 'lucide-react';

// Define API Response Types
interface ManagerSuccessResponse {
  success: true;
  data: { id: string; [key: string]: any };
}

interface ManagerErrorResponse {
  success: false;
  message: string;
}

type CreateManagerApiResponse = ManagerSuccessResponse | ManagerErrorResponse;

// Mock function for API call
const createManagerAPI = async (data: any): Promise<CreateManagerApiResponse> => {
  console.log("Submitting new manager data:", data);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  // Simulate success
  return { success: true, data: { ...data, id: `mgr${Math.floor(Math.random() * 10000)}` } };
  // Simulate error
  // return { success: false, message: "Failed to create manager account. Email or Employee ID might already exist." };
};

export default function AddNewManagerPage() {
    const router = useRouter();
    
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [assignedShowroomInput, setAssignedShowroomInput] = useState(""); // Temporary simple input
    const [accountStatus, setAccountStatus] = useState("Pending Approval");
    const [notes, setNotes] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setPasswordError(null);

        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        if(password.length < 8){
            setPasswordError("Password must be at least 8 characters long.");
            return;
        }

        setIsLoading(true);

        const managerData = {
            fullName,
            email,
            phoneNumber,
            avatarUrl,
            employeeId,
            password, // In a real app, password would be hashed server-side
            role: "Manager", // Hardcoded for this form
            // In a real app, assignedShowrooms would be an array of IDs from a multi-select or similar
            assignedShowrooms: assignedShowroomInput.split(',').map(s => s.trim()).filter(s => s !== ''), 
            status: accountStatus,
            notes,
        };

        try {
            const response = await createManagerAPI(managerData);
            if (response.success) {
                // TODO: Add success toast/notification
                console.log("Manager account created:", response.data);
                router.push("/admin/managers"); 
            } else {
                setError(response.message || "An unknown error occurred.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to submit form.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
                    <UserPlus className="h-7 w-7 mr-3 text-primary" /> Add New Manager Account
                </h1>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Basic details of the manager.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                                    <Input id="fullName" placeholder="e.g., Priya Sharma" value={fullName} onChange={e => setFullName(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                                    <Input id="email" type="email" placeholder="manager@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input id="phoneNumber" type="tel" placeholder="+91 12345 67890" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                                    <Input id="avatarUrl" placeholder="https://example.com/avatar.jpg" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>Credentials and identification for the manager.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="employeeId">Employee ID <span className="text-destructive">*</span></Label>
                                    <Input id="employeeId" placeholder="e.g., EMP7001" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="role">Role</Label>
                                    <Input id="role" value="Manager" disabled readOnly className="bg-muted/50"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                                    <Input id="password" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                                    <Input id="confirmPassword" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                </div>
                            </div>
                            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Initial Assignment & Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="assignedShowroomInput">Assigned Showroom(s) (IDs, comma-separated)</Label>
                                    <Input id="assignedShowroomInput" placeholder="e.g., sr001, sr002" value={assignedShowroomInput} onChange={e => setAssignedShowroomInput(e.target.value)} />
                                    <p className="text-xs text-muted-foreground">Placeholder. Actual assignment UI will be more robust.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="accountStatus">Account Status</Label>
                                    <Select value={accountStatus} onValueChange={setAccountStatus}>
                                        <SelectTrigger id="accountStatus"><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                                            <SelectItem value="Active">Active</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="space-y-1.5">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea id="notes" placeholder="Any specific notes about this manager..." value={notes} onChange={e => setNotes(e.target.value)} rows={3}/>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mt-4">{error}</p>}

                <CardFooter className="mt-6 border-t pt-6 flex flex-col sm:flex-row justify-end gap-3 px-0">
                    <Button type="button" variant="outline" onClick={() => router.push('/admin/managers')} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || (password !== confirmPassword) || password.length < 8}>
                        {isLoading ? "Creating Account..." : "Create Manager Account"}
                    </Button>
                </CardFooter>
            </form>
        </div>
    );
} 