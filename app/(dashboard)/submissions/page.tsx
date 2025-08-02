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
  Filter,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { Submission, Assignment, SubmissionStatus } from '@/lib/types';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [submissionsResponse, assignmentsResponse] = await Promise.all([
        fetch('/api/submissions'),
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

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAssignmentTitle(submission.assignmentId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesAssignment = assignmentFilter === 'all' || submission.assignmentId === assignmentFilter;

    return matchesSearch && matchesStatus && matchesAssignment;
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
          <span>Review Submissions</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Review and grade student assignment submissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
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
                <p className="text-sm font-medium text-gray-600">Rejected</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students or assignments..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                {assignments.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setAssignmentFilter('all');
              }}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Clear Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {filteredSubmissions.length > 0 ? (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => {
            const StatusIcon = getStatusIcon(submission.status);
            return (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {submission.studentName}
                          </h3>
                          <Badge variant={getStatusColor(submission.status)} className="flex items-center space-x-1">
                            <StatusIcon className="h-3 w-3" />
                            <span>{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
                          </Badge>
                        </div>
                        <Link href={`/submissions/${submission.id}`}>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </Link>
                      </div>

                      {/* Assignment Info */}
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-800">
                          {getAssignmentTitle(submission.assignmentId)}
                        </p>
                      </div>

                      {/* Submission Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <LinkIcon className="h-4 w-4" />
                            <a 
                              href={submission.submissionUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-500 truncate"
                            >
                              {submission.submissionUrl}
                            </a>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-700 line-clamp-2">
                            <span className="font-medium">Note:</span> {submission.note}
                          </p>
                          {submission.feedback && (
                            <p className="text-gray-700 line-clamp-2 mt-1">
                              <span className="font-medium">Feedback:</span> {submission.feedback}
                            </p>
                          )}
                          {submission.reviewedAt && (
                            <div className="flex items-center space-x-2 text-gray-500 mt-1">
                              <Clock className="h-4 w-4" />
                              <span>Reviewed: {new Date(submission.reviewedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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
              {submissions.length === 0 ? 'No submissions yet' : 'No submissions match your filters'}
            </h3>
            <p className="text-gray-500 text-center">
              {submissions.length === 0 
                ? 'Student submissions will appear here when they submit their assignments.'
                : 'Try adjusting your search terms or filters to see more results.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}