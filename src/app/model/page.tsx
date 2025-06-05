"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Minus, User, Activity, Brain, Users, Target, Calendar, Award, CheckCircle, Clock, BarChart3, Github } from 'lucide-react';

// Type definitions
interface PlayerData {
  profile: {
    name: string;
    age: number;
    position: string;
    clubNumber: number;
    nationality: string;
    height: string;
    weight: string;
    clubTenure: string;
  };
  currentAssessment: {
    date: string;
    assessmentPeriod: string;
    overallRating: number;
    nextReview: string;
  };
  fourCorners: {
    technical: {
      overallScore: number;
      status: string;
      metrics: Array<{
        skill: string;
        current: number;
        clubAvg: number;
        trend: string;
        priority: string;
      }>;
    };
    physical: {
      overallScore: number;
      status: string;
      metrics: Array<{
        attribute: string;
        current: number;
        clubAvg: number;
        trend: string;
        priority: string;
      }>;
    };
    psychological: {
      overallScore: number;
      status: string;
      metrics: Array<{
        trait: string;
        current: number;
        clubAvg: number;
        trend: string;
        priority: string;
      }>;
    };
    social: {
      overallScore: number;
      status: string;
      metrics: Array<{
        skill: string;
        current: number;
        clubAvg: number;
        trend: string;
        priority: string;
      }>;
    };
  };
  historicalData: Array<{
    month: string;
    technical: number;
    physical: number;
    psychological: number;
    social: number;
    overall: number;
  }>;
  radarData: Array<{
    corner: string;
    player: number;
    clubAverage: number;
    fullMark: number;
  }>;
  recentMatches: Array<{
    date: string;
    opponent: string;
    rating: number;
    position: string;
    minutes: number;
    keyStats: string;
  }>;
  developmentPriorities: Array<{
    corner: string;
    priority: string;
    target: string;
    deadline: string;
    progress: number;
  }>;
}

