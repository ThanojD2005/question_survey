import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SurveySuccessPage() {
  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
          <CardTitle className="font-headline text-3xl mt-4">Thank You!</CardTitle>
          <CardDescription className="mt-2">Your response has been successfully submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
