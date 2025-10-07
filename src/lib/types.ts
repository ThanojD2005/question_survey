
export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  text: string;
  type?: 'single-choice' | 'text' | 'multiple-choice';
  options?: Option[];
  isSection?: boolean;
};

export type Survey = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
};

export type Answer = {
  questionId: string;
  value: string | string[];
}

export type SurveyResponse = {
  id: string;
  surveyId: string;
  submittedAt: string;
  answers: Answer[];
};
