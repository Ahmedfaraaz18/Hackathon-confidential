'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Event } from '@/lib/data';

export function EventsPanel() {
  const { data, setData } = useAppContext();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>();

  const handleAddEvent = () => {
    if (!title || !date) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide both a title and a date.',
      });
      return;
    }

    const newEvent: Event = { title, date: format(date, 'yyyy-MM-dd') };
    setData(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
    }));

    toast({
      title: 'Event Added',
      description: `Successfully added "${title}".`,
    });
    setTitle('');
    setDate(undefined);
  };
  
  const handleRemoveEvent = (eventToRemove: Event) => {
    setData(prev => ({
        ...prev,
        events: prev.events.filter(event => event.title !== eventToRemove.title || event.date !== eventToRemove.date)
    }));
    toast({
        title: 'Event Removed',
        description: `Successfully removed "${eventToRemove.title}".`,
    });
  }

  const sortedEvents = [...data.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Add New Event</CardTitle>
                <CardDescription>Create a new event for the school calendar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Input
                        placeholder="Event Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <Button onClick={handleAddEvent} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                </Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>All Events</CardTitle>
                <CardDescription>View all scheduled events.</CardDescription>
            </CardHeader>
            <CardContent>
                {sortedEvents.length > 0 ? (
                <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {sortedEvents.map((event, index) => (
                    <li key={index} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveEvent(event)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                    </li>
                    ))}
                </ul>
                ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="text-muted-foreground">No events scheduled.</p>
                </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
