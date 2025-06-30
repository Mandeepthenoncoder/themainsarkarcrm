"use client";

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { createSalespersonAction, getShowroomsForManagerAction, ShowroomBasicInfo, CreateSalespersonData } from '../actions';
import { UserPlus, ArrowLeft, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { toast } from 'sonner'; // Assuming you use sonner for notifications

export default function AddNewSalespersonPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showrooms, setShowrooms] = useState<ShowroomBasicInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateSalespersonData>>({
    full_name: '',
    email: '',
    password: '',
    employee_id: '',
    assigned_showroom_id: undefined,
  });

  useEffect(() => {
    async function fetchShowrooms() {
      const result = await getShowroomsForManagerAction();
      if (result.success && result.showrooms) {
        setShowrooms(result.showrooms);
      } else {
        toast.error(result.error || 'Failed to load showrooms for selection.');
      }
    }
    fetchShowrooms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name || !formData.email || !formData.password || !formData.assigned_showroom_id) {
      const message = 'Full Name, Email, Password, and Assigned Showroom are required.';
      setError(message);
      toast.error(message);
      return;
    }
    
    if (formData.password && formData.password.length < 6) {
      const message = 'Password must be at least 6 characters long.';
      setError(message);
      toast.error(message);
      return;
    }

    startTransition(async () => {
      const dataToSend = { ...formData, password: formData.password! } as CreateSalespersonData;
      const result = await createSalespersonAction(dataToSend);
      if (result.success && result.salespersonId) {
        toast.success('Salesperson account created successfully!');
        router.push('/manager/salespeople'); 
        router.refresh(); 
      } else {
        setError(result.error || 'An unexpected error occurred.');
        toast.error(result.error || 'Failed to create salesperson.');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/manager/salespeople">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Team List</span>
          </Link>
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
          <UserPlus className="w-7 h-7 mr-3 text-primary" /> Add New Salesperson
        </h1>
      </header>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Salesperson Account & Details</CardTitle>
            <CardDescription>
              Fill in the information for the new team member. An account will be created with the provided email and password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-md flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input 
                id="full_name" 
                name="full_name" 
                value={formData.full_name || ''} 
                onChange={handleChange} 
                placeholder="e.g., Priya Sharma"
                required 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email || ''} 
                  onChange={handleChange} 
                  placeholder="e.g., priya.sharma@example.com"
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password *</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  value={formData.password || ''} 
                  onChange={handleChange} 
                  placeholder="Min. 6 characters"
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="employee_id">Employee ID (Optional)</Label>
                <Input 
                  id="employee_id" 
                  name="employee_id" 
                  value={formData.employee_id || ''} 
                  onChange={handleChange} 
                  placeholder="e.g., EMP001"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assigned_showroom_id">Assign to Showroom *</Label>
                <Select 
                  name="assigned_showroom_id" 
                  value={formData.assigned_showroom_id || undefined} 
                  onValueChange={(value) => handleSelectChange('assigned_showroom_id', value)}
                  required
                >
                  <SelectTrigger id="assigned_showroom_id">
                    <SelectValue placeholder="Select a showroom" />
                  </SelectTrigger>
                  <SelectContent>
                    {showrooms.length === 0 && <SelectItem value="loading" disabled>Loading showrooms...</SelectItem>}
                    {showrooms.map(showroom => (
                      <SelectItem key={showroom.id} value={showroom.id}>
                        {showroom.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
             <p className="text-xs text-muted-foreground pt-2">
                The salesperson will be able to log in using the email and password provided. Their profile will be active.
            </p>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isPending} className="w-full md:w-auto">
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Salesperson...</>
              ) : (
                <><UserPlus className="mr-2 h-4 w-4" /> Create Salesperson Account</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 