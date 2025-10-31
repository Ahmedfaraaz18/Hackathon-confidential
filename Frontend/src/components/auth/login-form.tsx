'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { AppLogo } from '../icons';

interface LoginFormProps {
  role: 'teacher' | 'student';
}

export function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const { data, setUser, toggleTheme } = useAppContext();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const theme = data.settings.theme;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      let foundUser = null;
      if (role === 'teacher') {
        foundUser = data.teachers.find(t => t.username === username && t.password === password);
        if (foundUser) {
          setUser({ ...foundUser, type: 'teacher' });
        }
      } else {
        foundUser = data.students.find(s => s.id === studentId);
        if (foundUser) {
          setUser({ ...foundUser, type: 'student' });
        }
      }

      setIsLoading(false);

      if (foundUser) {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${foundUser.name}!`,
        });
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid credentials. Please try again.',
        });
      }
    }, 500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary">
      <Card className="w-full max-w-sm shadow-2xl animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <AppLogo className="h-8 w-8 text-primary" />
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <div className="text-center pt-4">
            <CardTitle className="text-2xl">{role === 'teacher' ? 'Teacher Login' : 'Student Login'}</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {role === 'teacher' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="teacher1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder="e.g., S1001"
                  required
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
