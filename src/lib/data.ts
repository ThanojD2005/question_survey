
import type { Survey, SurveyResponse } from './types';

export const sampleSurveys: Survey[] = [
  {
    id: 'student-lifestyle-survey',
    title: 'Student Lifestyle Survey',
    description: 'A survey to understand the impact of smartphones and social media on student life.',
    createdAt: '2024-07-28T10:00:00Z',
    questions: [
      { id: 's1', isSection: true, text: 'Basic Information' },
      {
        id: 'q2', text: 'Age', type: 'single-choice', options: [
          { id: 'q2-o1', text: '18-20' },
          { id: 'q2-o2', text: '21-23' },
          { id: 'q2-o3', text: '24 and above' },
        ],
      },
      {
        id: 'q3', text: 'Gender', type: 'single-choice', options: [
          { id: 'q3-o1', text: 'Male' },
          { id: 'q3-o2', text: 'Female' },
        ],
      },
      {
        id: 'q4', text: 'Year of Study', type: 'single-choice', options: [
          { id: 'q4-o1', text: '1st Year' },
          { id: 'q4-o2', text: '2nd Year' },
          { id: 'q4-o3', text: '3rd Year' },
          { id: 'q4-o4', text: '4th Year' },
        ],
      },
      { id: 's2', isSection: true, text: 'Smartphone Usage Habit' },
      {
        id: 'q5', text: 'How many hours per day do you use your smartphone?', type: 'single-choice', options: [
          { id: 'q5-o1', text: 'Less than 2 hours' },
          { id: 'q5-o2', text: '2-4 hours' },
          { id: 'q5-o3', text: '4-6 hours' },
          { id: 'q5-o4', text: 'More than 6 hours' },
        ],
      },
      {
        id: 'q6', text: 'What do you mainly use your smartphone for?', type: 'single-choice', options: [
          { id: 'q6-o1', text: 'Social Media' },
          { id: 'q6-o2', text: 'Academic purposes (learning, research)' },
          { id: 'q6-o3', text: 'Communication (Calls, messaging)' },
          { id: 'q6-o4', text: 'Online shopping' },
        ],
      },
      { id: 's3', isSection: true, text: 'Social Media Impact' },
      {
        id: 'q7', text: 'How often do you use social media each day?', type: 'single-choice', options: [
          { id: 'q7-o1', text: 'Less than 1 hour' },
          { id: 'q7-o2', text: '1-3 hours' },
          { id: 'q7-o3', text: '3-5 hours' },
          { id: 'q7-o4', text: 'More than 5 hours' },
        ],
      },
      {
        id: 'q8', text: 'Which platforms do you use most?', type: 'multiple-choice', options: [
          { id: 'q8-o1', text: 'Facebook' },
          { id: 'q8-o2', text: 'Instagram' },
          { id: 'q8-o3', text: 'Tik Tok' },
          { id: 'q8-o4', text: 'Youtube' },
          { id: 'q8-o5', text: 'LinkedIn' },
        ],
      },
      { id: 's4', isSection: true, text: 'Learning Preferences' },
      {
        id: 'q9', text: 'Which learning mode do you prefer?', type: 'single-choice', options: [
          { id: 'q9-o1', text: 'Face to face learning' },
          { id: 'q9-o2', text: 'Online learning' },
          { id: 'q9-o3', text: 'Blend learning (both)' },
        ],
      },
      {
        id: 'q10', text: 'What challenges do you face in online learning?', type: 'multiple-choice', options: [
          { id: 'q10-o1', text: 'Poor internet connection' },
          { id: 'q10-o2', text: 'Difficulty focusing' },
          { id: 'q10-o3', text: 'Technical issues' },
          { id: 'q10-o4', text: 'Lack of interaction with lectures and students' },
        ],
      },
      { id: 's5', isSection: true, text: 'How to affect smart phone for student life style' },
      {
        id: 'q11', text: 'Do you use smartphone before 30 minutes to sleep?', type: 'single-choice', options: [
          { id: 'q11-o1', text: 'Yes' },
          { id: 'q11-o2', text: 'No' },
        ],
      },
      {
        id: 'q12', text: 'Does technology use affect your sleep schedule?', type: 'single-choice', options: [
          { id: 'q12-o1', text: 'Yes' },
          { id: 'q12-o2', text: 'No' },
        ],
      },
      {
        id: 'q13', text: 'Has technology made your university life easier or more stressful?', type: 'single-choice', options: [
          { id: 'q13-o1', text: 'Easier' },
          { id: 'q13-o2', text: 'More stressful' },
          { id: 'q13-o3', text: 'Both equally' },
        ],
      },
    ],
  },
];

export const sampleResponses: SurveyResponse[] = [
  // This can be used to mock survey responses
];
