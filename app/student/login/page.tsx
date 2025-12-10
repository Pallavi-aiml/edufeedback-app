// app/student/login/page.tsx

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
import { GraduationCap, Loader2 } from "lucide-react";

// 1. Move all the logic into this inner component
function StudentLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Logic to pass institutionId to the register page
    const institutionId = searchParams.get('institutionId');
    const registerUrl = institutionId ? `/student/register?institutionId=${institutionId}` : '/student/register';
    const forgotPasswordUrl = institutionId ? `/student/forgot?institutionId=${institutionId}` : '/student/forgot';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post("/auth/login", { email, password });

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                toast.success("Login successful!");
                router.push("/student/feedback");
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
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <GraduationCap className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Student Portal Login</CardTitle>
                <CardDescription>Access your feedback dashboard</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
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
export default function StudentLogin() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-center text-gray-500">Loading student portal...</div>}>
                <StudentLoginForm />
            </Suspense>
        </div>
    );
}