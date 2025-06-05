"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { BarChart3, Github, Clock, Wrench, ArrowRight, Database, TrendingUp, PieChart } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  <Link href="https://github.com/zenifieduk/dna-1" target="_blank">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Link>
                </Button>
              </div>
              
              {/* Mobile Menu */}
              <MobileMenu currentPage="dashboard" />
            </div>
          </nav>
        </div>
      </header>

      {/* Coming Soon Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
              <Wrench className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          {/* Main Content */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-primary">Dashboard</span>
            <span className="block text-2xl md:text-3xl font-normal text-muted-foreground mt-2">
              Coming Soon
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
            We&apos;re currently building an interactive dashboard that will showcase comprehensive data visualisation capabilities.
          </p>
          
          {/* Coming Soon Features */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 md:p-12 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
              What&apos;s Coming
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-3 p-6 bg-blue-50 rounded-lg">
                <Database className="h-8 w-8 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Data Analytics</h3>
                <p className="text-sm text-blue-700 text-center">
                  Advanced analytics and insights from FA Four Corner Model data
                </p>
              </div>
              
              <div className="flex flex-col items-center space-y-3 p-6 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <h3 className="font-semibold text-green-900">Performance Trends</h3>
                <p className="text-sm text-green-700 text-center">
                  Historical performance tracking and trend analysis
                </p>
              </div>
              
              <div className="flex flex-col items-center space-y-3 p-6 bg-purple-50 rounded-lg">
                <PieChart className="h-8 w-8 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Interactive Charts</h3>
                <p className="text-sm text-purple-700 text-center">
                  Dynamic visualisations and interactive data exploration
                </p>
              </div>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="bg-slate-100 rounded-xl p-6 mb-12">
            <div className="flex items-center justify-center space-x-3 text-slate-600">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Expected launch: Coming Soon</span>
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
              <Link href="/">
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Overview
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 