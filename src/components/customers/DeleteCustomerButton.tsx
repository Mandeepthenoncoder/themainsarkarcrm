"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteCustomerAction, DeleteCustomerResult } from '@/app/admin/customers/actions';

interface DeleteCustomerButtonProps {
  customerId: string;
  customerName: string;
  customerEmail?: string | null;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  redirectAfterDelete?: boolean;
}

export function DeleteCustomerButton({ 
  customerId, 
  customerName, 
  customerEmail,
  variant = "destructive",
  size = "sm",
  showText = false,
  redirectAfterDelete = false
}: DeleteCustomerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();



  const handleDelete = () => {
    setError(null);
    
    startTransition(async () => {
      try {
        const result: DeleteCustomerResult = await deleteCustomerAction(customerId);
        
        if (result.success) {
          setIsOpen(false);
          if (redirectAfterDelete) {
            // Redirect to customers list from detail page
            router.push('/admin/customers');
          }
          // The page will automatically refresh due to revalidatePath in the action
        } else {
          setError(result.error || "Failed to delete customer");
        }
      } catch (err) {
        console.error("Delete customer error:", err);
        setError("An unexpected error occurred");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="gap-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <Trash2 className="h-3 w-3" />
          {showText && "Delete"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Customer
          </DialogTitle>
          <DialogDescription className="text-left">
            You are about to permanently delete this customer record. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="font-semibold text-sm">Customer Details:</p>
            <p className="text-sm mt-1">
              <strong>Name:</strong> {customerName}
            </p>
            {customerEmail && (
              <p className="text-sm">
                <strong>Email:</strong> {customerEmail}
              </p>
            )}
          </div>
          
                     <Alert className="mt-4 border-destructive/50">
             <AlertTriangle className="h-4 w-4" />
             <AlertDescription>
               <strong>Warning:</strong> All customer data including visit logs, call logs, 
               interest categories, and purchase history will be permanently deleted.
               {isPending && <div className="mt-2 text-xs text-muted-foreground">Please wait while we process the deletion...</div>}
             </AlertDescription>
           </Alert>
          
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Customer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 