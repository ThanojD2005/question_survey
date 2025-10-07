
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { analyzeUsageAndAdvise } from '@/ai/flows/summarize-usage-and-advise';
import { sampleSurveys } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Advice = {
    english: string;
    sinhala: string;
}

function ResultsDisplay() {
    const searchParams = useSearchParams();
    const usageDataString = searchParams.get('usageData');

    const [summary, setSummary] = useState('');
    const [advice, setAdvice] = useState<Advice | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!usageDataString) {
            setError("No usage data provided.");
            setIsLoading(false);
            return;
        }

        const getAnalysis = async () => {
            try {
                const usageData = JSON.parse(usageDataString);
                
                const survey = sampleSurveys[0];
                const usageQuestionIds = ['q5', 'q6', 'q7', 'q8', 'q11', 'q12', 'q13'];
                
                const questionsWithOptions = survey.questions
                    .filter(q => usageQuestionIds.includes(q.id))
                    .map(q => {
                        const answerValue = usageData[q.id];
                        let answerText: string | string[];
                        if (Array.isArray(answerValue)) {
                             answerText = q.options?.filter(opt => answerValue.includes(opt.id)).map(opt => opt.text) || [];
                        } else {
                            answerText = q.options?.find(opt => opt.id === answerValue)?.text || answerValue;
                        }

                        return {
                            question: q.text,
                            answer: answerText
                        }
                    });


                const result = await analyzeUsageAndAdvise({
                    usageData: JSON.stringify(questionsWithOptions, null, 2),
                    questions: JSON.stringify(survey.questions.filter(q => usageQuestionIds.includes(q.id)).map(q => q.text))
                });
                setSummary(result.summary);
                setAdvice(result.advice);
            } catch (e) {
                console.error(e);
                setError('Failed to generate AI analysis. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        getAnalysis();
    }, [usageDataString]);


    return (
        <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl">
                <CardHeader className="text-center">
                    <BrainCircuit className="h-12 w-12 mx-auto text-primary" />
                    <CardTitle className="font-headline text-3xl mt-4">Your Digital Habit Analysis</CardTitle>
                    <CardDescription>Here's a summary of your smartphone usage and some personalized advice.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center gap-4 p-8">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-muted-foreground">Our AI is analyzing your results...</p>
                        </div>
                    )}
                    {error && <p className="text-destructive text-center">{error}</p>}
                    {!isLoading && !error && advice && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl">Summary of Your Habits</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground/80">{summary}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl">Personalized Advice</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <Tabs defaultValue="english">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="english">English</TabsTrigger>
                                            <TabsTrigger value="sinhala">Sinhala</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="english" className="pt-4">
                                            <div
                                                className="prose prose-sm max-w-none text-foreground/80"
                                                dangerouslySetInnerHTML={{ __html: advice.english.replace(/•/g, '<br/>•') }}
                                            />
                                        </TabsContent>
                                        <TabsContent value="sinhala" className="pt-4">
                                             <div
                                                className="prose prose-sm max-w-none text-foreground/80"
                                                dangerouslySetInnerHTML={{ __html: advice.sinhala.replace(/•/g, '<br/>•') }}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultsDisplay />
        </Suspense>
    );
}
