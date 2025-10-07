import { SurveyBuilderForm } from '@/components/survey-form';

export default function NewSurveyPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">Create New Survey</h1>
            <p className="text-muted-foreground">Build your survey from scratch or generate questions from a PDF.</p>
        </div>
        <SurveyBuilderForm />
      </div>
    </div>
  );
}
