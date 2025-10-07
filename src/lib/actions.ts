'use server';

import { redirect } from 'next/navigation';
import { sampleSurveys } from './data';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function submitResponse(prevState: any, formData: FormData) {
    const surveyId = formData.get('surveyId') as string;
    const survey = sampleSurveys.find(s => s.id === surveyId);
    if (!survey) {
        // This should not happen in this app, but good practice for robustness
        throw new Error('Survey not found');
    }
    
    const answers: { [key: string]: string | string[] } = {};

    survey.questions.forEach(question => {
        if(question.isSection) return;
        
        const answerValues = formData.getAll(`question-${question.id}`);

        if (answerValues.length > 0) {
            if (question.type === 'multiple-choice') {
                answers[question.id] = answerValues.map(v => v.toString());
            } else {
                answers[question.id] = answerValues[0].toString();
            }
        }
    });

    try {
        await addDoc(collection(db, 'surveyResponses'), {
            surveyId,
            submittedAt: serverTimestamp(),
            answers,
        });
    } catch (error) {
        console.error("Error writing document: ", error);
        // In a real app, you'd want to return a more user-friendly error.
        throw new Error('Failed to submit response due to a database error. Please try again.');
    }

    // Redirect is now handled on the client-side after state update.
    // This server action's return value is a promise that resolves on completion.
    return { success: true };
}


export async function deleteSurveyResponses(surveyId: string) {
    if (!surveyId) {
        return { success: false, error: 'Survey ID is required.' };
    }

    try {
        const q = query(collection(db, 'surveyResponses'), where('surveyId', '==', surveyId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: true, message: 'No responses found to delete.' };
        }

        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        revalidatePath(`/surveys/${surveyId}/results`);
        return { success: true };

    } catch (error) {
        console.error("Error deleting documents: ", error);
        return { success: false, error: 'Failed to delete responses due to a database error.' };
    }
}