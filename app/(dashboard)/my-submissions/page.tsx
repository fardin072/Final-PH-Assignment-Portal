"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link as LinkIcon,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { Submission, Assignment, SubmissionStatus } from '@/lib/types';

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [submissionsResponse, assignmentsResponse] = await Promise.all([
        fetch('/api/submissions/my'),
        fetch('/api/assignments')
      ]);

      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData);
      }

      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAssignmentTitle = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    return assignment ? assignment.title : 'Unknown Assignment';
  };

  const getAssignment = (assignmentId: string) => {
    return assignments.find(a => a.id === assignmentId);
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = getAssignmentTitle(submission.assignmentId)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case 'accepted':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusCount = (status: SubmissionStatus) => {
    return submissions.filter(s => s.status === status).length;
  };

  const getStatusDescription = (status: SubmissionStatus) => {
    switch (status) {
      case 'accepted':
        return 'Great job! Your submission has been accepted.';
      case 'rejected':
        return 'Your submission needs revision. Please check the feedback.';
      default:
        return 'Your submission is being reviewed by the instructor.';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <span>My Submissions</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Track your assignment submissions and view feedback from instructors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount('accepted')}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Needs Revision</p>
                <p className="text-2xl font-bold text-red-600">{getStatusCount('rejected')}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Under Review</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Needs Revision</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {filteredSubmissions.length > 0 ? (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => {
            const StatusIcon = getStatusIcon(submission.status);
            const assignment = getAssignment(submission.assignmentId);
            return (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {getAssignmentTitle(submission.assignmentId)}
                        </h3>
                        <Badge variant={getStatusColor(submission.status)} className="flex items-center space-x-1">
                          <StatusIcon className="h-3 w-3" />
                          <span>{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
                        </Badge>
                      </div>
                      {assignment && (
                        <Link href={`/assignments/${assignment.id}`}>
                          <Button variant="outline" size="sm">
                            View Assignment
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Status Description */}
                    <div className={`p-3 rounded-lg text-sm ${
                      submission.status === 'accepted' ? 'bg-green-50 text-green-800' :
                      submission.status === 'rejected' ? 'bg-red-50 text-red-800' :
                      'bg-yellow-50 text-yellow-800'
                    }`}>
                      {getStatusDescription(submission.status)}
                    </div>

                    {/* Submission Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                        </div>
                        {submission.reviewedAt && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Reviewed: {new Date(submission.reviewedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-gray-600">
                          <LinkIcon className="h-4 w-4" />
                          <a 
                            href={submission.submissionUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 truncate"
                          >
                            View Submission
                          </a>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">Your Note:</span>
                          <p className="text-gray-600 mt-1 line-clamp-2">{submission.note}</p>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Section */}
                    {submission.feedback && (
                      <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">Instructor Feedback:</span>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
                        </div>
                      </div>
                    )}

                    {/* Assignment Deadline Info */}
                    {assignment && (
                      <div className="border-t pt-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Assignment deadline was: {new Date(assignment.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {submissions.length === 0 ? 'No submissions yet' : 'No submissions match your search'}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {submissions.length === 0 
                ? "You haven't submitted any assignments yet. Check out available assignments to get started."
                : 'Try adjusting your search terms or filters to see more results.'
              }
            </p>
            {submissions.length === 0 && (
              <Link href="/assignments">
                <Button className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Browse Assignments</span>
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}