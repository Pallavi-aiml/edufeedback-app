// app/student/verify/page.jsx

"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios"; // <-- FIX 1: Import AxiosError
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function StudentVerify() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post("/auth/verify", { email, code: otp });
            toast.success(response.data.msg || "Verification successful! You can now log in.");
        } catch (error) {
            // <-- FIX 2: Add the type guard for safe error handling
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.msg || "Verification failed.");
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Verify Your Student Account</CardTitle>
                    <CardDescription>Enter the 6-digit code sent to your email address.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                placeholder="The email you registered with"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Verification Code</Label>
                            <Input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                                disabled={isLoading}
                                placeholder="_ _ _ _ _ _"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Verify Account
                        </Button>
                        <div className="text-center text-sm pt-2">
                            Already verified?{" "}
                            <Link href="/student/login" className="font-medium text-green-600 hover:underline">
                                Log In 
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}