// Sample data generator
const generatePlayerData = (): PlayerData => ({
  profile: {
    name: "James Richardson",
    age: 19,
    position: "Central Midfielder",
    clubNumber: 23,
    nationality: "England",
    height: "1.78m",
    weight: "72kg",
    clubTenure: "3 years"
  },
  currentAssessment: {
    date: "4th June 2025",
    assessmentPeriod: "May 2025",
    overallRating: 82,
    nextReview: "2nd July 2025"
  },
  fourCorners: {
    technical: {
      overallScore: 85,
      status: "GREEN",
      metrics: [
        { skill: "Short Passing", current: 88, clubAvg: 82, trend: "up", priority: "super strength" },
        { skill: "Long Passing", current: 79, clubAvg: 76, trend: "up", priority: "strength" },
        { skill: "First Touch", current: 86, clubAvg: 81, trend: "stable", priority: "super strength" },
        { skill: "Ball Control", current: 84, clubAvg: 80, trend: "up", priority: "strength" },
        { skill: "Shooting", current: 71, clubAvg: 78, trend: "down", priority: "development area" },
        { skill: "Crossing", current: 73, clubAvg: 72, trend: "stable", priority: "average" },
        { skill: "Dribbling", current: 77, clubAvg: 79, trend: "up", priority: "average" },
        { skill: "Tactical Awareness", current: 89, clubAvg: 83, trend: "up", priority: "super strength" }
      ]
    },
    physical: {
      overallScore: 78,
      status: "AMBER",
      metrics: [
        { attribute: "Endurance", current: 85, clubAvg: 82, trend: "up", priority: "super strength" },
        { attribute: "Speed (30m)", current: 72, clubAvg: 78, trend: "stable", priority: "development area" },
        { attribute: "Agility", current: 80, clubAvg: 79, trend: "up", priority: "strength" },
        { attribute: "Balance", current: 84, clubAvg: 81, trend: "stable", priority: "strength" },
        { attribute: "Power", current: 71, clubAvg: 76, trend: "down", priority: "development area" },
        { attribute: "Reaction Time", current: 82, clubAvg: 80, trend: "up", priority: "strength" },
        { attribute: "Flexibility", current: 79, clubAvg: 77, trend: "stable", priority: "average" },
        { attribute: "Recovery", current: 77, clubAvg: 75, trend: "up", priority: "average" }
      ]
    },
    psychological: {
      overallScore: 86,
      status: "GREEN",
      metrics: [
        { trait: "Confidence", current: 84, clubAvg: 79, trend: "up", priority: "strength" },
        { trait: "Concentration", current: 91, clubAvg: 83, trend: "stable", priority: "super strength" },
        { trait: "Decision Making", current: 88, clubAvg: 81, trend: "up", priority: "super strength" },
        { trait: "Pressure Handling", current: 82, clubAvg: 78, trend: "up", priority: "strength" },
        { trait: "Game Intelligence", current: 90, clubAvg: 84, trend: "stable", priority: "super strength" },
        { trait: "Resilience", current: 85, clubAvg: 82, trend: "up", priority: "strength" },
        { trait: "Learning Mindset", current: 89, clubAvg: 80, trend: "stable", priority: "super strength" },
        { trait: "Competitiveness", current: 79, clubAvg: 85, trend: "down", priority: "development area" }
      ]
    },
    social: {
      overallScore: 81,
      status: "GREEN",
      metrics: [
        { skill: "Communication", current: 87, clubAvg: 79, trend: "up", priority: "super strength" },
        { skill: "Teamwork", current: 85, clubAvg: 83, trend: "stable", priority: "strength" },
        { skill: "Leadership", current: 76, clubAvg: 74, trend: "up", priority: "average" },
        { skill: "Relationship Building", current: 83, clubAvg: 81, trend: "stable", priority: "strength" },
        { skill: "Conflict Resolution", current: 78, clubAvg: 76, trend: "up", priority: "average" },
        { skill: "Cultural Awareness", current: 82, clubAvg: 78, trend: "stable", priority: "strength" },
        { skill: "Peer Support", current: 84, clubAvg: 80, trend: "up", priority: "strength" },
        { skill: "Fair Play", current: 88, clubAvg: 85, trend: "stable", priority: "super strength" }
      ]
    }
  },
  historicalData: [
    { month: "Dec 2024", technical: 78, physical: 74, psychological: 81, social: 76, overall: 77 },
    { month: "Jan 2025", technical: 80, physical: 75, psychological: 82, social: 78, overall: 79 },
    { month: "Feb 2025", technical: 82, physical: 76, psychological: 83, social: 79, overall: 80 },
    { month: "Mar 2025", technical: 83, physical: 77, psychological: 84, social: 80, overall: 81 },
    { month: "Apr 2025", technical: 84, physical: 77, psychological: 85, social: 80, overall: 82 },
    { month: "May 2025", technical: 85, physical: 78, psychological: 86, social: 81, overall: 82 }
  ],
  radarData: [
    { corner: "Technical", player: 85, clubAverage: 79, fullMark: 100 },
    { corner: "Physical", player: 78, clubAverage: 77, fullMark: 100 },
    { corner: "Psychological", player: 86, clubAverage: 81, fullMark: 100 },
    { corner: "Social", player: 81, clubAverage: 79, fullMark: 100 }
  ],
  recentMatches: [
    { date: "30 May", opponent: "Brighton U23", rating: 8.2, position: "CM", minutes: 90, keyStats: "94% pass accuracy, 2 assists" },
    { date: "25 May", opponent: "Liverpool U23", rating: 7.8, position: "CM", minutes: 85, keyStats: "89% pass accuracy, 1 goal" },
    { date: "18 May", opponent: "Arsenal U23", rating: 8.5, position: "CDM", minutes: 90, keyStats: "96% pass accuracy, 8 interceptions" },
    { date: "12 May", opponent: "Chelsea U23", rating: 7.4, position: "CM", minutes: 75, keyStats: "87% pass accuracy" },
    { date: "5 May", opponent: "Man City U23", rating: 8.1, position: "CM", minutes: 90, keyStats: "91% pass accuracy, 1 assist" }
  ],
  developmentPriorities: [
    { corner: "Technical", priority: "Shooting Accuracy", target: "75+ rating", deadline: "Aug 2025", progress: 65 },
    { corner: "Physical", priority: "Sprint Speed", target: "Sub 4.1s (30m)", deadline: "Sep 2025", progress: 45 },
    { corner: "Physical", priority: "Power Development", target: "Club average +", deadline: "Oct 2025", progress: 35 },
    { corner: "Psychological", priority: "Competitive Edge", target: "Club average +", deadline: "Jul 2025", progress: 70 }
  ]
});

