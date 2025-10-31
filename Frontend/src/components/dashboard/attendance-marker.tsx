'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { nowISO } from '@/lib/utils';
import { Search, Check, X, CircleSlash, Users } from 'lucide-react';
import type { Student, AttendanceRecord } from '@/lib/data';

function StatusToggle({ value, onChange }: { value: AttendanceRecord['status'], onChange: (status: AttendanceRecord['status']) => void }) {
  const states: AttendanceRecord['status'][] = ['Present', 'Absent', 'Excused'];
  const cycle = () => {
    const currentIndex = states.indexOf(value);
    const nextIndex = (currentIndex + 1) % states.length;
    onChange(states[nextIndex]);
  };

  const statusConfig = {
    Present: { color: 'bg-green-500 hover:bg-green-600', icon: Check },
    Absent: { color: 'bg-red-500 hover:bg-red-600', icon: X },
    Excused: { color: 'bg-yellow-500 hover:bg-yellow-600', icon: CircleSlash },
  };

  const { color, icon: Icon } = statusConfig[value];

  return (
    <Button onClick={cycle} className={`w-28 text-white transition-colors ${color}`}>
      <Icon className="mr-2 h-4 w-4" />
      {value}
    </Button>
  );
}

export function AttendanceMarker() {
  const { data, setData } = useAppContext();
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  
  const subjects = useMemo(() => {
    const allSubjects = Object.values(data.timetable).flat().map(t => t.sub);
    return [...new Set(allSubjects)];
  }, [data.timetable]);

  const [subject, setSubject] = useState(subjects[0] || '');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord['status']>>({});

  useEffect(() => {
    const initialMap: Record<string, AttendanceRecord['status']> = {};
    data.students.forEach(s => {
      initialMap[s.id] = 'Present';
    });
    setAttendanceMap(initialMap);
  }, [data.students]);

  const filteredStudents = useMemo(() => {
    return data.students.filter(s =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.id.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data.students, filter]);
  
  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    const date = new Date().toISOString().slice(0, 10);
    const newRecords: AttendanceRecord[] = Object.entries(attendanceMap)
      .filter(([studentId]) => filteredStudents.some(s => s.id === studentId))
      .map(([studentId, status]) => ({
        id: Date.now() + Math.random(),
        studentId,
        subject,
        date,
        status,
        ts: nowISO(),
      }));

    setData(prev => ({
      ...prev,
      attendance: [...prev.attendance, ...newRecords],
    }));

    toast({
      title: 'Attendance Saved',
      description: `Recorded attendance for ${newRecords.length} students in ${subject}.`,
    });
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
        <CardDescription>Select a subject and mark the attendance for each student.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(sub => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSave} className="w-full sm:w-auto sm:ml-auto">
            Save Attendance
          </Button>
        </div>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {filteredStudents.length > 0 ? filteredStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${student.id}`} />
                            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.id}</p>
                        </div>
                    </div>
                    <StatusToggle
                        value={attendanceMap[student.id] || 'Present'}
                        onChange={(status) => handleStatusChange(student.id, status)}
                    />
                </div>
            )) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No students found.</p>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
