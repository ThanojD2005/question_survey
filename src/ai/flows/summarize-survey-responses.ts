
'use server';

/**
 * @fileOverview A flow that summarizes survey responses.
 *
 * - summarizeSurveyResponses - A function that analyzes survey responses and provides a summary.
 * - SummarizeSurveyResponsesInput - The input type for the summarizeSurveyResponses function.
 * - SummarizeSurveyResponsesOutput - The return type for the summarizeSurveyResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSurveyResponsesInputSchema = z.object({
  surveyQuestions: z.string().describe('A JSON string of the survey questions.'),
  surveyResponses: z.string().describe('A JSON string of the user\'s responses.'),
});
export type SummarizeSurveyResponsesInput = z.infer<typeof SummarizeSurveyResponsesInputSchema>;

const SummarizeSurveyResponsesOutputSchema = z.object({
  summary: z.string().describe("A comprehensive summary of all survey responses."),
});
export type SummarizeSurveyResponsesOutput = z.infer<typeof SummarizeSurveyResponsesOutputSchema>;

export async function summarizeSurveyResponses(input: SummarizeSurveyResponsesInput): Promise<SummarizeSurveyResponsesOutput> {
  return summarizeSurveyResponsesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSurveyResponsesPrompt',
  input: {schema: SummarizeSurveyResponsesInputSchema},
  output: {schema: SummarizeSurveyResponsesOutputSchema},
  prompt: `You are a data analyst. Analyze the following survey responses and provide a comprehensive summary.

  The survey questions were:
  {{{surveyQuestions}}}

  The user responses are:
  {{{surveyResponses}}}

  Based on all the provided responses, generate a high-level summary. Identify key trends, common themes from the text answers, and any interesting patterns or contradictions in the data. The summary should be objective and present a clear overview of the findings.
`,
});

const summarizeSurveyResponsesFlow = ai.defineFlow(
  {
    name: 'summarizeSurveyResponsesFlow',
    inputSchema: SummarizeSurveyResponsesInputSchema,
    outputSchema: SummarizeSurveyResponsesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
