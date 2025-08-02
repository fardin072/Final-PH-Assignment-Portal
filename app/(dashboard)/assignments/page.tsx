"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Calendar, 
  User, 
  Search, 
  PlusCircle,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Assignment } from '@/lib/types';

export default function AssignmentsPage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', label: 'Overdue', color: 'destructive' as const };
    } else if (diffDays <= 3) {
      return { status: 'urgent', label: `${diffDays} day${diffDays !== 1 ? 's' : ''} left`, color: 'destructive' as const };
    } else if (diffDays <= 7) {
      return { status: 'soon', label: `${diffDays} days left`, color: 'secondary' as const };
    } else {
      return { status: 'normal', label: `${diffDays} days left`, color: 'outline' as const };
    }
  };

  const getDeadlineIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      case 'urgent':
        return <Clock className="h-4 w-4" />;
      case 'soon':
        return <Calendar className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span>Assignments</span>
          </h1>
          <p className="text-gray-600 mt-2">
            {session?.user.role === 'instructor' 
              ? 'Manage your assignments and track student progress'
              : 'View your assignments and submit your work'
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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignments Grid */}
      {filteredAssignments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssignments.map((assignment) => {
            const deadlineStatus = getDeadlineStatus(assignment.deadline);
            return (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {assignment.title}
                    </CardTitle>
                    <Badge variant={deadlineStatus.color} className="ml-2 flex items-center space-x-1">
                      {getDeadlineIcon(deadlineStatus.status)}
                      <span className="text-xs">{deadlineStatus.label}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {assignment.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                    </div>
                    {session?.user.role === 'student' && (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <User className="h-4 w-4" />
                        <span>by {assignment.instructorName}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <Link href={`/assignments/${assignment.id}`}>
                      <Button variant="outline" className="w-full">
                        {session?.user.role === 'instructor' ? 'Manage' : 'View Details'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No assignments found' : 'No assignments yet'}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : session?.user.role === 'instructor' 
                  ? 'Create your first assignment to get started'
                  : 'No assignments have been posted yet'
              }
            </p>
            {!searchTerm && session?.user.role === 'instructor' && (
              <Link href="/create-assignment">
                <Button>Create Assignment</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}