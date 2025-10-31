'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getSmartScheduleSuggestions, SmartScheduleSuggestionsOutput } from '@/ai/flows/smart-schedule-suggestions';
import { Sparkles, Wand2, BookOpen, School, Calendar as CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SuggestionsDisplay({ suggestions }: { suggestions: SmartScheduleSuggestionsOutput }) {
  const parseSuggestions = (text: string) => {
    return text.split('\n').map(s => s.trim().replace(/^- /, '')).filter(Boolean);
  };

  const sections = [
    { title: "Suggested Events", content: parseSuggestions(suggestions.suggestedEvents), icon: CalendarIcon },
    { title: "Suggested Subjects", content: parseSuggestions(suggestions.suggestedSubjects), icon: BookOpen },
    { title: "Suggested Classes", content: parseSuggestions(suggestions.suggestedClasses), icon: School },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3 mt-6">
      {sections.map(({ title, content, icon: Icon }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              {content.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SuggestionGenerator() {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [interests, setInterests] = useState(user?.type === 'student' ? user.interests || '' : '');
  const [suggestions, setSuggestions] = useState<SmartScheduleSuggestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!interests.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please describe your interests.',
      });
      return;
    }
    setIsLoading(true);
    setSuggestions(null);

    try {
      const result = await getSmartScheduleSuggestions({ studentInterests: interests });
      setSuggestions(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate suggestions at this time.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            <CardTitle className="text-2xl">Smart Schedule Suggestions</CardTitle>
        </div>
        <CardDescription>
          Get AI-powered recommendations for events, subjects, and classes tailored to your interests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Textarea
            placeholder="e.g., Astrophysics, classical music, and sci-fi novels"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">Describe your interests and hobbies to get the best suggestions.</p>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading} className="mt-4">
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating...' : 'Generate Suggestions'}
        </Button>
        {isLoading && (
            <div className="grid gap-6 md:grid-cols-3 mt-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
            </div>
        )}
        {suggestions && <SuggestionsDisplay suggestions={suggestions} />}
      </CardContent>
    </Card>
  );
}
