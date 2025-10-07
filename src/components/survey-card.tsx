
'use client';

import Link from 'next/link';
import { BarChart2, Calendar, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { Survey } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';

interface SurveyCardProps {
  survey: Survey;
}

export default function SurveyCard({ survey }: SurveyCardProps) {
  const { db } = useFirebase();
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    if (!db) return;

    const unsubscribe = onSnapshot(collection(db, 'surveyResponses'), (snapshot) => {
        const count = snapshot.docs.filter(doc => doc.data().surveyId === survey.id).length;
        setResponseCount(count);
    });

    return () => unsubscribe();
  }, [db, survey.id]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline tracking-tight">{survey.title}</CardTitle>
        <CardDescription className="line-clamp-2">{survey.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>Created on {format(parseISO(survey.createdAt), 'MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          <span>{responseCount} Responses</span>
        </div>
      </CardContent>
      <CardFooter className="flex-col sm:flex-row gap-2">
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/surveys/${survey.id}/results`}>
            <BarChart2 className="mr-2 h-4 w-4" />
            View Results
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
