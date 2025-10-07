import { notFound } from 'next/navigation';
import { sampleSurveys } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { submitResponse } from '@/lib/actions';
import { Sheet } from 'lucide-react';
import { Question } from '@/lib/types';


export default function TakeSurveyPage({ params }: { params: { surveyId: string } }) {
  const survey = sampleSurveys.find((s) => s.id === params.surveyId);

  if (!survey) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
            <Sheet className="h-10 w-10 mx-auto text-primary" />
          <CardTitle className="font-headline text-3xl mt-4">{survey.title}</CardTitle>
          <CardDescription>{survey.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitResponse} className="space-y-8">
            <input type="hidden" name="surveyId" value={survey.id} />
            {survey.questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-semibold">
                  {index + 1}. {question.text}
                </Label>
                <SurveyQuestionInput question={question} />
              </div>
            ))}
            <Button type="submit" className="w-full" size="lg">Submit Response</Button>
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
