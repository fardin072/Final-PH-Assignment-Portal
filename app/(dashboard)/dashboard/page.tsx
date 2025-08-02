"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { 
  BookOpen, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  PlusCircle,
  Award
} from 'lucide-react';
import { Assignment, Submission, SubmissionStats } from '@/lib/types';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SubmissionStats>({ pending: 0, accepted: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [assignmentsRes, submissionsRes, statsRes] = await Promise.all([
        fetch('/api/assignments'),
        fetch(session?.user.role === 'instructor' ? '/api/submissions' : '/api/submissions/my'),
        fetch('/api/submissions/stats')
      ]);

      if (assignmentsRes.ok) {
        setAssignments(await assignmentsRes.json());
      }
      if (submissionsRes.ok) {
        setSubmissions(await submissionsRes.json());
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pieData = [
    { name: 'Pending', value: stats.pending, color: '#fbbf24' },
    { name: 'Accepted', value: stats.accepted, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const recentAssignments = assignments.slice(0, 3);
  const recentSubmissions = submissions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {session?.user.role === 'instructor' 
              ? 'Manage your assignments and review submissions'
              : 'View your assignments and track your progress'
            }
          </p>
        </div>
        {session?.user.role === 'instructor' && (
          <Link href="/create-assignment">
            <Button className="flex items-center space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span>Create Assignment</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {session?.user.role === 'instructor' ? 'Total Submissions' : 'My Submissions'}
                </p>
                <p className="text-3xl font-bold text-gray-900">{submissions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {session?.user.role === 'instructor' ? 'Accepted' : 'Completed'}
                </p>
                <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions Chart (Instructor only) */}
        {session?.user.role === 'instructor' && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Submission Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Assignments */}
        <Card className={session?.user.role === 'instructor' ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Recent Assignments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAssignments.length > 0 ? (
              <div className="space-y-4">
                {recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Due: {new Date(assignment.deadline).toLocaleDateString()}
                      </p>
                      {session?.user.role === 'student' && (
                        <p className="text-xs text-gray-500 mt-1">
                          by {assignment.instructorName}
                        </p>
                      )}
                    </div>
                    <Link href={`/assignments/${assignment.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
                <Link href="/assignments">
                  <Button variant="outline" className="w-full">
                    View All Assignments
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {session?.user.role === 'instructor' 
                    ? 'Create your first assignment to get started.'
                    : 'No assignments available yet.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}