const TrendIcon = ({ trend, size = 16 }: { trend: string; size?: number }) => {
  const iconProps = { size, className: "inline ml-1" };
  
  switch (trend) {
    case "up":
      return <TrendingUp {...iconProps} className={`${iconProps.className} text-green-600`} />;
    case "down":
      return <TrendingDown {...iconProps} className={`${iconProps.className} text-red-600`} />;
    default:
      return <Minus {...iconProps} className={`${iconProps.className} text-gray-600`} />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const colours = {
    GREEN: "bg-green-100 text-green-800 border-green-200",
    AMBER: "bg-amber-100 text-amber-800 border-amber-200",
    RED: "bg-red-100 text-red-800 border-red-200"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colours[status as keyof typeof colours]}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colours = {
    "super strength": "bg-green-100 text-green-800",
    "strength": "bg-blue-100 text-blue-800",
    "average": "bg-gray-100 text-gray-800",
    "development area": "bg-amber-100 text-amber-800"
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colours[priority as keyof typeof colours]}`}>
      {priority}
    </span>
  );
};

const FourCornerGauge = ({ score, corner }: { score: number; corner: string }) => {
  const cornerColours = {
    "Technical": "#ef4444",
    "Physical": "#f59e0b", 
    "Psychological": "#3b82f6",
    "Social": "#10b981"
  };

  // Calculate the circumference and stroke offset for the progress circle
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center w-24 h-24">
        {/* Background circle */}
        <svg className="absolute inset-0 w-24 h-24 transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={cornerColours[corner as keyof typeof cornerColours]}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            className="transition-all duration-[2000ms] ease-out"
            style={{
              '--target-offset': strokeDashoffset,
              animation: 'fillCircle 2s ease-out 0.5s forwards'
            } as React.CSSProperties & { '--target-offset': number }}
          />
        </svg>
        {/* Score text */}
        <div className="text-2xl font-bold text-gray-900 z-10">{score}</div>
      </div>
      <div className="mt-2 text-sm font-medium text-gray-600">{corner}</div>
    </div>
  );
};

const FAFourCornerDashboard = () => {
  const [data, setData] = useState<PlayerData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(generatePlayerData());
    }, 500);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading player data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <MobileMenu currentPage="model" />
            </div>
          </nav>
        </div>
      </header>

      {/* Player Dashboard Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Main player info row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {data.profile.name}
                </h1>
                <div className="text-sm sm:text-base text-gray-600 mt-1">
                  #{data.profile.clubNumber} • {data.profile.position}
                </div>
              </div>
            </div>
            
            {/* Overall Rating - Prominent display */}
            <div className="text-center bg-blue-50 rounded-lg px-3 py-2 sm:px-4 sm:py-3 border-2 border-blue-200">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{data.currentAssessment.overallRating}<span className="text-lg sm:text-xl text-blue-400">/100</span></div>
              <div className="text-xs sm:text-sm text-blue-700 font-medium">Overall Rating</div>
            </div>
          </div>
          
          {/* Player details in compact cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Age</div>
              <div className="text-sm font-semibold text-gray-900">{data.profile.age}</div>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Nation</div>
              <div className="text-sm font-semibold text-gray-900">{data.profile.nationality}</div>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Height</div>
              <div className="text-sm font-semibold text-gray-900">{data.profile.height}</div>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Weight</div>
              <div className="text-sm font-semibold text-gray-900">{data.profile.weight}</div>
            </div>
          </div>
          
          {/* Assessment info */}
          <div className="mt-3 sm:mt-4 text-center">
            <div className="text-xs sm:text-sm text-gray-500">
              Assessment: {data.currentAssessment.date} • Next Review: {data.currentAssessment.nextReview}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Four Corner Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <FourCornerGauge score={data.fourCorners.technical.overallScore} corner="Technical" />
            <FourCornerGauge score={data.fourCorners.physical.overallScore} corner="Physical" />
            <FourCornerGauge score={data.fourCorners.psychological.overallScore} corner="Psychological" />
            <FourCornerGauge score={data.fourCorners.social.overallScore} corner="Social" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Club Tenure</p>
                  <p className="text-xl font-bold text-gray-900">{data.profile.clubTenure}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Review</p>
                  <p className="text-xl font-bold text-gray-900">{data.currentAssessment.nextReview}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Match Rating</p>
                  <p className="text-xl font-bold text-gray-900">{data.recentMatches[0].rating}/10</p>
                </div>
                <Award className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Development Areas</p>
                  <p className="text-xl font-bold text-gray-900">{data.developmentPriorities.length}</p>
                </div>
                <Target className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'technical', label: 'Technical/Tactical', icon: Target },
                { id: 'physical', label: 'Physical', icon: Activity },
                { id: 'psychological', label: 'Psychological', icon: Brain },
                { id: 'social', label: 'Social', icon: Users },
                { id: 'development', label: 'Development Plan', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="mr-2 h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Performance Radar */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Four Corner Performance Profile</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={data.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="corner" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Player" dataKey="player" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={3} />
                  <Radar name="Club Average" dataKey="clubAverage" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Historical Trends */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Historical Development Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[70, 90]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="technical" stroke="#ef4444" strokeWidth={3} name="Technical" />
                  <Line type="monotone" dataKey="physical" stroke="#f59e0b" strokeWidth={3} name="Physical" />
                  <Line type="monotone" dataKey="psychological" stroke="#3b82f6" strokeWidth={3} name="Psychological" />
                  <Line type="monotone" dataKey="social" stroke="#10b981" strokeWidth={3} name="Social" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Matches */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Match Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Opponent</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Position</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Minutes</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Rating</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Key Stats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentMatches.map((match, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{match.date}</td>
                        <td className="py-3 px-4 text-gray-900">{match.opponent}</td>
                        <td className="py-3 px-4 text-gray-700">{match.position}</td>
                        <td className="py-3 px-4 text-gray-700">{match.minutes}&apos;</td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${
                            match.rating >= 8 ? 'text-green-600' : 
                            match.rating >= 7 ? 'text-blue-600' : 
                            'text-amber-600'
                          }`}>
                            {match.rating}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{match.keyStats}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Technical/Tactical Assessment</h3>
                <StatusBadge status={data.fourCorners.technical.status} />
              </div>
              
              <div className="mb-6">
                <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="text-4xl font-bold text-red-600 mb-2">{data.fourCorners.technical.overallScore}/100</div>
                  <div className="text-gray-700">Overall Technical Rating</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Technical Skill</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Current Rating</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Club Average</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Trend</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fourCorners.technical.metrics.map((metric, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{metric.skill}</td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${
                            metric.current >= 85 ? 'text-green-600' : 
                            metric.current >= 75 ? 'text-blue-600' : 
                            'text-amber-600'
                          }`}>
                            {metric.current}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{metric.clubAvg}</td>
                        <td className="py-3 px-4">
                          <TrendIcon trend={metric.trend} />
                        </td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={metric.priority} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'physical' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Physical Development Assessment</h3>
                <StatusBadge status={data.fourCorners.physical.status} />
              </div>
              
              <div className="mb-6">
                <div className="text-center p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <div className="text-4xl font-bold text-amber-600 mb-2">{data.fourCorners.physical.overallScore}/100</div>
                  <div className="text-gray-700">Overall Physical Rating</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Physical Attribute</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Current Rating</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Club Average</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Trend</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fourCorners.physical.metrics.map((metric, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{metric.attribute}</td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${
                            metric.current >= 85 ? 'text-green-600' : 
                            metric.current >= 75 ? 'text-blue-600' : 
                            'text-amber-600'
                          }`}>
                            {metric.current}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{metric.clubAvg}</td>
                        <td className="py-3 px-4">
                          <TrendIcon trend={metric.trend} />
                        </td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={metric.priority} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'psychological' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Psychological Development Assessment</h3>
                <StatusBadge status={data.fourCorners.psychological.status} />
              </div>
              
              <div className="mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{data.fourCorners.psychological.overallScore}/100</div>
                  <div className="text-gray-700">Overall Psychological Rating</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Mental Attribute</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Current Rating</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Club Average</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Trend</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fourCorners.psychological.metrics.map((metric, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{metric.trait}</td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${
                            metric.current >= 85 ? 'text-green-600' : 
                            metric.current >= 75 ? 'text-blue-600' : 
                            'text-amber-600'
                          }`}>
                            {metric.current}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{metric.clubAvg}</td>
                        <td className="py-3 px-4">
                          <TrendIcon trend={metric.trend} />
                        </td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={metric.priority} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Social Development Assessment</h3>
                <StatusBadge status={data.fourCorners.social.status} />
              </div>
              
              <div className="mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-4xl font-bold text-green-600 mb-2">{data.fourCorners.social.overallScore}/100</div>
                  <div className="text-gray-700">Overall Social Rating</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Social Skill</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Current Rating</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Club Average</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Trend</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fourCorners.social.metrics.map((metric, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{metric.skill}</td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${
                            metric.current >= 85 ? 'text-green-600' : 
                            metric.current >= 75 ? 'text-blue-600' : 
                            'text-amber-600'
                          }`}>
                            {metric.current}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{metric.clubAvg}</td>
                        <td className="py-3 px-4">
                          <TrendIcon trend={metric.trend} />
                        </td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={metric.priority} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'development' && (
          <div className="space-y-8">
            {/* Development Priorities */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Development Priorities</h3>
              <div className="space-y-4">
                {data.developmentPriorities.map((priority, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          priority.corner === 'Technical' ? 'bg-red-500' :
                          priority.corner === 'Physical' ? 'bg-amber-500' :
                          priority.corner === 'Psychological' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}></div>
                        <h4 className="font-medium text-gray-900">{priority.priority}</h4>
                      </div>
                      <span className="text-sm text-gray-500">{priority.deadline}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Target: {priority.target}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          priority.progress >= 70 ? 'bg-green-500' :
                          priority.progress >= 40 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${priority.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>{priority.corner} Corner</span>
                      <span>{priority.progress}% Complete</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Plan */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended Action Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                  <h4 className="font-semibold text-amber-800 mb-3">Immediate Focus (Next 4 weeks)</h4>
                  <ul className="space-y-2 text-sm text-amber-700">
                    <li>• Shooting practice sessions 3x weekly</li>
                    <li>• Sprint technique coaching with fitness staff</li>
                    <li>• Individual competitive mindset sessions</li>
                    <li>• Power development programme initiation</li>
                  </ul>
                </div>
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold text-blue-800 mb-3">Medium Term Goals (3 months)</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Achieve consistent 75+ shooting accuracy</li>
                    <li>• Reduce 30m sprint time to sub-4.1 seconds</li>
                    <li>• Develop leadership presence in training</li>
                    <li>• Increase power output to club average+</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Coach Comments */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Coaching Staff Comments</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-gray-700 italic">
                    &ldquo;James continues to excel in technical and psychological areas. His game intelligence and passing ability 
                    are exceptional for his age group. The focus on physical development, particularly sprint speed and power, 
                    will unlock his full potential as a box-to-box midfielder.&rdquo;
                  </p>
                  <p className="text-sm text-gray-500 mt-2">— Academy Manager, {data.currentAssessment.date}</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-gray-700 italic">
                    &ldquo;Outstanding professional attitude and communication skills. James naturally organises the team from 
                    central midfield and shows mature decision-making under pressure. Shooting accuracy is the key area 
                    for technical improvement.&rdquo;
                  </p>
                  <p className="text-sm text-gray-500 mt-2">— First Team Coach, 25 May 2025</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">FA Four Corner Model Assessment</h4>
              <p className="text-sm text-gray-600 mb-2">
                This assessment follows the official FA Four Corner Model framework, evaluating player development across 
                Technical/Tactical, Physical, Psychological, and Social dimensions. All ratings are based on age-appropriate 
                standards and peer comparisons within the academy system.
              </p>
              <div className="flex items-center space-x-6 mb-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  FA Methodology
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  EPPP Standards
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Report generated on {data.currentAssessment.date} • Next assessment: {data.currentAssessment.nextReview} • EPPP Compliant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAFourCornerDashboard; 