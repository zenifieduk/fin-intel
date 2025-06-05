"use client"

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { BarChart3, Database, TrendingUp, PieChart, Github, User, Gauge, Navigation, LineChart, CheckCircle, Target, Activity } from "lucide-react"
import { MobileMenu } from "@/components/ui/mobile-menu"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Data Visualisation</span>
          </div>
          <div className="flex items-center space-x-6">
            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-6">
              <Button variant="ghost" asChild>
                <Link href="/">Overview</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/model">Four Corner Model</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="https://github.com" target="_blank">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Link>
              </Button>
            </div>
            
            {/* Mobile Menu */}
            <MobileMenu currentPage="home" />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Above the fold content */}
          <div className="text-center mb-20">
            <div className="mb-8">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-6">
                <Database className="h-4 w-4 mr-2" />
                Interactive Data Showcase
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              <span className="text-primary">Data Visualisation</span>
              <span className="block text-2xl md:text-3xl font-normal text-muted-foreground mt-2">
                FA Four Corner Model
              </span>
            </h1>
            
            {/* Professional Explainer */}
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
                A React-based mini site showcasing interactive data visualisation
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 md:p-12 text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                  FA Four Corner Model Visualisation
                </h2>
                
                <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
                  <p className="mb-6">
                    This mini site demonstrates modern React-based data visualisation techniques 
                    through an interactive display of the FA Four Corner Model. Built to showcase 
                    how complex data structures can be presented in an intuitive and engaging way.
                  </p>
                  
                  <p className="mb-6">
                    The visualisation leverages cutting-edge React components and data visualisation 
                    libraries to transform raw data into meaningful insights, providing an interactive 
                    experience that allows users to explore and understand the Four Corner Model&apos;s 
                    various dimensions and relationships.
                  </p>
                  
                  <p className="mb-8">
                    This platform serves as a foundation for understanding how data visualisation 
                    can enhance comprehension and decision-making through thoughtful design and 
                    interactive elements.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Interactive Charts</h4>
                        <p className="text-sm text-blue-700">Dynamic data visualisation</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-900">Real-time Updates</h4>
                        <p className="text-sm text-green-700">Live data representation</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                      <PieChart className="h-6 w-6 text-purple-600" />
                      <div>
                        <h4 className="font-semibold text-purple-900">Model Analysis</h4>
                        <p className="text-sm text-purple-700">Four Corner insights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-base px-8" asChild>
                <Link href="/model">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Explore Four Corner Model
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8" asChild>
                <Link href="https://github.com/zenifieduk/dna-1" target="_blank">
                  <Github className="h-4 w-4 mr-2" />
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>

          {/* Features Showcase */}
          <div className="border-t border-slate-200 pt-20 pb-20">
            <div className="text-center mb-16">
              <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 ring-1 ring-inset ring-green-600/20 mb-6">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Features
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-slate-900">
                Four Corner Model Implementation
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Professional player assessment system with comprehensive visualisation and authentic UK football terminology.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Player Profile Header */}
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-blue-900">Player Profile Header</h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-outside ml-5">
                  <li>James Richardson, 19-year-old English Central Midfielder</li>
                  <li>Club #23 with 82/100 overall rating</li>
                  <li>Professional layout with gradient avatar</li>
                </ul>
              </div>

              {/* Four Corner Gauges */}
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="mb-4">
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Gauge className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-red-900">Four Corner Gauges</h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-outside ml-5">
                  <li><span className="text-red-600 font-medium">Technical</span>: 85/100 - GREEN status</li>
                  <li><span className="text-yellow-600 font-medium">Physical</span>: 78/100 - AMBER status</li>
                  <li><span className="text-blue-600 font-medium">Psychological</span>: 86/100 - GREEN status</li>
                  <li><span className="text-green-600 font-medium">Social</span>: 81/100 - GREEN status</li>
                </ul>
              </div>

              {/* Interactive Tabs */}
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="mb-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Navigation className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-purple-900">Interactive Tabs</h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-outside ml-5">
                  <li>Overview: Radar chart, historical trends, recent matches</li>
                  <li>Technical/Tactical: 8 skills with ratings and trends</li>
                  <li>Physical: 8 attributes including endurance and speed</li>
                  <li>Psychological: 8 mental traits and decision making</li>
                  <li>Social: Communication and teamwork skills</li>
                </ul>
              </div>

              {/* Professional Visualizations */}
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-green-900">Professional Visualisations</h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-outside ml-5">
                  <li>Radar chart comparing player vs club averages</li>
                  <li>Historical development trend lines</li>
                  <li>Recent match performance table</li>
                  <li>Development priority progress bars</li>
                </ul>
              </div>

              {/* Development Plan */}
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="mb-4">
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-orange-900">Development Plan</h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-outside ml-5">
                  <li>Progress bars with completion tracking</li>
                  <li>Action plans with priority classifications</li>
                  <li>Coach comments and feedback system</li>
                  <li>Super strength and development area indicators</li>
                </ul>
              </div>

              {/* Authentic Details */}
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="mb-4">
                  <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-emerald-900">Authentic Details</h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-outside ml-5">
                  <li>UK football terminology throughout</li>
                  <li>Professional assessment language</li>
                  <li>RAG status badges (Red/Amber/Green)</li>
                  <li>EPPP compliant footer</li>
                </ul>
              </div>
            </div>

            {/* Call to Action for Features */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Experience the Complete System
                </h3>
                <p className="text-slate-600 mb-6">
                  See all these features in action with authentic data and professional UK football assessment standards.
                </p>
                <Button size="lg" className="text-base px-8" asChild>
                  <Link href="/model">
                    <Activity className="h-4 w-4 mr-2" />
                    View Live Implementation
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Below the fold - Technical Showcase */}
          <div className="border-t border-slate-200 pt-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-slate-900">
                Technical Foundation
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Built with modern React technologies and visualisation libraries for optimal performance and user experience.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">React Powered</h3>
                <p className="text-muted-foreground">
                  Built with Next.js 15 and React for optimal performance and modern development practices.
                </p>
              </div>
              
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Data Driven</h3>
                <p className="text-muted-foreground">
                  Comprehensive data visualisation tools designed specifically for the FA Four Corner Model.
                </p>
              </div>
              
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Interactive Experience</h3>
                <p className="text-muted-foreground">
                  Engaging visualisations that allow for deep exploration of the model&apos;s data points.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
