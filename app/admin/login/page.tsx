// app/admin/login/page.tsx

"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";

// 1. We move all the logic into this inner component
function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams(); // This is the hook causing the issue

    const institutionId = searchParams.get('institutionId');
    const registerUrl = institutionId ? `/admin/request?institutionId=${institutionId}` : '/admin/request';
    const forgotPasswordUrl = institutionId ? `/admin/forgot?institutionId=${institutionId}` : '/admin/forgot';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post("/auth/login", { email, password });

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                console.log("Token SAVED:", response.data.token);
                toast.success("Admin login successful!");
                router.push("/admin/dashboard");
            } else {
                toast.error("Login failed. Please try again.");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.msg || "An error occurred during login.");
            } else {
                toast.error("An unexpected error occurred.");
                console.error(error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Admin Portal</CardTitle>
                <CardDescription>Secure access for institutional administrators</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Admin Email</Label>
                        <Input id="email" type="email" placeholder="admin.email@institution.edu" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Enter your admin password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? "Logging In..." : "Log In"}
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm space-y-2">
                    <div>
                        <Link href={forgotPasswordUrl} className="font-medium text-green-600 hover:underline">
                            Forgot your password?
                        </Link>
                    </div>
                    <div>
                        <span>No account? </span>
                        <Link href={registerUrl} className="font-medium text-green-600 hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// 2. The main export now wraps the form in Suspense
export default function AdminLogin() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-center">Loading login form...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}