'use client';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Bot, Loader2, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useState } from 'react';

const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty'),
});

const questionSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty'),
  type: z.enum(['single-choice', 'multiple-choice', 'text']),
  options: z.array(optionSchema).optional(),
});

const surveySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'Survey must have at least one question'),
});

type SurveyFormData = z.infer<typeof surveySchema>;

const initialState = { message: null, errors: {} };

export function SurveyBuilderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // const [generateState, generateFormAction] = useFormState(generateQuestionsAction, { message: '', questions: [] });


  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [{ text: '', type: 'single-choice', options: [{ text: '' }] }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'questions',
  });

  const onSubmit = async (data: SurveyFormData) => {
    // In a real app, this would be a server action
    console.log('Survey Data:', data);
    toast({
      title: "Survey Created!",
      description: "Your new survey has been successfully created.",
    });
    // This is a mock action. Replace with your server action.
    setTimeout(() => router.push('/dashboard'), 1000);
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload a PDF file.",
        });
        return;
    }

    setIsGenerating(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const formData = new FormData();
        formData.append('pdfDataUri', reader.result as string);
        // generateFormAction(formData);
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({ variant: "destructive", title: "File Read Error", description: "Could not read the selected file." });
        setIsGenerating(false);
    };
  };

  // useEffect(() => {
  //   if (generateState?.message === 'success' && generateState.questions) {
  //       setValue('questions', generateState.questions.map(q => ({
  //           text: q,
  //           type: 'single-choice',
  //           options: [{text: 'Option 1'}, {text: 'Option 2'}]
  //       })));
  //       toast({
  //           title: "Questions Generated!",
  //           description: "Review and edit the AI-generated questions below.",
  //       });
  //   } else if (generateState?.error) {
  //       toast({
  //           variant: "destructive",
  //           title: "Generation Failed",
  //           description: generateState.error,
  //       });
  //   }
  //   setIsGenerating(false);
  // }, [generateState, setValue, toast]);


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Survey Details</CardTitle>
          <CardDescription>Start with a title and description for your survey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Survey Title</Label>
            <Input id="title" {...register('title')} placeholder="e.g., Customer Satisfaction Survey" />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" {...register('description')} placeholder="A short description of your survey's purpose." />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline">Questions</CardTitle>
              <CardDescription>Add or generate questions for your survey.</CardDescription>
            </div>
             <form>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                    Generate from PDF
                </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((question, qIndex) => (
            <div key={question.id} className="p-4 border rounded-lg bg-background">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`questions.${qIndex}.text`}>Question {qIndex + 1}</Label>
                  <Textarea
                    id={`questions.${qIndex}.text`}
                    {...register(`questions.${qIndex}.text`)}
                    placeholder="Enter your question here"
                  />
                  {errors.questions?.[qIndex]?.text && <p className="text-sm text-destructive mt-1">{errors.questions[qIndex].text.message}</p>}
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(qIndex)} className="ml-4 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <Label>Question Type</Label>
                  <Controller
                    name={`questions.${qIndex}.type`}
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-choice">Single Choice</SelectItem>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="text">Text Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {watch(`questions.${qIndex}.type`) !== 'text' && (
                <div className="mt-4 space-y-2">
                  <Label>Options</Label>
                  <OptionsArray qIndex={qIndex} control={control} register={register} errors={errors} />
                </div>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => append({ text: '', type: 'single-choice', options: [{ text: '' }] })}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Survey
        </Button>
      </div>
    </form>
  );
}

function OptionsArray({ qIndex, control, register, errors }: any) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `questions.${qIndex}.options`
    });

    return (
        <div className="space-y-2">
            {fields.map((option, oIndex) => (
                <div key={option.id} className="flex items-center gap-2">
                    <Input
                        {...register(`questions.${qIndex}.options.${oIndex}.text`)}
                        placeholder={`Option ${oIndex + 1}`}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(oIndex)} className="shrink-0">
                        <Trash2 className="h-4 w-4 text-destructive/70" />
                    </Button>
                </div>
            ))}
            <Button type="button" size="sm" variant="ghost" onClick={() => append({ text: '' })}>
                <Plus className="mr-2 h-4 w-4" /> Add Option
            </Button>
        </div>
    )
}
