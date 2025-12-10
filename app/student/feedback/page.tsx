// app/student/feedback/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, Check, Loader2, GraduationCap, LogOut, User } from "lucide-react";
import Link from "next/link";

// --- TYPE DEFINITIONS ---
interface Course {
    _id: string;
    courseCode: string;
    courseName: string;
    instructor: string;
    semester: string;
}

// State for data to be submitted
interface FormData {
    courseId: string | null;
    semester: string;
    ratings: {
        overall: number;
        instructor: number;
        content: number;
    };
    workload: string;
    difficulty: string;
    submissionType: "anonymous" | "identified";
}

// State specifically for the feedback text areas
interface FeedbackText {
    positive: string;
    improvement: string;
    additional: string;
}

// --- REUSABLE COMPONENTS ---
const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void; }) => (
    <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => onChange(star)} className="focus:outline-none">
                <Star className={`h-6 w-6 transition-colors ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-gray-400"}`} />
            </button>
        ))}
    </div>
);

const SubmissionSuccess = () => (
    <div className="text-center py-12 flex flex-col items-center">
        <Check className="h-16 w-16 text-green-500 bg-green-100 rounded-full p-2" />
        <h2 className="mt-4 text-2xl font-bold">Feedback Submitted!</h2>
        <p className="mt-2 text-gray-600">Thank you for helping us improve. Your voice is heard.</p>
        <Button onClick={() => window.location.reload()} className="mt-6">
            Submit Another Form
        </Button>
    </div>
);

