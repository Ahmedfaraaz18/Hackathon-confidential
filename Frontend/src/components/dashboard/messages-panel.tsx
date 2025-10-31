'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { nowISO } from '@/lib/utils';
import { formatRelative } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function MessagesPanel() {
  const { user, data, addMessage, setData } = useAppContext();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const contacts = useMemo(() => {
    if (!user) return [];
    if (user.type === 'teacher') {
      return data.students.map(s => ({ id: s.id, name: s.name }));
    } else {
      return data.teachers.map(t => ({ id: t.username, name: t.name }));
    }
  }, [user, data.students, data.teachers]);
  
  const currentUserId = user?.type === 'teacher' ? user.username : user?.id;

  const messages = useMemo(() => {
    if (!currentUserId || !selectedContact) return [];
    return data.messages.filter(
      m =>
        (m.from === currentUserId && m.to === selectedContact) ||
        (m.from === selectedContact && m.to === currentUserId)
    ).sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  }, [data.messages, currentUserId, selectedContact]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!text.trim() || !currentUserId || !selectedContact) return;

    addMessage({
      id: Date.now(),
      from: currentUserId,
      to: selectedContact,
      text: text.trim(),
      ts: nowISO(),
    });

    setText('');
    toast({ title: 'Message sent!' });
  };
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <Card className="h-[80vh] flex flex-col">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>Communicate with students and teachers.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        <div className="flex flex-col border-r pr-4">
          <h3 className="font-semibold mb-2">Contacts</h3>
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {contacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors",
                    selectedContact === contact.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  )}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${contact.id}`} />
                    <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{contact.name}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="md:col-span-2 flex flex-col h-full">
          {selectedContact ? (
            <>
              <div className="border-b pb-2 mb-4">
                 <h3 className="font-semibold">{contacts.find(c => c.id === selectedContact)?.name}</h3>
              </div>
              <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
                <div className="space-y-4 pr-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-end gap-2",
                        message.from === currentUserId ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg",
                        message.from === currentUserId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
                        <p>{message.text}</p>
                        <p className="text-xs opacity-70 mt-1 text-right">
                          {formatRelative(parseISO(message.ts), new Date())}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <p>Select a contact to start messaging</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
