'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from "@repo/ui";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  Activity,
  Plus
} from "lucide-react";
import { NewMeetingForm } from "./NewMeetingForm";

interface DashboardStats {
  totalMeetings: number;
  completedMeetings: number;
  averageDuration: number; // in minutes
  pendingMeetings: number;
  inProgressMeetings: number;
  readyMeetings: number;
}

interface DashboardOverviewProps {
  stats: DashboardStats;
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  
  const completionRate = stats.totalMeetings > 0 
    ? Math.round((stats.completedMeetings / stats.totalMeetings) * 100)
    : 0;

  const handleNewMeetingSubmit = (formData: {
    companyName: string;
    companyWebsite: string;
    roleToApply: string;
    requirements: string;
    resumeFile: File | null;
  }) => {
    // Handle form submission here
    console.log('New meeting form submitted:', formData);
    setShowNewMeetingForm(false);
  };

  const handleCancel = () => {
    setShowNewMeetingForm(false);
  };

  if (showNewMeetingForm) {
    return (
      <div className="space-y-6">
        <NewMeetingForm 
          onSubmit={handleNewMeetingSubmit} 
          onCancel={handleCancel}
        />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Meetings",
      value: stats.totalMeetings.toString(),
      description: "All interview sessions",
      icon: Calendar,
      color: "text-primary"
    },
    {
      title: "Completed",
      value: stats.completedMeetings.toString(),
      description: `${completionRate}% completion rate`,
      icon: CheckCircle,
      color: "text-primary"
    },
    {
      title: "Ready to Start",
      value: stats.readyMeetings.toString(),
      description: "Questions prepared",
      icon: Activity,
      color: "text-primary"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your interview progress.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* New Meeting Button Card */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-dashed border-2 hover:border-primary hover:bg-accent/50"
          onClick={() => setShowNewMeetingForm(true)}
        >
          <CardContent className="px-6 flex items-center justify-center min-h-[120px]">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-2">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
              </div>
              <p className="text-sm font-semibold text-primary">
                New Meeting
              </p>
              <p className="text-xs text-muted-foreground">
                Create New interview session
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Meeting Status Breakdown</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-secondary-foreground">
                {stats.pendingMeetings}
              </div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </div>
            
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="text-2xl font-bold text-accent-foreground">
                {stats.readyMeetings}
              </div>
              <div className="text-sm text-muted-foreground">Ready</div>
            </div>
            
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <div className="text-2xl font-bold text-destructive">
                {stats.inProgressMeetings}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {stats.completedMeetings}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Quick Tips</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <TrendingUp className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Optimize your resume</p>
                <p className="text-muted-foreground">
                  Include relevant keywords from job descriptions to get better interview questions
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Best practice</p>
                <p className="text-muted-foreground">
                  Practice regularly - take at least one interview session per week
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Activity className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Improve performance</p>
                <p className="text-muted-foreground">
                  Review completed sessions to identify areas for improvement
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}