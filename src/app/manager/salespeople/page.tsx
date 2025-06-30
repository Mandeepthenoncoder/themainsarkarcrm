import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTeamMembersAction, SalespersonProfile } from './actions';
import { Users, UserPlus, Eye, Building, Mail, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const getInitials = (name: string | null) => {
  if (!name) return 'N/A';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export default async function TeamMembersPage() {
  const { success, teamMembers, error } = await getTeamMembersAction();

  if (!success || !teamMembers) {
    return (
      <div className="space-y-6">
        <header className="bg-card shadow-sm rounded-lg p-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
            <Users className="w-8 h-8 mr-3 text-primary"/> My Team Members
          </h1>
          <p className="text-muted-foreground mt-1">Manage and view your sales team.</p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {error || "Could not load team members. Please try again later."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
              <Users className="w-8 h-8 mr-3 text-primary"/> My Team Members
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and view your sales team. ({teamMembers.length} members)
            </p>
          </div>
          {/* <Link href="/manager/salespeople/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add New Salesperson
            </Button>
          </Link> */}
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Team List</CardTitle>
          <CardDescription>
            Salespeople reporting directly to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {teamMembers.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold">No Team Members Yet</h3>
              <p className="mt-1 text-sm">
                Salesperson profiles are managed directly in the database.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] hidden sm:table-cell">Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Employee ID</TableHead>
                    <TableHead>Assigned Showroom</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member: SalespersonProfile) => (
                    <TableRow key={member.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || 'User'} />
                          <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{member.full_name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{member.email || 'No email'}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {member.email && 
                          <div className="flex items-center text-xs">
                            <Mail className="h-3 w-3 mr-1.5 text-muted-foreground" /> {member.email}
                          </div>}
                        {member.phone_number && 
                          <div className="flex items-center text-xs mt-0.5 text-muted-foreground">
                            <Briefcase className="h-3 w-3 mr-1.5" /> {member.phone_number} {/* Using Briefcase as generic contact icon if needed */}
                          </div>}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {member.employee_id || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {member.showrooms?.name ? (
                          <Badge variant="outline" className="flex items-center w-fit">
                            <Building className="h-3 w-3 mr-1.5" />
                            {member.showrooms.name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Assigned</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 