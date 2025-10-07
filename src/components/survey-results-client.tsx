
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Survey, Question } from '@/lib/types';
import { BrainCircuit, Download, Loader2, Trash2, FileText, FilterX, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChartConfig, ChartContainer } from './ui/chart';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { SurveyResponse } from '@/app/surveys/[surveyId]/results/page';
import { deleteSurveyResponses } from '@/lib/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from './ui/separator';


interface SurveyResultsClientProps {
  survey: Survey;
  surveyId: string;
  initialResponses: SurveyResponse[];
  getAiSummary: (surveyId: string, responses: SurveyResponse[]) => Promise<string>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function SurveyResultsClient({ survey, surveyId, initialResponses, getAiSummary }: SurveyResultsClientProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtering state
  const [filters, setFilters] = useState({
    age: 'all',
    gender: 'all',
    platform: 'all',
    yearOfStudy: 'all',
  });
  const [filteredResponses, setFilteredResponses] = useState(initialResponses);

  useEffect(() => {
    let newFilteredResponses = initialResponses;
    
    if(filters.age !== 'all') {
        newFilteredResponses = newFilteredResponses.filter(r => r.answers['q2'] === filters.age);
    }
    if(filters.gender !== 'all') {
        newFilteredResponses = newFilteredResponses.filter(r => r.answers['q3'] === filters.gender);
    }
    if(filters.yearOfStudy !== 'all') {
        newFilteredResponses = newFilteredResponses.filter(r => r.answers['q4'] === filters.yearOfStudy);
    }
    if(filters.platform !== 'all') {
        newFilteredResponses = newFilteredResponses.filter(r => {
            const platformAnswers = r.answers['q8'];
            return Array.isArray(platformAnswers) && platformAnswers.includes(filters.platform);
        });
    }

    setFilteredResponses(newFilteredResponses);
  }, [filters, initialResponses]);


  const chartData = useMemo(() => survey.questions
    .filter(q => (q.type === 'single-choice' || q.type === 'multiple-choice') && q.options)
    .map(question => {
      const counts: { [key: string]: { name: string; value: number } } = {};
      
      question.options!.forEach(opt => {
        counts[opt.id] = { name: opt.text, value: 0 };
      });

      filteredResponses.forEach(response => {
        const answer = response.answers[question.id];
        if (answer) {
          if (Array.isArray(answer)) { // Multiple choice
            answer.forEach(val => {
              if (counts[val]) counts[val].value++;
            });
          } else { // Single choice
            if (counts[answer as string]) counts[answer as string].value++;
          }
        }
      });
      
      return {
        questionId: question.id,
        questionText: question.text,
        type: question.type as 'single-choice' | 'multiple-choice',
        data: Object.values(counts),
      };
    }), [survey.questions, filteredResponses]);
    
  const textAnswers = useMemo(() => survey.questions
    .filter(q => q.type === 'text')
    .map(question => {
        const answers = filteredResponses
            .map(r => r.answers[question.id])
            .filter(Boolean) as string[];
        return {
            questionId: question.id,
            questionText: question.text,
            answers,
        }
    }), [survey.questions, filteredResponses]);

    const filterOptions = useMemo(() => {
        return {
            age: survey.questions.find(q => q.id === 'q2')?.options || [],
            gender: survey.questions.find(q => q.id === 'q3')?.options || [],
            yearOfStudy: survey.questions.find(q => q.id === 'q4')?.options || [],
            platform: survey.questions.find(q => q.id === 'q8')?.options || []
        }
    }, [survey.questions]);
    
  const handleFilterChange = (filterName: 'age' | 'gender' | 'platform' | 'yearOfStudy', value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({ age: 'all', gender: 'all', platform: 'all', yearOfStudy: 'all' });
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const result = await getAiSummary(surveyId, filteredResponses);
      setSummary(result);
      toast({
        title: 'Summary Generated',
        description: 'The AI-powered summary of filtered responses is now available.',
      });
    } catch (error) {
        console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error generating summary',
        description: 'Could not connect to the AI service or process the data.',
      });
    }
    setIsSummarizing(false);
  };
  
  const getAnswerText = (questionId: string, answerValue: string | string[]): string => {
    const question = survey.questions.find(q => q.id === questionId);
    if (!question || !question.options) {
      return Array.isArray(answerValue) ? answerValue.join(', ') : answerValue;
    }

    if (Array.isArray(answerValue)) {
      return answerValue.map(val => question.options?.find(opt => opt.id === val)?.text || val).join(', ');
    }
    return question.options.find(opt => opt.id === answerValue)?.text || answerValue;
  };

  const handleExportCSV = () => {
    const headers = ['Response ID', 'Submission Date', ...survey.questions.filter(q => !q.isSection).map(q => q.text)];
    const rows = filteredResponses.map(response => {
      const row = [
        response.id,
        response.submittedAt ? format(parseISO(response.submittedAt), 'yyyy-MM-dd HH:mm:ss') : '',
        ...survey.questions.filter(q => !q.isSection).map(q => {
          const answer = response.answers[q.id];
          if (answer === undefined || answer === null) return '';
          const answerText = getAnswerText(q.id, answer);
          // Escape commas in answer text
          return `"${answerText.replace(/"/g, '""')}"`;
        })
      ];
      return row.join(',');
    });

    const csvContent = `data:text/csv;charset=utf-8,${headers.join(',')}\n${rows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${survey.title.replace(/ /g, '_')}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'CSV Exported', description: 'Your data has been downloaded.' });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let yPos = 22;

    doc.setFontSize(18);
    doc.text(survey.title, 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.text(`Total responses: ${filteredResponses.length}`, 14, yPos);
    yPos += 10;
    
    if (summary) {
        doc.setFontSize(14);
        doc.text("AI-Generated Summary", 14, yPos);
        yPos += 8;
        
        doc.setFontSize(11);
        const splitSummary = doc.splitTextToSize(summary, 180);
        doc.text(splitSummary, 14, yPos);
        yPos += splitSummary.length * 5 + 10;
    }

    chartData.forEach(chart => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 22;
        }

        doc.setFontSize(12);
        doc.text(chart.questionText, 14, yPos);
        yPos += 8;

        (doc as any).autoTable({
            head: [['Option', 'Count']],
            body: chart.data.map(d => [d.name, d.value]),
            startY: yPos,
            theme: 'grid',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [22, 160, 133] },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
    });

    textAnswers.forEach(item => {
        if (item.answers.length > 0) {
            if (yPos > 250) {
                doc.addPage();
                yPos = 22;
            }
            doc.setFontSize(12);
            doc.text(item.questionText, 14, yPos);
            yPos += 8;
            
            doc.setFontSize(10);
            item.answers.forEach(answer => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 22;
                }
                const splitAnswer = doc.splitTextToSize(`- ${answer}`, 180);
                doc.text(splitAnswer, 14, yPos);
                yPos += splitAnswer.length * 5 + 2;
            });
            yPos += 8;
        }
    });


    doc.save(`${survey.title.replace(/ /g, '_')}_analysis_report.pdf`);
    toast({ title: 'PDF Report Exported', description: 'Your analysis report has been downloaded.' });
  };

  const handleExportSummaryPDF = () => {
    if (!summary) {
      toast({ variant: 'destructive', title: 'No Summary', description: 'Please generate the summary first.' });
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(survey.title, 14, 22);

    doc.setFontSize(14);
    doc.text("AI-Generated Summary", 14, 32);

    doc.setFontSize(11);
    const splitSummary = doc.splitTextToSize(summary, 180);
    doc.text(splitSummary, 14, 42);
    
    doc.save(`${survey.title.replace(/ /g, '_')}_summary.pdf`);
    toast({ title: 'Summary PDF Exported', description: 'The AI summary has been downloaded.' });
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
        const result = await deleteSurveyResponses(surveyId);
        if (result.success) {
            toast({
                title: 'All Responses Deleted',
                description: 'The records for this survey have been cleared.',
            });
            // This will trigger a re-render with zero responses
            setFilteredResponses([]); 
        } else {
            throw new Error(result.error || 'An unknown error occurred.');
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: error.message || 'Could not delete survey responses.',
        });
    } finally {
        setIsDeleting(false);
    }
  };


  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">{survey.title}</h1>
          <p className="text-muted-foreground">Results and Analysis ({filteredResponses.length} of {initialResponses.length} responses)</p>
        </div>
        <div className='flex gap-2 shrink-0'>
            <Button onClick={handleSummarize} disabled={isSummarizing || filteredResponses.length === 0}>
            {isSummarizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <BrainCircuit className="mr-2 h-4 w-4" />
            )}
            AI Summary
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={filteredResponses.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF} disabled={filteredResponses.length === 0}>
                  Export Analysis PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV} disabled={filteredResponses.length === 0}>
                  Export as CSV (Excel)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting || initialResponses.length === 0}>
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all {initialResponses.length} responses for this survey.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
            <div className='flex justify-between items-center'>
                <CardTitle className="font-headline flex items-center gap-2"><Filter className="h-5 w-5"/> Filters</CardTitle>
                <Button variant="ghost" onClick={clearFilters} disabled={filters.age === 'all' && filters.gender === 'all' && filters.platform === 'all' && filters.yearOfStudy === 'all'}>
                    <FilterX className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <div>
                <label className="text-sm font-medium text-muted-foreground">Age Group</label>
                <Select value={filters.age} onValueChange={(v) => handleFilterChange('age', v)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Ages</SelectItem>
                        {filterOptions.age.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.text}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div>
                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                <Select value={filters.gender} onValueChange={(v) => handleFilterChange('gender', v)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        {filterOptions.gender.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.text}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="text-sm font-medium text-muted-foreground">Year of Study</label>
                <Select value={filters.yearOfStudy} onValueChange={(v) => handleFilterChange('yearOfStudy', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {filterOptions.yearOfStudy.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.text}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div>
                <label className="text-sm font-medium text-muted-foreground">Platform</label>
                <Select value={filters.platform} onValueChange={(v) => handleFilterChange('platform', v)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        {filterOptions.platform.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.text}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>


      {summary && (
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="font-headline flex items-center gap-2"><BrainCircuit className="h-6 w-6 text-primary"/> AI-Generated Summary</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportSummaryPDF}>
              <FileText className="mr-2 h-4 w-4"/>
              Download Summary
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 whitespace-pre-wrap">{summary}</p>
          </CardContent>
        </Card>
      )}

      {filteredResponses.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No Matching Responses</h2>
            <p className="text-muted-foreground mt-2">There are no responses that match your current filter criteria.</p>
        </div>
      )}

      {filteredResponses.length > 0 && (
        <>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {chartData.map(({ questionId, questionText, data, type }) => {
                const chartConfig: ChartConfig = data.reduce((acc, item, index) => {
                    acc[item.name] = { label: item.name, color: COLORS[index % COLORS.length] };
                    return acc;
                }, {} as ChartConfig);

                return (
                    <Card key={questionId}>
                    <CardHeader>
                        <CardTitle>{questionText}</CardTitle>
                        <CardDescription>{type === 'single-choice' ? 'Single Choice' : 'Multiple Choice'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                            {type === 'single-choice' ? (
                            <PieChart>
                                <Tooltip contentStyle={{background: "hsl(var(--background))", borderRadius: "var(--radius)"}}/>
                                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                            ) : (
                            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, width: 90}} interval={0} />
                                <Tooltip contentStyle={{background: "hsl(var(--background))", borderRadius: "var(--radius)"}}/>
                                <Bar dataKey="value" name="Responses" fill="hsl(var(--chart-1))" radius={4} />
                            </BarChart>
                            )}
                        </ResponsiveContainer>
                        ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            No responses for this question yet.
                        </div>
                        )}
                    </CardContent>
                    </Card>
                );
                })}
            </div>
            
            {textAnswers.length > 0 && textAnswers.some(t => t.answers.length > 0) && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold font-headline mb-4">Text Answers</h2>
                    <div className="space-y-6">
                    {textAnswers.map(({ questionId, questionText, answers }) => (
                        answers.length > 0 && (
                            <Card key={questionId}>
                                <CardHeader>
                                <CardTitle>{questionText}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {answers.map((answer, index) => (
                                        <li key={index} className="text-sm text-foreground/90 bg-secondary/50 p-3 rounded-md border">{answer}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )
                    ))}
                    </div>
                </div>
            )}
        </>
      )}
    </div>
  );
}


    