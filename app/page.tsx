import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, BarChart3, Users, Zap, TrendingUp, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">EduFeedback</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            EduFeedback
            <span className="block text-green-600">Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Streamlining educational feedback for better learning outcomes and institutional excellence
          </p>

          {/* Feature Icons */}
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-12 mb-16">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-green-600" />
              <span className="text-lg font-medium">Smart Feedback</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-green-600" />
              <span className="text-lg font-medium">Real-time Analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-green-600" />
              <span className="text-lg font-medium">Multi-user Platform</span>
            </div>
          </div>
        </div>
      </section>

      {/* Access Type Selection */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Choose Your Access Type</h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Select your role to access the appropriate platform features
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Student Portal Card */}
            <Card className="border-2 hover:border-green-500 transition-colors">
              <CardHeader className="text-center">
                <GraduationCap className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Student Portal</CardTitle>
                <CardDescription className="text-lg">
                  Submit feedback and track your academic experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Course feedback forms</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Anonymous submissions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Progress tracking</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/student/login">Access Student Portal</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Admin Dashboard Card */}
            <Card className="border-2 hover:border-green-500 transition-colors">
              <CardHeader className="text-center">
                <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
                <CardDescription className="text-lg">Manage feedback and view comprehensive analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Analytics dashboard</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Feedback management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Report generation</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/admin/login">Access Admin Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl my-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why Choose EduFeedback?</h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Our platform combines ease of use with powerful analytics to transform educational feedback
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Forms</h3>
              <p className="text-gray-600">Intuitive feedback forms designed for maximum engagement</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">Instant insights and comprehensive reporting tools</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-role Support</h3>
              <p className="text-gray-600">Tailored experiences for students and administrators</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
