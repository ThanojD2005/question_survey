

import { notFound } from 'next/navigation';
import { sampleSurveys } from '@/lib/data';
import SurveyResultsClient from '@/components/survey-results-client';
import { db } from '@/firebase/config';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { summarizeSurveyResponses } from '@/ai/flows/summarize-survey-responses';
import { Question } from '@/lib/types';


interface Answer {
  [key: string]: string | string[];
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  submittedAt: string; // Changed to string to be serializable
  answers: Answer;
}


export default async function SurveyResultsPage({ params }: { params: { surveyId: string } }) {
  const survey = sampleSurveys.find((s) => s.id === params.surveyId);

  if (!survey) {
    notFound();
  }

  const responses: SurveyResponse[] = [];
  const q = query(collection(db, "surveyResponses"), where("surveyId", "==", params.surveyId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const submittedAtTimestamp = data.submittedAt as Timestamp;
    responses.push({ 
        id: doc.id,
        surveyId: data.surveyId,
        submittedAt: submittedAtTimestamp.toDate().toISOString(), // Convert timestamp to string
        answers: data.answers
    });
  });

  const getAiSummary = async (surveyId: string, filteredResponses: SurveyResponse[]) => {
    "use server";
    const survey = sampleSurveys.find((s) => s.id === surveyId);
    if (!survey) {
      return "Error: Survey not found.";
    }
    
    if (filteredResponses.length === 0) {
      return "No responses match the current filters.";
    }

    const relevantQuestions = survey.questions.filter(q => !q.isSection);
    
    const formattedResponses = filteredResponses.map(r => {
        const userAnswers: Record<string, string | string[]> = {};
        relevantQuestions.forEach(q => {
            const answerValue = r.answers[q.id];
            if (!answerValue) return;

            let answerText: string | string[] | undefined;
            if (q.options) {
                if (Array.isArray(answerValue)) {
                    answerText = q.options.filter(opt => answerValue.includes(opt.id)).map(opt => opt.text);
                } else {
                    answerText = q.options.find(opt => opt.id === answerValue)?.text;
                }
            } else {
                answerText = answerValue as string;
            }

            if (answerText) {
                userAnswers[q.text] = answerText;
            }
        });
        return userAnswers;
    });

    const summary = await summarizeSurveyResponses({
      surveyQuestions: JSON.stringify(relevantQuestions.map(q => q.text)),
      surveyResponses: JSON.stringify(formattedResponses)
    });
    return summary.summary;
  };


  return (
    <div className="container mx-auto py-8">
      <SurveyResultsClient
        survey={survey}
        surveyId={params.surveyId}
        initialResponses={responses}
        getAiSummary={getAiSummary}
      />
    </div>
  );
}

    