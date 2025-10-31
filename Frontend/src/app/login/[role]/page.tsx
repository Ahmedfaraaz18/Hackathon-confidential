import { LoginForm } from '@/components/auth/login-form';
import { notFound } from 'next/navigation';

interface LoginPageProps {
  params: {
    role: string;
  };
}

export default function LoginPage({ params }: LoginPageProps) {
  const { role } = params;

  if (role !== 'teacher' && role !== 'student') {
    notFound();
  }

  return <LoginForm role={role} />;
}
