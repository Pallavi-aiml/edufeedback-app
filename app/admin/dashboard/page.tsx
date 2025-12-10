// app/admin/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import CourseManager from './CourseManager'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Star, BarChart3, TrendingUp, GraduationCap, UserCheck, BookOpen, LogOut } from "lucide-react";
import { SentimentBar } from "@/components/SentimentBar"; 

// --- TYPE DEFINITIONS ---
interface Course {
    _id: string;
    code: string;
    instructor: string;
    avgRating: string;
    count: number;
    positiveCount?: number;
    neutralCount?: number;
    negativeCount?: number;
}

// New type for the detailed breakdown
interface SentimentDetailItem {
    code: string;
    instructor: string;
    sem: string;
    dept: string;
    count: number;
}

interface AnalyticsData {
    success: boolean;
    totalFeedback: number;
    averageRating: {
        overall: string;
        instructor?: string;
        content?: string;
    };
    sentimentCount: {
        positive: number;
        neutral: number;
        negative: number;
    };
    // New field for detailed breakdown
    sentimentDetails: {
        positive: SentimentDetailItem[];
        neutral: SentimentDetailItem[];
        negative: SentimentDetailItem[];
    };
    topCourses: Course[];
    needsAttention: Course[];
}

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const response = await api.get("/feedback/analytics");
                if (response.data.success) {
                    setAnalytics(response.data);
                } else {
                    toast.error(response.data.message || "Failed to fetch analytics.");
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    toast.error(error.response?.data?.message || "Error fetching analytics.");
                } else {
                    toast.error("An unexpected error occurred fetching data.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (activeTab === 'overview') {
            fetchAnalytics();
        } else {
            setIsLoading(false); 
        }
    }, [activeTab]); 

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success('Logged out successfully.');
        router.push('/admin/login');
    };

    const formatRating = (rating?: string) => rating ? `${rating} / 5.0` : 'N/A';

    // --- NEW: Custom Tooltip Component ---
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            // Recharts data is nested in payload[0].payload
            const data = payload[0].payload; 
            const sentimentName = data.name;
            const color = data.fill;
            const details: SentimentDetailItem[] = data.details || [];

            return (
                <div className="bg-white p-3 border rounded-lg shadow-xl w-64 max-h-80 overflow-y-auto z-50">
                    <h4 className="font-bold text-base mb-2 capitalize border-b pb-1" style={{ color: color }}>
                        {sentimentName} Breakdown
                    </h4>
                    {details.length > 0 ? (
                        <div className="space-y-2">
                            {details.map((item, index) => (
                                <div key={index} className="text-xs bg-gray-50 p-2 rounded border border-gray-100">
                                    <div className="flex justify-between font-semibold text-gray-900">
                                        <span>{item.code}</span>
                                        <span className="bg-gray-200 px-1.5 rounded-md text-[10px] py-0.5">
                                            {item.count}
                                        </span>
                                    </div>
                                    <div className="text-gray-500 mt-1 truncate">
                                        {item.instructor}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                        {item.dept} • {item.sem}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic">No course details available.</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <header className="mb-8 flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                    <GraduationCap className="h-10 w-10 text-green-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500">Institutional Feedback Overview</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
            </header>

            <div className="border-b mb-6">
                 <div className="flex space-x-1 sm:space-x-2">
                    <Button variant={activeTab === 'overview' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('overview')}>
                        📊 Overview
                    </Button>
                    <Button variant={activeTab === 'courses' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('courses')}>
                        📚 Course Management
                    </Button>
                </div>
            </div>

            <div>
                {activeTab === 'overview' && isLoading && (
                    <div className="p-8 text-center">Loading analytics dashboard...</div>
                )}
                
                {activeTab === 'overview' && !isLoading && analytics && (
                    <div className="space-y-8 animate-in fade-in-50">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Feedback</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{analytics.totalFeedback}</div></CardContent></Card>
                            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Avg. Overall</CardTitle><Star className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatRating(analytics.averageRating.overall)}</div></CardContent></Card>
                            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Avg. Instructor</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatRating(analytics.averageRating.instructor)}</div></CardContent></Card>
                            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Avg. Content</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatRating(analytics.averageRating.content)}</div></CardContent></Card>
                            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Positive</CardTitle><TrendingUp className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{analytics.sentimentCount.positive}</div></CardContent></Card>
                        </div>

                        {/* Course Lists & Pie Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Top Performing */}
                            <Card className="lg:col-span-1">
                                <CardHeader><CardTitle>Top Performing</CardTitle><CardDescription>Highest rated courses</CardDescription></CardHeader>
                                <CardContent className="space-y-4">
                                    {analytics.topCourses.length > 0 ? analytics.topCourses.map((course) => (
                                        <div key={course._id} className="p-3 bg-green-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold">{course.code}</div>
                                                    <div className="text-sm text-gray-600">Prof. {course.instructor}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold flex items-center"><Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />{course.avgRating}</div>
                                                    <div className="text-xs text-gray-500">{course.count} reviews</div>
                                                </div>
                                            </div>
                                            <SentimentBar 
                                                positive={course.positiveCount || 0}
                                                neutral={course.neutralCount || 0}
                                                negative={course.negativeCount || 0}
                                            />
                                        </div>
                                    )) : <p className="text-sm text-gray-500">No courses rated yet.</p>}
                                </CardContent>
                            </Card>

                            {/* Needs Attention */}
                            <Card className="lg:col-span-1">
                                <CardHeader><CardTitle>Needs Attention</CardTitle><CardDescription>Lowest rated courses</CardDescription></CardHeader>
                                <CardContent className="space-y-4">
                                    {analytics.needsAttention.length > 0 ? analytics.needsAttention.map((course) => (
                                        <div key={course._id} className="p-3 bg-red-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold">{course.code}</div>
                                                    <div className="text-sm text-gray-600">Prof. {course.instructor}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-red-600 flex items-center"><Star className="h-4 w-4 mr-1 text-red-500" />{course.avgRating}</div>
                                                    <div className="text-xs text-gray-500">{course.count} reviews</div>
                                                </div>
                                            </div>
                                            <SentimentBar 
                                                positive={course.positiveCount || 0}
                                                neutral={course.neutralCount || 0}
                                                negative={course.negativeCount || 0}
                                            />
                                        </div>
                                    )) : <p className="text-sm text-gray-500">No courses rated low enough.</p>}
                                </CardContent>
                            </Card>

                            {/* --- PIE CHART WITH CUSTOM TOOLTIP --- */}
                            <Card className="lg:col-span-1">
                                <CardHeader><CardTitle>Sentiment Analysis</CardTitle><CardDescription>Hover for course breakdown</CardDescription></CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie 
                                                data={[ 
                                                    { 
                                                        name: "Positive", 
                                                        value: analytics.sentimentCount.positive, 
                                                        fill: "#10B981",
                                                        details: analytics.sentimentDetails?.positive // Pass details
                                                    }, 
                                                    { 
                                                        name: "Neutral", 
                                                        value: analytics.sentimentCount.neutral, 
                                                        fill: "#F59E0B",
                                                        details: analytics.sentimentDetails?.neutral 
                                                    }, 
                                                    { 
                                                        name: "Negative", 
                                                        value: analytics.sentimentCount.negative, 
                                                        fill: "#EF4444",
                                                        details: analytics.sentimentDetails?.negative 
                                                    } 
                                                ]} 
                                                dataKey="value" 
                                                nameKey="name" 
                                                cx="50%" 
                                                cy="50%" 
                                                outerRadius={80} 
                                                label
                                            >
                                                <Cell fill="#10B981" />
                                                <Cell fill="#F59E0B" />
                                                <Cell fill="#EF4444" />
                                            </Pie>
                                            {/* Use CustomTooltip component */}
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="animate-in fade-in-50">
                        <CourseManager />
                    </div>
                )}
            </div>
        </div>
    );
}