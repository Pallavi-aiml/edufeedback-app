// app/student/profile/page.tsx

"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface UserProfile {
    name: string;
    email: string;
    currentSemester: string;
    department: string;
}

export default function StudentProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile');
                setProfile(res.data.data);
            } catch (error) {
                toast.error("Could not load your profile.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setIsSaving(true);
        try {
            const res = await api.put('/auth/profile', {
                name: profile.name,
                currentSemester: profile.currentSemester,
                department: profile.department
            });
            setProfile(res.data.data);
            toast.success("Profile updated successfully!");
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.msg || "Failed to update profile.");
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) { return <div className="p-8">Loading profile...</div>; }
    if (!profile) { return <div className="p-8">Could not load profile.</div>; }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                                id="name" 
                                value={profile.name}
                                onChange={(e) => setProfile(p => ({ ...p!, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" value={profile.email} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Current Semester</Label>
                            <Select 
                                value={profile.currentSemester}
                                onValueChange={(value) => setProfile(p => ({ ...p!, currentSemester: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your current semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Semester 1">Semester 1</SelectItem>
                                    <SelectItem value="Semester 2">Semester 2</SelectItem>
                                    <SelectItem value="Semester 3">Semester 3</SelectItem>
                                    <SelectItem value="Semester 4">Semester 4</SelectItem>
                                    <SelectItem value="Semester 5">Semester 5</SelectItem>
                                    <SelectItem value="Semester 6">Semester 6</SelectItem>
                                    <SelectItem value="Semester 7">Semester 7</SelectItem>
                                    <SelectItem value="Semester 8">Semester 8</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Your Department</Label>
                            <Select 
                                value={profile.department}
                                onValueChange={(value) => setProfile(p => ({ ...p!, department: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                                    <SelectItem value="ECE">Electronics (ECE)</SelectItem>
                                    <SelectItem value="MECH">Mechanical (MECH)</SelectItem>
                                    <SelectItem value="CIVIL">Civil</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-between items-center">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button variant="link" asChild>
                                <Link href="/student/feedback">Back to Feedback</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}