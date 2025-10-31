'use server';

/**
 * @fileOverview AI-powered smart schedule suggestions for students.
 *
 * This file defines a Genkit flow that suggests events, subjects, and classes
 * that a student might enjoy based on their interests.
 *
 * - `getSmartScheduleSuggestions` -  A function that gets smart schedule suggestions for a student.
 * - `SmartScheduleSuggestionsInput` - The input type for the `getSmartScheduleSuggestions` function.
 * - `SmartScheduleSuggestionsOutput` - The output type for the `getSmartScheduleSuggestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartScheduleSuggestionsInputSchema = z.object({
  studentInterests: z
    .string()
    .describe('A description of the student’s interests.'),
});
export type SmartScheduleSuggestionsInput = z.infer<
  typeof SmartScheduleSuggestionsInputSchema
>;

const SmartScheduleSuggestionsOutputSchema = z.object({
  suggestedEvents: z
    .string()
    .describe('A list of events the student might enjoy.'),
  suggestedSubjects: z
    .string()
    .describe('A list of subjects the student might enjoy.'),
  suggestedClasses: z
    .string()
    .describe('A list of classes the student might enjoy.'),
});
export type SmartScheduleSuggestionsOutput = z.infer<
  typeof SmartScheduleSuggestionsOutputSchema
>;

export async function getSmartScheduleSuggestions(
  input: SmartScheduleSuggestionsInput
): Promise<SmartScheduleSuggestionsOutput> {
  return smartScheduleSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartScheduleSuggestionsPrompt',
  input: {schema: SmartScheduleSuggestionsInputSchema},
  output: {schema: SmartScheduleSuggestionsOutputSchema},
  prompt: `Based on the student's interests, suggest events, subjects, and classes that the student might enjoy. Return the suggestions as a JSON object.

Student Interests: {{{studentInterests}}}

Suggestions:`,
});

const smartScheduleSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartScheduleSuggestionsFlow',
    inputSchema: SmartScheduleSuggestionsInputSchema,
    outputSchema: SmartScheduleSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
