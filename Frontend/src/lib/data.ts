import { addDaysISO } from './utils';

export interface Teacher {
  username: string;
  password: string;
  name: string;
}

export interface Student {
  name: string;
  id: string;
  interests?: string;
}

export interface AttendanceRecord {
  id: number;
  studentId: string;
  subject: string;
  date: string;
  status: 'Present' | 'Absent' | 'Excused';
  ts: string;
}

export interface Message {
  id: number;
  to: string;
  from: string;
  text: string;
  ts: string;
}

export interface Event {
  title: string;
  date: string;
}

export interface TimetableEntry {
  time: string;
  sub: string;
}

export interface AppData {
  teachers: Teacher[];
  students: Student[];
  attendance: AttendanceRecord[];
  messages: Message[];
  events: Event[];
  timetable: { [day: number]: TimetableEntry[] };
  settings: {
    theme: 'light' | 'dark';
  };
}

export const defaultData: AppData = {
  teachers: [{ username: 'teacher1', password: 'password', name: 'Dr. Meena' }],
  students: [
    { name: 'Ayesha Khan', id: 'S1001', interests: 'Astrophysics, classical music, and sci-fi novels' },
    { name: 'Rahul Verma', id: 'S1002', interests: 'Competitive programming, basketball, and modern art' },
    { name: 'Leena Rao', id: 'S1003', interests: 'Bio-engineering, hiking, and documentary films' },
  ],
  attendance: [],
  messages: [],
  events: [
    { title: 'Semester Exams', date: addDaysISO(7) },
    { title: 'Science Fair', date: addDaysISO(14) },
  ],
  timetable: {
    1: [{ time: '09:00', sub: 'Mathematics' }, { time: '11:00', sub: 'Physics' }],
    2: [{ time: '09:00', sub: 'Chemistry' }],
    3: [{ time: '10:00', sub: 'Physics' }, { time: '13:00', sub: 'CS Lab' }],
    4: [{ time: '09:00', sub: 'Mathematics' }, { time: '12:00', sub: 'Chemistry' }],
    5: [{ time: '10:00', sub: 'Computer Science' }],
  },
  settings: { theme: 'dark' },
};
