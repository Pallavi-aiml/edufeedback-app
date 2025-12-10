// app/student/register/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Loader2 } from "lucide-react";
import { AxiosError } from "axios";

export default function StudentRegister() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        collegeCode: "", // <-- Changed to collegeCode
        currentSemester: "",
        department: ""
    });

    // We don't need to fetch institutions anymore
    // useEffect(...) is removed

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (!formData.name || !formData.email || !formData.password || !formData.collegeCode || !formData.currentSemester || !formData.department) {
             return toast.error("Please fill out all fields.");
        }
        
        setIsLoading(true);
        try {
            const response = await api.post("/auth/register-student", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                collegeCode: formData.collegeCode, // <-- Send collegeCode
                currentSemester: formData.currentSemester,
                department: formData.department
            });
            toast.success(response.data.msg || "Registration successful! Check your email.");
            router.push("/student/verify");
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
                    <GraduationCap className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <CardTitle className="text-2xl">Create Student Account</CardTitle>
                    <CardDescription>Join your institution's feedback portal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">University Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required disabled={isLoading} />
                        </div>

                        {/* --- Changed to College Code Input --- */}
                        <div className="space-y-2">
                            <Label htmlFor="collegeCode">College Code</Label>
                            <Input id="collegeCode" name="collegeCode" placeholder="Enter the code from your admin" value={formData.collegeCode} onChange={handleInputChange} required />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* --- Current Semester Dropdown --- */}
                            <div className="space-y-2">
                                <Label>Current Semester</Label>
                                <Select required onValueChange={(value) => setFormData(prev => ({...prev, currentSemester: value}))}>
                                    <SelectTrigger><SelectValue placeholder="-- Select semester --" /></SelectTrigger>
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

                            {/* --- Department Dropdown --- */}
                            <div className="space-y-2">
                                <Label>Your Department</Label>
                                <Select required onValueChange={(value) => setFormData(prev => ({...prev, department: value}))}>
                                    <SelectTrigger><SelectValue placeholder="-- Select department --" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                                        <SelectItem value="ECE">Electronics (ECE)</SelectItem>
                                        <SelectItem value="EEE">Electrical (EEE)</SelectItem>
                                                            <SelectItem value="AIE">Artificial Intelligence (AIE)</SelectItem>
                                                            <SelectItem value="MLE">Machine Learning (MLE)</SelectItem>
                                                            <SelectItem value="DSE">Data Science (DSE)</SelectItem>
                                                            <SelectItem value="ISE">Information Science(ISE)</SelectItem>
                                                            <SelectItem value="AE">Aeronatics (AE)</SelectItem>
                                                            <SelectItem value="CHE">Chemical (CHE)</SelectItem>
                                        <SelectItem value="MECH">Mechanical (MECH)</SelectItem>
                                        <SelectItem value="CIVIL">Civil</SelectItem>
                                        {/* Add more as needed */}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required disabled={isLoading} />
                            </div>
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}