// --- MAIN COMPONENT ---
export default function StudentFeedback() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        courseId: null,
        semester: "",
        ratings: { overall: 0, instructor: 0, content: 0 },
        workload: "",
        difficulty: "",
        submissionType: "anonymous",
    });

    const [feedbackText, setFeedbackText] = useState<FeedbackText>({
        positive: "",
        improvement: "",
        additional: "",
    });

    const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);

    // Fetch courses on load (backend auto-filters by student's semester/dept)
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/courses');
                setCourses(response.data.data);
                if (response.data.data.length === 0) {
                    toast.error("No courses found for your current semester/department. Please update your profile.", { duration: 4000 });
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    toast.error(error.response?.data?.message || "Could not load courses.");
                } else {
                    toast.error("An unexpected error occurred loading courses.");
                }
            }
        };
        fetchCourses();
    }, []); // Runs once on page load

    // --- FORM HANDLERS ---
    const handleCourseSelectChange = (value: string) => {
        const selected = courses.find(course => course._id === value);
        if (selected) {
            setFormData(prev => ({ 
                ...prev, 
                courseId: value,
                semester: selected.semester // Auto-set semester from course
            }));
            setSelectedCourseDetails(selected);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Use id of textarea ('positive', 'improvement', 'additional')
        setFeedbackText(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSelectChange = (id: 'workload' | 'difficulty', value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleRatingChange = (category: keyof FormData['ratings'], value: number) => {
        setFormData(prev => ({ ...prev, ratings: { ...prev.ratings, [category]: value } }));
    };

    const handleSubmissionTypeChange = (value: "anonymous" | "identified") => {
        setFormData(prev => ({ ...prev, submissionType: value }));
    };
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success('Logged out successfully.');
        router.push('/'); // Redirect to home/landing page
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.courseId || !formData.semester || formData.ratings.overall === 0 ||
            !formData.workload || !formData.difficulty || !feedbackText.positive || !feedbackText.improvement) {
            return toast.error("Please fill out all required fields.");
        }
        setIsLoading(true);

        const combinedFeedback = `Positive: ${feedbackText.positive}\nImprovements: ${feedbackText.improvement}\nAdditional: ${feedbackText.additional}`.trim();

        try {
            await api.post('/feedback', {
                courseId: formData.courseId,
                rating: formData.ratings,
                feedback: combinedFeedback,
                semester: formData.semester,
                workload: formData.workload,
                difficulty: formData.difficulty,
                // You can also send submissionType: formData.submissionType if needed
            });
            setIsSubmitted(true);
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Failed to submit feedback.");
            } else {
                toast.error("An unexpected error occurred during submission.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
            {/* --- HEADER with Profile and Logout --- */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <GraduationCap className="h-8 w-8 text-green-600" />
                            <div>
                                <span className="text-xl font-bold text-gray-900">EduFeedback</span>
                                <div className="text-sm text-gray-600">Student Portal</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/student/profile">
                                    <User className="h-4 w-4 mr-2" />
                                    My Profile
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Form Content --- */}
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-4xl mx-auto border-2">
                    <CardHeader>
                        <CardTitle className="text-2xl">Course Feedback Form</CardTitle>
                        <CardDescription>Your honest feedback is crucial for academic improvement.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSubmitted ? (
                            <SubmissionSuccess />
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Course Selection & Info Display */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Course Selection</h3>
                                    <div className="space-y-2">
                                        <Label>Select Course (For your semester & department) *</Label>
                                        <Select required onValueChange={handleCourseSelectChange}>
                                            <SelectTrigger><SelectValue placeholder="-- Select a course --" /></SelectTrigger>
                                            <SelectContent>
                                                {courses.length > 0 ? courses.map((course) => (
                                                    <SelectItem key={course._id} value={course._id}>
                                                        {course.courseCode} - {course.courseName} (Prof. {course.instructor})
                                                    </SelectItem>
                                                )) : <div className="p-4 text-sm text-gray-500">No courses found. Update your profile?</div>}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {selectedCourseDetails && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-md border p-4 bg-gray-50">
                                            <div>
                                                <Label className="text-sm text-gray-600">Course Code</Label>
                                                <p className="font-medium text-lg">{selectedCourseDetails.courseCode}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-gray-600">Instructor</Label>
                                                <p className="font-medium text-lg">{selectedCourseDetails.instructor}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-gray-600">Semester</Label>
                                                <p className="font-medium text-lg">{selectedCourseDetails.semester}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Ratings */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center"><Star className="h-5 w-5 mr-2 text-yellow-400" /> Ratings *</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2"> <Label>Overall Course Rating</Label> <StarRating value={formData.ratings.overall} onChange={(v) => handleRatingChange('overall', v)} /> </div>
                                        <div className="space-y-2"> <Label>Instructor Effectiveness</Label> <StarRating value={formData.ratings.instructor} onChange={(v) => handleRatingChange('instructor', v)} /> </div>
                                        <div className="space-y-2"> <Label>Content Quality</Label> <StarRating value={formData.ratings.content} onChange={(v) => handleRatingChange('content', v)} /> </div>
                                        <div className="space-y-2">
                                            <Label>Workload Assessment *</Label>
                                            <Select required onValueChange={(value) => handleSelectChange('workload', value)}>
                                                <SelectTrigger><SelectValue placeholder="Select workload" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="very-light">Very Light</SelectItem>
                                                    <SelectItem value="light">Light</SelectItem>
                                                    <SelectItem value="moderate">Moderate</SelectItem>
                                                    <SelectItem value="heavy">Heavy</SelectItem>
                                                    <SelectItem value="very-heavy">Very Heavy</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Difficulty Level *</Label>
                                        <Select required onValueChange={(value) => handleSelectChange('difficulty', value)}>
                                            <SelectTrigger className="max-w-xs"><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="very-easy">Very Easy</SelectItem>
                                                <SelectItem value="easy">Easy</SelectItem>
                                                <SelectItem value="moderate">Moderate</SelectItem>
                                                <SelectItem value="difficult">Difficult</SelectItem>
                                                <SelectItem value="very-difficult">Very Difficult</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Written Feedback */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Written Feedback</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="positive">What did you like most? *</Label>
                                        <Textarea id="positive" value={feedbackText.positive} onChange={handleInputChange} placeholder="Strengths..." className="min-h-[100px]" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="improvement">What could be improved? *</Label>
                                        <Textarea id="improvement" value={feedbackText.improvement} onChange={handleInputChange} placeholder="Suggestions..." className="min-h-[100px]" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="additional">Additional Comments (Optional)</Label>
                                        <Textarea id="additional" value={feedbackText.additional} onChange={handleInputChange} placeholder="Anything else..." className="min-h-[100px]" />
                                    </div>
                                </div>

                                {/* Privacy Options */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Privacy Options</h3>
                                    <RadioGroup value={formData.submissionType} onValueChange={handleSubmissionTypeChange}>
                                        <div className="flex items-center space-x-2"> <RadioGroupItem value="anonymous" id="anonymous" /> <Label htmlFor="anonymous">Anonymous (Recommended)</Label> </div>
                                        <div className="flex items-center space-x-2"> <RadioGroupItem value="identified" id="identified" /> <Label htmlFor="identified">Include my identity</Label> </div>
                                    </RadioGroup>
                                    <p className="text-sm text-gray-600">Anonymous feedback is generally preferred for honesty.</p>
                                </div>

                                {/* Submit Button */}
                                <Button type="submit" disabled={isLoading} className="w-full py-6 text-lg bg-green-600 hover:bg-green-700">
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                                    {isLoading ? 'Submitting...' : 'Submit Feedback'}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}