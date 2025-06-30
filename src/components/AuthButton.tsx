"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut, LogIn } from 'lucide-react'; // Using lucide-react for icons

export default function AuthButton() {
  const { user, profile, signOut, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <Button variant="outline" size="sm" disabled>Loading...</Button>;
  }

  if (user && profile) {
    return (
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="text-sm text-background">
          <p className="font-semibold">{profile.full_name || user.email}</p>
          <p className="text-xs opacity-80">({profile.role})</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={async () => await signOut()} 
          className="w-full justify-start text-background hover:bg-background/10 hover:text-background focus-visible:ring-background"
        >
          <LogOut className="mr-2 h-4 w-4" /> 
          <span>Logout</span>
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
      <LogIn className="mr-2 h-4 w-4" /> Login
    </Button>
  );
} 