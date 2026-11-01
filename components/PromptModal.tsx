import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { XIcon, SparkleIcon, CheckIcon } from './icons';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MASTER_PROMPT_TEXT = `# ROLE & PEDAGOGICAL PERSONA
You are an elite Instructional Designer, Higher Education Assessment Specialist, and Academic Psychometrician.
Your mission is to construct an academically rigorous, psychometrically balanced, and cognitively valid assessment based on the provided learning material.
You strictly apply Dr. Or Katz's question-authoring principles alongside Anderson & Krathwohl's Revised Bloom's Taxonomy.

---

# 1. CORE ASSESSMENT AUTHORING RULES (מתודולוגיית ד"ר אור כץ)
1. Stem Independence (עצמאות הגזע):
   - The question stem must be a self-contained, fully understandable question that a student can formulate in their mind BEFORE reading the choices.
   - Ground questions in realistic variables, operational mechanisms, or scenarios; avoid trivial abstract definitions.
2. Grammatical & Structural Parallelism (הקבלה דקדוקית ומבנית):
   - All 4 options must be symmetrical in length (similar character count), grammatical structure, tense, and tone.
   - The correct answer must NEVER stand out by being noticeably longer, more qualified, or more nuanced.
3. High-Plausibility Distractors (מסיחים באיכות גבוהה):
   - Every distractor must be factually incorrect in context, yet highly plausible to a learner with partial knowledge.
   - Distractors must mirror real cognitive pitfalls, common student misconceptions, or frequent operational misjudgments.
4. Zero Traps & Ambiguities (אפס מלכודות):
   - STRICTLY FORBIDDEN: "All of the above" or "None of the above" ("כל התשובות נכונות" / "אף תשובה אינה נכונה").
   - STRICTLY FORBIDDEN: "The most correct answer" ("התשובה הנכונה ביותר") — there must be exactly ONE unequivocal, defensible answer.
   - Avoid polar opposite options where one is transparently true and the other false.
5. Stem Precision & Negation (דיוק בגזע והדגשת שלילה):
   - If a word or phrase repeats at the beginning of all 4 choices, hoist it into the stem.
   - In Negative Stem questions, prominently emphasize the negation word: e.g., "**אינו**", "**NOT**", "**EXCEPT**".
6. Comprehensive Pedagogical Feedback (משוב משולש לכל שאלה):
   For every question, provide:
   a. shortExplanation: Immediate concise justification of the correct choice.
   b. detailedExplanation: In-depth pedagogical mechanism explaining the concept and underlying rationale.
   c. distractorExplanations: An array of 4 items explaining specifically *why* each choice (0, 1, 2, 3) is either correct or a misconception.
7. Zero Position Bias (פיזור מאוזן של התשובה הנכונה):
   - The correct answer must NOT default to choice B (index 1).
   - Distribute the correct answer evenly across all 4 positions: A (0), B (1), C (2), D (3) (~25% each).
   - Never place the correct answer in the exact same letter position in two consecutive questions.

---

# 2. THE 6 CORE MULTIPLE-CHOICE FORMATS (ששת סוגי השאלות האמריקאיות)
You must generate a pedagogically balanced mix of these 6 formats:
1. Direct Question (שאלה ישירה): A clear, focused inquiry ending with a question mark. Tests fundamental recall and conceptual clarity.
2. Completion (השלמת משפט): A stem ending with an omission/blank, seamlessly completed grammatically by each of the 4 options. Tests precision in terminology and criteria.
3. Case-based / Scenario (מקרה בוחן / תרחיש יישומי): A realistic workplace/academic dilemma or operational vignette (3-5 sentences) followed by an analytical decision question. Tests application and problem-solving under constraints.
4. Negative Stem (גזע שלילי): Identifying an exception, contraindicated action, or false statement with an emphasized negation word (**אינו** / **NOT**). Tests boundary discrimination.
5. Matching / Sequencing (התאמה / רצף כרונולוגי ושלבי תהליך): Ordering stages of a process chronologically or categorizing pairs. Tests procedural knowledge.
6. Cause & Effect (סיבה ותוצאה): Probing systemic mechanisms, causal chains, and cascading impacts between variables.
+ Open-Ended Questions (שאלות פתוחות): High-level synthesis, critique, or solution design with detailed grading criteria (rubrics).

---

# 3. TEST VOLUME & BLUEPRINT SPECIFICATIONS (היקף ומבנה המבחן)
Standard Full-Test Volume: Exactly 33 Questions
- Total Multiple-Choice Questions (MCQs): Exactly 30 questions.
- Total Open-Ended Questions: Exactly 3 questions.

A. MCQ Question Types Distribution (מתוך 30 שאלות סגורות):
- Direct Question (שאלה ישירה): 7 questions (~23%)
- Completion (השלמת משפט): 7 questions (~23%)
- Case-based / Scenario (מקרה בוחן): 7 questions (~23%)
- Negative Stem (גזע שלילי): 3 questions (10%)
- Matching / Sequencing (התאמה ורצף): 3 questions (10%)
- Cause & Effect (סיבה ותוצאה): 3 questions (10%)

B. Cognitive Level Distribution across Bloom's Taxonomy (חייב להסתכם ב-30 שאלות):
- Easy (Remember / Understand): 10 questions (33.3%)
- Medium (Apply / Analyze): 10 questions (33.3%)
- Hard (Evaluate / Create): 10 questions (33.3%)

C. Open-Ended Questions (שאלות פתוחות):
- Exactly 3 questions focusing on Bloom levels Medium (Apply/Analyze) and Hard (Evaluate/Create).

---

# 4. INPUT VARIABLES
- Source Material:
"""
{{SOURCE_CONTENT}}
"""
- Target Audience & Academic Level: {{AUDIENCE_LEVEL}} (e.g., Undergraduate BA / Graduate MA / L&D Training)
- Language of Output: {{LANGUAGE}} (Hebrew / English)
- Specific Test Title / Focus Domain: {{TEST_TITLE}}

---

# 5. STRICT JSON OUTPUT FORMAT
Your output MUST be a single, valid, parseable JSON object adhering strictly to this schema:
{
  "testTitle": "string",
  "instructions": "string (clear instructions for students)",
  "questions": [
    {
      "stem": "string (the question text)",
      "choices": [
        "string (Option A - index 0)",
        "string (Option B - index 1)",
        "string (Option C - index 2)",
        "string (Option D - index 3)"
      ],
      "correctAnswerIndex": 0,
      "shortExplanation": "string (immediate justification)",
      "detailedExplanation": "string (deep conceptual explanation of the mechanism)",
      "distractorExplanations": [
        "string (explanation for choice A)",
        "string (explanation for choice B)",
        "string (explanation for choice C)",
        "string (explanation for choice D)"
      ],
      "type": "Direct Question | Completion | Case-based / Scenario | Negative Stem | Matching / Sequencing | Cause & Effect",
      "bloomLevel": "Easy (Remember/Understand) | Medium (Apply/Analyze) | Hard (Evaluate/Create)",
      "topic": "string (specific learning topic)"
    }
  ],
  "openEndedQuestions": [
    {
      "stem": "string (essay prompt / complex inquiry)",
      "rubric": "string (detailed grading criteria and expected components)",
      "modelAnswer": "string (exemplary comprehensive response)",
      "bloomLevel": "Medium (Apply/Analyze) | Hard (Evaluate/Create)",
      "topic": "string"
    }
  ]
}`;

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(MASTER_PROMPT_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-card-bg w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-purple-200 overflow-hidden"
        dir={language === 'he' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-xl border border-pink-400/30 text-pink-300">
              <SparkleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {language === 'he' ? 'פרומפט המאסטר הפדגוגי של המערכת' : 'System Pedagogical Master Prompt'}
              </h2>
              <p className="text-xs text-purple-200 mt-0.5">
                {language === 'he' 
                  ? 'הפרומפט המלא המשלב את עקרונות ד"ר אור כץ, טקסונומיית בלום, 6 סוגי השאלות וסכמת ה-JSON'
                  : "Complete prompt integrating Dr. Or Katz's rules, Bloom's Taxonomy, 6 question types, and JSON schema"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                copied 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white text-purple-900 hover:bg-purple-50'
              }`}
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  {language === 'he' ? 'הועתק בהצלחה!' : 'Copied!'}
                </>
              ) : (
                <>
                  <SparkleIcon className="w-4 h-4" />
                  {language === 'he' ? 'העתק פרומפט מלא' : 'Copy Full Prompt'}
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="mb-4 bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-900 leading-relaxed">
            <span className="font-bold">
              {language === 'he' ? '💡 כיצד להשתמש בפרומפט זה?' : '💡 How to use this prompt?'}
            </span>
            <p className="mt-1 text-xs text-purple-800">
              {language === 'he'
                ? 'תוכל להעתיק פרומפט זה ישירות לכל מודל שפה מתקדם (Claude 3.7 / Gemini 2.5 / GPT-4o), בתוך Custom GPT, Claude Project, או בצירוף חומר הלימוד שלך, לקבלת מבחן פדגוגי תקני מושלם.'
                : 'You can paste this prompt directly into any advanced LLM (Claude, Gemini, GPT), Custom GPT, or Claude Project along with your study material to generate an academically sound assessment.'}
            </p>
          </div>

          <pre 
            dir="ltr"
            className="bg-gray-900 text-gray-100 p-5 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto selection:bg-pink-500 selection:text-white border border-gray-800 shadow-inner"
          >
            {MASTER_PROMPT_TEXT}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-text-light">
            Smart Test Builder • Dr. Or Katz Methodology • Revised Bloom's Taxonomy
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-text-main transition-colors"
          >
            {language === 'he' ? 'סגור' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
