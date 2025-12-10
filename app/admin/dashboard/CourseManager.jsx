// app/admin/dashboard/CourseManager.jsx
"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-hot-toast';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Loader2 } from 'lucide-react';

export default function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
      courseCode: '', courseName: '', instructor: '', department: '', semester: '' 
  });
  // --- NEW: State for department filter ---
  const [departmentFilter, setDepartmentFilter] = useState('');

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
        // Build query params
        const params = new URLSearchParams();
        if (departmentFilter) {
            params.append('department', departmentFilter);
        }
        
        // Pass params to api.get
        const res = await api.get('/courses', { params });
        setCourses(res.data.data);
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch courses.");
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch courses when the filter changes
  useEffect(() => {
    fetchCourses();
  }, [departmentFilter]); // Dependency array

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!formData.courseCode || !formData.courseName || !formData.instructor || !formData.department || !formData.semester) {
         return toast.error("Please fill all fields.");
    }
    setIsSubmitting(true);
    try {
      await api.post('/courses', formData);
      toast.success('Course created successfully!');
      fetchCourses(); // Refresh the list
      setFormData({ courseCode: '', courseName: '', instructor: '', department: '', semester: '' });
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId) => { /* ... same as before ... */ };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- Add Course Card (Col 1) --- */}
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle>Add New Course</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <Input name="courseCode" value={formData.courseCode} onChange={handleInputChange} placeholder="Course Code" required />
            <Input name="courseName" value={formData.courseName} onChange={handleInputChange} placeholder="Course Name" required />
            <Input name="instructor" value={formData.instructor} onChange={handleInputChange} placeholder="Instructor Name" required />
            
            {/* Department Dropdown for ADDING */}
            <Select required onValueChange={(value) => setFormData(prev => ({...prev, department: value}))} value={formData.department}>
                <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
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
                </SelectContent>
            </Select>

            {/* Semester Dropdown for ADDING */}
            <Select required onValueChange={(value) => setFormData(prev => ({...prev, semester: value}))} value={formData.semester}>
                <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
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
            
            <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Adding...' : 'Add Course'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* --- Existing Courses Card (Col 2-3) --- */}
      <Card className="lg:col-span-2">
        <CardHeader>
            <CardTitle>Existing Courses</CardTitle>
            {/* --- NEW: Department Filter Dropdown --- */}
            <div className="pt-2">
                <Label>Filter by Department</Label>
                <Select onValueChange={(value) => setDepartmentFilter(value === 'all' ? '' : value)} defaultValue="all">
                    <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Filter..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
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
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <p>Loading courses...</p>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <div key={course._id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                <div>
                  <p className="font-semibold">{course.courseCode} ({course.semester}) - {course.department}</p>
                  <p className="text-sm text-gray-600">{course.courseName} - Prof. {course.instructor}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(course._id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No courses found for this institution or filter.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}