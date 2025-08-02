"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  PlusCircle,
  FileText,
  BarChart3,
  LogOut,
  GraduationCap,
  User
} from 'lucide-react';

export function DashboardNav({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const isActive = (path: string) => pathname === path;

  const instructorNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/assignments', label: 'Assignments', icon: BookOpen },
    { path: '/create-assignment', label: 'Create Assignment', icon: PlusCircle },
    { path: '/submissions', label: 'Review Submissions', icon: FileText },
  ];

  const studentNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/assignments', label: 'Assignments', icon: BookOpen },
    { path: '/my-submissions', label: 'My Submissions', icon: FileText },
  ];

  const navItems = session.user.role === 'instructor' ? instructorNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">EduPortal</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{session.user.name}</span>
                <Badge variant={session.user.role === 'instructor' ? 'default' : 'secondary'}>
                  {session.user.role}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 pt-5 ">
        {/* Sidebar */}
        <div className='col-span-3 '>
          <nav className="w-full bg-white shadow-sm min-h-screen">
            <div className="p-4">
              <ul className="space-y-2">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <li key={path}>
                    <Link
                      href={path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(path)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        <div className='col-span-9 p-5'>
          {children}
        </div>

      </div>
    </div>
  );
}