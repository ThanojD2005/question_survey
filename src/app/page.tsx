
'use client';

import { useState, useActionState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { sampleSurveys } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { submitResponse } from '@/lib/actions';
import { Sheet, ArrowLeft, Loader2 } from 'lucide-react';
import { Question } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';


export default function TakeSurveyPage() {
  const survey = sampleSurveys[0];
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Record<string, string | string[]>>({});
  const [isPending, setIsPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
        const formData = new FormData();
        formData.append('surveyId', survey.id);
        Object.entries(allAnswers).forEach(([qId, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => formData.append(`question-${qId}`, v));
            } else {
                formData.append(`question-${qId}`, value);
            }
        });
        
        setIsPending(true);
        submitResponse(null, formData).then(() => {
            const queryParams = new URLSearchParams();
            const usageData: { [key:string]: string | string[] } = {};
            const usageQuestionIds = ['q5', 'q6', 'q7', 'q8', 'q11', 'q12', 'q13'];

            Object.keys(allAnswers)
                .filter(key => usageQuestionIds.includes(key))
                .forEach(key => {
                    usageData[key] = allAnswers[key];
                });

            if (Object.keys(usageData).length > 0) {
                queryParams.set('usageData', JSON.stringify(usageData));
            }
            router.push(`/results?${queryParams.toString()}`);
        }).catch(err => {
            console.error(err);
            // Handle error, e.g., show a toast message
            setIsPending(false);
            setIsSubmitting(false);
        });
    }
  }, [isSubmitting, allAnswers, survey.id, router]);


  if (!survey) {
    notFound();
  }

  const sections = survey.questions.reduce((acc, question) => {
    if (question.isSection) {
      acc.push({ title: question.text, questions: [] });
    } else if (acc.length > 0) {
      acc[acc.length - 1].questions.push(question);
    }
    return acc;
  }, [] as { title: string; questions: Question[] }[]);

  const totalSteps = sections.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = (e.target as HTMLButtonElement).closest('form');
    if (!form) return;

    const formData = new FormData(form);
    const currentAnswers: Record<string, string | string[]> = {};
    
    sections[currentStep].questions.forEach(q => {
        const values = formData.getAll(`question-${q.id}`);
        if (values.length > 0) {
            currentAnswers[q.id] = q.type === 'multiple-choice' ? values.map(String) : String(values[0]);
        }
    });

    const newAnswers = { ...allAnswers, ...currentAnswers };
    setAllAnswers(newAnswers);

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = (e.target as HTMLButtonElement).closest('form');
    if (!form) return;
    
    const formData = new FormData(form);
    const currentAnswers: Record<string, string | string[]> = {};

    sections[currentStep].questions.forEach(q => {
        const values = formData.getAll(`question-${q.id}`);
        if (values.length > 0) {
            currentAnswers[q.id] = q.type === 'multiple-choice' ? values.map(String) : String(values[0]);
        }
    });

    setAllAnswers(prev => ({...prev, ...currentAnswers}));
    setIsSubmitting(true);
  };


  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
            <Sheet className="h-10 w-10 mx-auto text-primary" />
          <CardTitle className="font-headline text-3xl mt-4">{survey.title}</CardTitle>
          <CardDescription>{survey.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full mb-6" />
          <form className="space-y-8">
            <h2 className="text-xl font-bold font-headline text-center">{sections[currentStep].title}</h2>

            {sections[currentStep].questions.map((question) => (
                <div key={question.id} className="space-y-3 animate-in fade-in duration-500">
                  <Label className="text-base font-semibold">
                    {question.text}
                  </Label>
                  <SurveyQuestionInput question={question} />
                </div>
            ))}
            
            <CardFooter className="flex justify-between p-0 pt-6">
                <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === 0 || isPending}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                 {currentStep < totalSteps - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="button" className="w-auto" size="lg" disabled={isPending} onClick={handleSubmit}>
                    {isPending ? <> <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting... </> : 'Submit Response'}
                  </Button>
                )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SurveyQuestionInput({ question }: { question: Question }) {
  const name = `question-${question.id}`;
  switch (question.type) {
    case 'text':
      return <Input name={name} placeholder="Your answer..." />;
    case 'single-choice':
      return (
        <RadioGroup name={name}>
          {question.options?.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={`${name}-${option.id}`} />
              <Label htmlFor={`${name}-${option.id}`}>{option.text}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'multiple-choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox id={`${name}-${option.id}`} name={name} value={option.id} />
              <Label htmlFor={`${name}-${option.id}`}>{option.text}</Label>
            </div>
          ))}
        </div>
      );
    default:
        return <Input name={name} placeholder="Your answer..." />;
  }
}
