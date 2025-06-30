"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Settings,
    SlidersHorizontal,
    UsersRound,
    BellDot,
    Database,
    Save
} from 'lucide-react';

export default function SystemSettingsPage() {
    // Mock states for some example settings
    const [siteName, setSiteName] = useState("Mangathriya Jewels CRM");
    const [defaultCurrency, setDefaultCurrency] = useState("INR");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [dataRetentionDays, setDataRetentionDays] = useState(365);

    const handleSaveChanges = () => {
        // In a real app, this would call an API to save settings
        console.log("Saving settings:", { siteName, defaultCurrency, emailNotifications, dataRetentionDays });
        // Add a toast notification for success/failure
    };

    return (
        <div className="space-y-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <Settings className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">System Configuration & Settings</h1>
                        <p className="text-muted-foreground mt-1">Manage global settings and configurations for the CRM.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* General Settings Example */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center"><SlidersHorizontal className="h-5 w-5 mr-2"/> General Settings</CardTitle>
                        <CardDescription>Basic operational parameters for the application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="siteName">Application Name</Label>
                            <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="CRM Name" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="defaultCurrency">Default Currency</Label>
                            {/* This would ideally be a Select component populated with currency options */}
                            <Input id="defaultCurrency" value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} placeholder="e.g., USD, EUR, INR" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <Label htmlFor="maintenanceMode" className="text-base">Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Temporarily disable access for non-admin users.
                                </p>
                            </div>
                            <Switch id="maintenanceMode" /> {/* Add state if needed */}
                        </div>
                    </CardContent>
                </Card>

                {/* Role Management Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><UsersRound className="h-5 w-5 mr-2"/> Role Management</CardTitle>
                        <CardDescription>Define and manage user roles and permissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">This section will allow configuration of roles (Admin, Manager, Salesperson) and their specific permissions within the system.</p>
                        <Button variant="outline" className="mt-4 w-full" disabled>Manage Roles (Coming Soon)</Button>
                    </CardContent>
                </Card>

                {/* Notification Preferences Example */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><BellDot className="h-5 w-5 mr-2"/> Notification Settings</CardTitle>
                        <CardDescription>Configure system-wide notification preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm">
                            <Label htmlFor="emailNotifications" className="flex flex-col space-y-1">
                                <span>System Email Notifications</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Enable or disable global email alerts for critical events.
                                </span>
                            </Label>
                            <Switch 
                                id="emailNotifications" 
                                checked={emailNotifications} 
                                onCheckedChange={setEmailNotifications} 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="adminEmail">Administrator Email</Label>
                            <Input id="adminEmail" type="email" placeholder="admin@example.com"/>
                             <p className="text-xs text-muted-foreground">Primary contact for system alerts.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management Placeholder */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center"><Database className="h-5 w-5 mr-2"/> Data Management</CardTitle>
                        <CardDescription>Settings related to data storage, backup, and retention.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-1.5">
                            <Label htmlFor="dataRetentionDays">Data Retention Period (Days)</Label>
                            <Input id="dataRetentionDays" type="number" value={dataRetentionDays} onChange={(e) => setDataRetentionDays(parseInt(e.target.value,10) || 0)} placeholder="e.g., 365" />
                            <p className="text-xs text-muted-foreground">How long to keep historical data like audit logs or soft-deleted records.</p>
                        </div>
                        <Button variant="outline" className="w-full" disabled>Manage Backups (Coming Soon)</Button>
                        <Button variant="destructive" className="w-full mt-2" disabled>Purge Old Data (Coming Soon)</Button>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 flex justify-end">
                <Button onClick={handleSaveChanges} size="lg">
                    <Save className="mr-2 h-4 w-4"/> Save All Settings
                </Button>
            </div>
        </div>
    );
} 