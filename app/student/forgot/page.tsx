/// app/student/forgot/page.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios"; // <-- FIX: Import AxiosError
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function StudentForgotPassword() {
    const [step, setStep] = useState<"email" | "reset">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post("/auth/forgot-password", { email });
            toast.success(response.data.msg || "Reset code sent!");
            setStep("reset");
        } catch (error) {
            // <-- FIX: Add type guard for safe error handling
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.msg || "Request failed.");
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post("/auth/reset-password", { email, code, newPassword });
            toast.success(response.data.msg || "Password reset successfully!");
            router.push("/student/login");
        } catch (error) {
            // <-- FIX: Add type guard for safe error handling
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.msg || "Reset failed.");
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Reset Student Password</CardTitle>
                    <CardDescription>
                        {step === "email" ? "Enter your email to receive a reset code" : "Enter the code and a new password"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === "email" ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                            </div>
                            <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Send Reset Code
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Verification Code</Label>
                                <Input type="text" value={code} onChange={(e) => setCode(e.target.value)} required disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isLoading} />
                            </div>
                            <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Change Password
                            </Button>
                        </form>
                    )}
                     <div className="mt-4 text-center text-sm">
                        <Link href="/student/login" className="flex items-center justify-center space-x-2 text-green-600 hover:text-green-700">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Login</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}