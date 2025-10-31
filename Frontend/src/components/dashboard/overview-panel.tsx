'use client';

import { useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { StatCard } from './stat-card';
import { AttendanceChart } from './attendance-chart';
import { UpcomingEvents } from './upcoming-events';
import { BarChart, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function OverviewPanel() {
  const { user, data } = useAppContext();

  const isStudent = user?.type === 'student';
  const today = new Date().toISOString().slice(0, 10);

  const studentAttendance = useMemo(() => {
    if (!isStudent) return [];
    return data.attendance.filter(a => a.studentId === user.id);
  }, [data.attendance, user, isStudent]);
  
  const todayRecord = useMemo(() => {
      return studentAttendance.find(a => a.date === today);
  }, [studentAttendance, today]);

  const attendancePercentage = useMemo(() => {
    if (studentAttendance.length === 0) return 0;
    const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
    return (presentCount / studentAttendance.length) * 100;
  }, [studentAttendance]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">Here's your overview for {format(new Date(), 'EEEE, MMMM do')}.</p>
      </div>

      {isStudent ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
            <StatCard 
              title="Today's Status" 
              value={todayRecord?.status ?? 'N/A'} 
              icon={Clock} 
              description={todayRecord ? `For ${todayRecord.subject}`: 'No record for today'}
            />
            <StatCard 
              title="Total Classes" 
              value={studentAttendance.length} 
              icon={BarChart}
              description="Total number of classes recorded"
            />
            <div className="sm:col-span-2">
                <AttendanceChart percentage={attendancePercentage} />
            </div>
          </div>
          <div className="lg:col-span-1">
             <UpcomingEvents />
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
           <UpcomingEvents />
        </div>
      )}
    </div>
  );
}
