
import { sampleSurveys } from '@/lib/data';
import SurveyCard from '@/components/survey-card';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Survey Dashboard</h1>
        <p className="text-muted-foreground">
          Here are all your active surveys. Click on a survey to see detailed results.
        </p>
      </div>

      {sampleSurveys.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {sampleSurveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No Surveys Yet</h2>
            <p className="text-muted-foreground mt-2">Create your first survey to see it here.</p>
        </div>
      )}
    </div>
  );
}
