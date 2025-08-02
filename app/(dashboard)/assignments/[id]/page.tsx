"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Link as LinkIcon,
  FileText,
  Send
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Assignment, Submission, CreateSubmissionRequest } from '@/lib/types';

export default function AssignmentDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchAssignmentDetails();
      fetchSubmissions();
    }
  }, [params.id]);

  const fetchAssignmentDetails = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAssignment(data);
      } else {
        toast({
          title: 'Error',
          description: 'Assignment not found',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignment details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const endpoint = session?.user.role === 'instructor' ? '/api/submissions' : '/api/submissions/my';
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        const assignmentSubmissions = data.filter((s: Submission) => s.assignmentId === params.id);
        setSubmissions(assignmentSubmissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    setIsSubmitting(true);
    try {
      const submissionData: CreateSubmissionRequest = {
        assignmentId: assignment.id,
        submissionUrl,
        note: submissionNote,
      };

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        toast({
          title: 'Submission successful',
          description: 'Your assignment has been submitted for review.',
        });
        setSubmissionUrl('');
        setSubmissionNote('');
        fetchSubmissions();
      } else {
        const error = await response.json();
        toast({
          title: 'Submission failed',
          description: error.error || 'Failed to submit assignment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', label: 'Overdue', color: 'destructive' as const, icon: AlertCircle };
    } else if (diffDays <= 3) {
      return { status: 'urgent', label: `${diffDays} day${diffDays !== 1 ? 's' : ''} left`, color: 'destructive' as const, icon: Clock };
    } else if (diffDays <= 7) {
      return { status: 'soon', label: `${diffDays} days left`, color: 'secondary' as const, icon: Calendar };
    } else {
      return { status: 'normal', label: `${diffDays} days left`, color: 'outline' as const, icon: CheckCircle };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Assignment not found</h3>
        <Link href="/assignments">
          <Button className="mt-4">Back to Assignments</Button>
        </Link>
      </div>
    );
  }

  const deadlineStatus = getDeadlineStatus(assignment.deadline);
  const userSubmission = submissions.find(s => s.studentId === session?.user.id);
  const hasSubmitted = !!userSubmission;
  const isOverdue = deadlineStatus.status === 'overdue';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/assignments" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-500">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Assignments</span>
      </Link>

      {/* Assignment Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {assignment.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>by {assignment.instructorName}</span>
                </div>
              </div>
            </div>
            <Badge variant={deadlineStatus.color} className="flex items-center space-x-1">
              <deadlineStatus.icon className="h-4 w-4" />
              <span>{deadlineStatus.label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Description</h4>
            <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
              {assignment.description}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Submission Section */}
      {session?.user.role === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Submit Assignment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasSubmitted ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  userSubmission.status === 'accepted' ? 'bg-green-50 border border-green-200' :
                  userSubmission.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                  'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Your Submission</h4>
                    <Badge variant={
                      userSubmission.status === 'accepted' ? 'default' :
                      userSubmission.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {userSubmission.status.charAt(0).toUpperCase() + userSubmission.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Submission URL:</span>
                      <a 
                        href={userSubmission.submissionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-500 flex items-center space-x-1"
                      >
                        <LinkIcon className="h-3 w-3" />
                        <span>{userSubmission.submissionUrl}</span>
                      </a>
                    </div>
                    <div>
                      <span className="font-medium">Note:</span>
                      <p className="mt-1 text-gray-700">{userSubmission.note}</p>
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>
                      <span className="ml-2">{new Date(userSubmission.submittedAt).toLocaleString()}</span>
                    </div>
                    {userSubmission.feedback && (
                      <div>
                        <span className="font-medium">Feedback:</span>
                        <p className="mt-1 text-gray-700">{userSubmission.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : isOverdue ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Submission Deadline Passed</h3>
                <p className="text-gray-500">
                  The deadline for this assignment was {new Date(assignment.deadline).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmission} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="submissionUrl" className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4" />
                    <span>Submission URL *</span>
                  </Label>
                  <Input
                    id="submissionUrl"
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/yourusername/project-repo"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Provide a link to your project (GitHub repository, Google Drive, etc.)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="submissionNote" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Submission Note *</span>
                  </Label>
                  <Textarea
                    id="submissionNote"
                    value={submissionNote}
                    onChange={(e) => setSubmissionNote(e.target.value)}
                    placeholder="Describe your submission, any challenges faced, or additional notes..."
                    required
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructor View - All Submissions */}
      {session?.user.role === 'instructor' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Student Submissions ({submissions.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{submission.studentName}</h4>
                          <Badge variant={
                            submission.status === 'accepted' ? 'default' :
                            submission.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <LinkIcon className="h-3 w-3" />
                            <a 
                              href={submission.submissionUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-500"
                            >
                              {submission.submissionUrl}
                            </a>
                          </div>
                          <p className="text-gray-700">{submission.note}</p>
                          <p>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                          {submission.feedback && <p>Feedback: {submission.feedback}</p>}
                        </div>
                      </div>
                      <Link href={`/submissions/${submission.id}`}>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Student submissions will appear here when they submit their work.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}