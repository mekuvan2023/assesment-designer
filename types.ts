export enum Language {
  EN = 'en',
  HE = 'he',
}

export enum LearnerLevel {
  GRADE_1 = '1st grade',
  GRADE_2 = '2nd grade',
  GRADE_3 = '3rd grade',
  GRADE_4 = '4th grade',
  GRADE_5 = '5th grade',
  GRADE_6 = '6th grade',
  GRADE_7 = '7th grade',
  GRADE_8 = '8th grade',
  GRADE_9 = '9th grade',
  GRADE_10 = '10th grade',
  GRADE_11 = '11th grade',
  GRADE_12 = '12th grade',
  BA = 'BA',
  MA = 'MA',
  PRACTICAL_ENGINEERS = 'Practical Engineers',
}

export enum BloomLevel {
  EASY = 'Remember/Understand',
  MEDIUM = 'Apply/Analyze',
  HARD = 'Evaluate/Create',
}

export enum QuestionType {
  DIRECT = 'Direct Question',
  COMPLETION = 'Completion',
  CASE_BASED = 'Case-based/Scenario',
  NEGATIVE_STEM = 'Negative Stem',
  MATCHING_SEQUENCING = 'Matching/Sequencing',
  CAUSE_EFFECT = 'Cause & Effect',
}

export interface QuestionConfig {
  mcq: {
    direct: number;
    completion: number;
    caseBased: number;
    negativeStem: number;
    matchingSequencing: number;
    causeEffect: number;
  };
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  openEnded: number;
}


export interface Question {
  id: string;
  question: string;
  bloomLevel: BloomLevel;
  questionType?: QuestionType;
  choices: string[];
  correctAnswerIndex: number;
  shortExplanation: string;
  detailedExplanation?: string;
  distractorExplanations?: string[];
}

export interface OpenEndedQuestion {
  id: string;
  question: string;
  bloomLevel: BloomLevel;
}

export interface Test {
  id: string;
  title: string;
  questions: Question[];
  openEndedQuestions?: OpenEndedQuestion[];
  learnerLevel?: LearnerLevel;
  practiceModeEnabled?: boolean;
  language: Language;
  // Metadata for rebuilding/remixing
  sourceContent?: string;
  sourceTopics?: string[];
  sourceManualText?: string;
  sourceConfig?: QuestionConfig;
  createdAt: number;
}

export enum AppStep {
  DASHBOARD,
  SETUP,
  CONFIGURATION,
  REVIEW_GENERATE,
  GENERATING,
  REVIEW,
  PRACTICE,
  QUESTION_BANK,
  CREATE_TEST,
}