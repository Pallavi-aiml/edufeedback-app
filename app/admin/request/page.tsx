// app/admin/request/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Loader2 } from "lucide-react";
import { AxiosError } from "axios";

export default function AdminRegister() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        institutionName: "", // Admin provides institution name
        password: "",
        confirmPassword: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (!formData.name || !formData.email || !formData.password || !formData.institutionName) {
            return toast.error("Please fill out all fields.");
        }

        setIsLoading(true);
        try {
            const response = await api.post("/auth/register-admin", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                institutionName: formData.institutionName, // Send name
            });
            toast.success(response.data.msg || "Registration successful! Check your email.");
            // You could show them their college code here:
            if (response.data.collegeCode) {
                toast.success(`Your unique College Code for students is: ${response.data.collegeCode}`);
            }
            router.push("/admin/verify");
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.msg || "Registration failed.");
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <CardTitle className="text-2xl">Create Admin Account</CardTitle>
                    <CardDescription>Register your institution and create your admin account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Official Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="institutionName">Institution Name</Label>
                            <Input id="institutionName" name="institutionName" placeholder="e.g., Bengaluru Pilot College" value={formData.institutionName} onChange={handleInputChange} required />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign In
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}