'use client';

import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function UpcomingEvents() {
  const { data } = useAppContext();
  
  const sortedEvents = [...data.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Stay updated on the latest school events.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedEvents.length > 0 ? (
          <ul className="space-y-4">
            {sortedEvents.map((event, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center rounded-md bg-secondary p-2 text-secondary-foreground">
                    <span className="text-sm font-semibold">{format(parseISO(event.date), 'MMM')}</span>
                    <span className="text-xl font-bold">{format(parseISO(event.date), 'dd')}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center">
            <CalendarIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No upcoming events.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
