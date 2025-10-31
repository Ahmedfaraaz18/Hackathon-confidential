'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User } from 'lucide-react';
import { AppLogo } from '@/components/icons';

export default function LandingPage() {
  const router = useRouter();

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    router.push(`/login/${role}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-secondary">
      <div className="flex items-center gap-4 mb-8">
        <AppLogo className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tighter text-foreground">
          Easy4U
        </h1>
      </div>
      <Card className="w-full max-w-md shadow-2xl animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>Please select your role to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              size="lg"
              className="h-24 flex-col gap-2 text-lg"
              onClick={() => handleRoleSelect('teacher')}
            >
              <Users className="h-8 w-8" />
              <span>Teacher</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-24 flex-col gap-2 text-lg"
              onClick={() => handleRoleSelect('student')}
            >
              <User className="h-8 w-8" />
              <span>Student</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="mt-8 text-sm text-muted-foreground">
        The modern attendance management system.
      </p>
    </div>
  );
}
