
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { LearnerLevel, Language, Test, Question, BloomLevel, QuestionConfig, OpenEndedQuestion, QuestionType } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || " " });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        testTitle: {
            type: Type.STRING,
            description: "A suitable title for the test based on the topics.",
        },
        questions: {
            type: Type.ARRAY,
            description: "An array of multiple-choice questions matching the configuration.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "The question stem."
                    },
                    questionType: {
                        type: Type.STRING,
                        description: "The type of multiple-choice question.",
                        enum: Object.values(QuestionType)
                    },
                    bloomLevel: {
                        type: Type.STRING,
                        enum: [BloomLevel.EASY, BloomLevel.MEDIUM, BloomLevel.HARD],
                        description: "The corresponding Bloom's Taxonomy level for the question."
                    },
                    choices: {
                        type: Type.ARRAY,
                        description: "An array of exactly 4 possible answer choices (strings).",
                        items: { type: Type.STRING },
                    },
                    correctAnswerIndex: {
                        type: Type.INTEGER,
                        description: "The 0-based index of the correct answer in the 'choices' array (0 for A, 1 for B, 2 for C, 3 for D). CRITICAL: Do NOT always make B (index 1) the correct answer. Distribute evenly across 0, 1, 2, and 3 throughout the questions."
                    },
                    shortExplanation: {
                        type: Type.STRING,
                        description: "A concise, one-sentence explanation for why the correct answer is right."
                    },
                    detailedExplanation: {
                        type: Type.STRING,
                        description: "An optional, but highly recommended, comprehensive and multi-sentence paragraph that elaborates on the concept being tested. It should provide context and clarify common misconceptions."
                    },
                    distractorExplanations: {
                        type: Type.ARRAY,
                        description: "An optional array of 4 strings, explaining why each choice (including the correct one) is correct or incorrect.",
                        items: { type: Type.STRING },
                    }
                },
                required: ["question", "questionType", "bloomLevel", "choices", "correctAnswerIndex", "shortExplanation"]
            }
        },
        openEndedQuestions: {
            type: Type.ARRAY,
            description: "An array of open-ended questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "The open-ended question stem."
                    },
                    bloomLevel: {
                        type: Type.STRING,
                        enum: [BloomLevel.EASY, BloomLevel.MEDIUM, BloomLevel.HARD],
                        description: "The corresponding Bloom's Taxonomy level. The distribution should be balanced if not specified."
                    }
                },
                required: ["question", "bloomLevel"]
            }
        }
    },
    required: ["testTitle", "questions", "openEndedQuestions"],
};

export const extractTopicsFromContent = async (content: string, lang: Language): Promise<string> => {
    const languageName = lang === Language.HE ? "Hebrew" : "English";
    const prompt = `
        Analyze the following text, which may consist of multiple combined documents or files (separated by "---").
        Your task is to identify the main topics and key concepts covered across ALL the provided documents.
        Ensure you do not focus solely on the first part of the text; scan the entire content to provide a comprehensive list of topics.
        
        List them as a single, comma-separated string (e.g., "Topic 1, Topic 2, Topic 3").
        The topics must be in ${languageName}.
        Do not add any other explanatory text, preamble, or markdown. Just the comma-separated list of topics.

        Text to Analyze:
        ---
        ${content.substring(0, 100000)}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        const topics = response.text.trim();
        if (!topics) {
            throw new Error("AI failed to extract topics.");
        }
        return topics;
    } catch (error) {
        console.error("Error extracting topics from Gemini:", error);
        throw new Error("Failed to extract topics from the provided content.");
    }
};

const createPrompt = (content: string, topics: string, level: LearnerLevel, lang: Language, config: QuestionConfig, title?: string) => {
    const languageName = lang === Language.HE ? "Hebrew" : "English";
    const mcqTotal = Object.values(config.mcq).reduce((a, b) => a + b, 0);

    const mcqDistribution = `
- ${QuestionType.DIRECT}: ${config.mcq.direct}
- ${QuestionType.COMPLETION}: ${config.mcq.completion}
- ${QuestionType.CASE_BASED}: ${config.mcq.caseBased}
- ${QuestionType.NEGATIVE_STEM}: ${config.mcq.negativeStem}
- ${QuestionType.MATCHING_SEQUENCING}: ${config.mcq.matchingSequencing}
- ${QuestionType.CAUSE_EFFECT}: ${config.mcq.causeEffect}`;

    const difficultyDistribution = `
- ${BloomLevel.EASY}: ${config.difficulty.easy}
- ${BloomLevel.MEDIUM}: ${config.difficulty.medium}
- ${BloomLevel.HARD}: ${config.difficulty.hard}`;

    return `
Generate a complete, well-structured test based on the provided details and strict pedagogical guidelines.

**Instructions:**
- **Language:** All output MUST be in **${languageName}**.
- **Learner Level:** ${level}
- **Topics:** ${topics}
${title ? `- **Test Title Hint:** Use "${title}" as inspiration.` : ''}
- **Source Content:**
---
${content}
---

**Strict Pedagogical Guidelines (Based on Dr. Or Katz's Methodology):**
1.  **Stem Quality:** The question stem MUST be a complete question that can be understood and answered even without reading the choices. Avoid abstract definitions; use specific variables or scenarios from the content.
2.  **Parallelism:** All 4 answer choices MUST be of similar length, same grammatical structure, and identical style.
3.  **No Logical Traps:**
    - DO NOT use "All of the above" or "None of the above".
    - DO NOT use "The most correct" answer; there must be exactly ONE factually correct answer.
    - Avoid pairs of opposite choices where one is clearly correct.
4.  **Distractor Plausibility:** Distractors must be factually incorrect but highly plausible. Use common student misconceptions or "errors in judgment" related to the content.
5.  **Stem Precision:**
    - If a word or phrase is repeated at the start of every choice, MOVE it to the stem.
    - Avoid double negatives.
    - If the question type is "Negative Stem", clearly emphasize the negation (e.g., using "NOT" or "EXCEPT" in caps/bold-equivalent text).
6.  **Bloom's Taxonomy Integration:**
    - **Remember/Understand (Easy):** Use verbs like: Define, Identify, Describe, Explain, Interpret.
    - **Apply/Analyze (Medium):** Use verbs like: Calculate, Demonstrate, Solve, Differentiate, Categorize, Analyze relationships.
    - **Evaluate/Create (Hard):** Use verbs like: Judge, Critique, Propose, Design, Assemble, Assess a specific case study.
7.  **CRITICAL - Answer Position Distribution (Eliminate Option B Bias):**
    - The correct answer MUST NOT always be in position B (index 1).
    - You MUST evenly and pseudo-randomly distribute the correct answer across all 4 positions: A (index 0), B (index 1), C (index 2), and D (index 3).
    - Ensure approximately 25% of questions have A as correct, 25% have B, 25% have C, and 25% have D.
    - NEVER place the correct answer in the exact same letter position in two consecutive questions.

**Test Structure Requirements:**
- **Total Multiple-Choice Questions:** Exactly ${mcqTotal}.
- **MCQ Type Distribution:** Adhere strictly: ${mcqDistribution}
- **MCQ Difficulty Distribution:** Adhere strictly: ${difficultyDistribution}
- **Total Open-Ended Questions:** Exactly ${config.openEnded}.
- **Output Format:** JSON object strictly adhering to the schema.
- **JSON Integrity:** Properly escape all strings (e.g., \\", \\n).

Now, generate the test based on these precise rules.
`;
};

/**
 * Ensures that the correct answers across the test are evenly and pseudo-randomly distributed
 * across positions A (0), B (1), C (2), and D (3), eliminating any position bias (such as the AI
 * repeatedly picking B/index 1), and keeping choices and distractor explanations strictly synchronized.
 */
export const balanceQuestionDistributions = (questions: Question[]): Question[] => {
    if (!questions || questions.length === 0) return questions;

    const count = questions.length;
    const pool = [0, 1, 2, 3];
    const fullSets = Math.floor(count / 4);
    const remainder = count % 4;

    const targetIndices: number[] = [];
    for (let s = 0; s < fullSets; s++) {
        targetIndices.push(0, 1, 2, 3);
    }
    
    // Shuffle the pool for remaining items
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    for (let r = 0; r < remainder; r++) {
        targetIndices.push(shuffledPool[r]);
    }

    // Shuffle targetIndices
    for (let i = targetIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [targetIndices[i], targetIndices[j]] = [targetIndices[j], targetIndices[i]];
    }

    // Prevent immediate consecutive duplicate letters if array has multiple items
    for (let i = 1; i < targetIndices.length; i++) {
        if (targetIndices[i] === targetIndices[i - 1]) {
            for (let j = i + 1; j < targetIndices.length; j++) {
                if (targetIndices[j] !== targetIndices[i - 1] && (j === targetIndices.length - 1 || targetIndices[j] !== targetIndices[j + 1])) {
                    [targetIndices[i], targetIndices[j]] = [targetIndices[j], targetIndices[i]];
                    break;
                }
            }
        }
    }

    return questions.map((q, idx) => {
        if (!q.choices || q.choices.length !== 4) return q;

        const currentCorrect = (typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4)
            ? q.correctAnswerIndex
            : 0;
        const targetCorrect = targetIndices[idx % targetIndices.length];

        if (currentCorrect === targetCorrect) {
            return q;
        }

        // Pair each choice with its corresponding distractor explanation (if present)
        const items = q.choices.map((choice, i) => ({
            choice,
            isCorrect: i === currentCorrect,
            explanation: q.distractorExplanations && q.distractorExplanations[i] !== undefined
                ? q.distractorExplanations[i]
                : ''
        }));

        const correctItem = items[currentCorrect];
        const otherItems = items.filter((_, i) => i !== currentCorrect);

        const newItems: typeof items = [];
        let otherIndex = 0;
        for (let i = 0; i < 4; i++) {
            if (i === targetCorrect) {
                newItems.push(correctItem);
            } else {
                newItems.push(otherItems[otherIndex++]);
            }
        }

        return {
            ...q,
            choices: newItems.map(item => item.choice),
            correctAnswerIndex: targetCorrect,
            distractorExplanations: q.distractorExplanations
                ? newItems.map(item => item.explanation)
                : q.distractorExplanations
        };
    });
};

export const generateTestFromContent = async (
    content: string,
    topics: string,
    learnerLevel: LearnerLevel,
    language: Language,
    config: QuestionConfig,
    title?: string,
): Promise<Test> => {
    const prompt = createPrompt(content, topics, learnerLevel, language, config, title);
    let fullResponseText: string | undefined;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        fullResponseText = response.text;
        let jsonText = fullResponseText.trim();
        
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = jsonText.match(jsonRegex);
        if (match) {
            jsonText = match[1];
        }

        const parsedJson = JSON.parse(jsonText);

        if (!parsedJson.questions || !parsedJson.testTitle || !parsedJson.openEndedQuestions) {
            throw new Error("AI response is missing required 'questions', 'openEndedQuestions', or 'testTitle' fields.");
        }

        const rawQuestions: Question[] = parsedJson.questions.map((q: any, index: number) => ({
            id: `gen-mcq-${Date.now()}-${index}`,
            ...q,
        }));

        // Balance the correct answers across A (0), B (1), C (2), D (3) to eliminate position bias
        const questions = balanceQuestionDistributions(rawQuestions);

        const openEndedQuestions: OpenEndedQuestion[] = parsedJson.openEndedQuestions.map((q: any, index: number) => ({
            id: `gen-oe-${Date.now()}-${index}`,
            ...q,
        }));

        const test: Test = {
            id: `test-${Date.now()}`,
            title: parsedJson.testTitle,
            questions: questions,
            openEndedQuestions: openEndedQuestions,
            language: language,
            createdAt: Date.now(),
        };

        return test;

    } catch (error) {
        console.error("Error generating test from Gemini:", error);
        
        if (error instanceof SyntaxError) {
             console.error("Faulty JSON response from AI:", fullResponseText);
             throw new Error("Failed to parse AI response. The generated JSON was malformed. Please try generating again.");
        }
        
        if (error instanceof Error && error.message.includes("API_KEY")) {
             throw new Error("Gemini API Error: The API_KEY is not valid. Please check your environment configuration.");
        }

        throw new Error("Failed to generate test. The AI may have returned an invalid format. Please try again with clearer content or topics.");
    }
};

export const generateLearningFeedback = async (
    testTitle: string,
    questions: Question[],
    userAnswers: Record<string, number>,
    lang: Language
): Promise<string> => {
    const languageName = lang === Language.HE ? "Hebrew" : "English";
    
    // Construct a brief report for the AI
    const resultsReport = questions.map((q, idx) => {
        const isCorrect = userAnswers[q.id] === q.correctAnswerIndex;
        return `${idx + 1}. ${q.question} | Bloom: ${q.bloomLevel} | Result: ${isCorrect ? 'Correct' : 'Incorrect'}`;
    }).join('\n');

    const prompt = `
        As an expert educator, provide personalized learning feedback for a student who just finished a test titled "${testTitle}".
        The feedback should be in **${languageName}**.
        
        Analyze the following results:
        ${resultsReport}
        
        Guidelines:
        - Be encouraging and constructive.
        - Identify which Bloom's Taxonomy levels the student mastered and which they struggled with.
        - Suggest specific study strategies or topics to focus on based on the incorrect answers.
        - Keep the tone professional but accessible.
        - Format the response with clear headings or bullet points if necessary.
        - Do not include preamble like "Sure, here is the feedback". Start directly with the feedback.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating feedback:", error);
        return lang === Language.HE 
            ? "לא ניתן היה להפיק משוב כרגע. כל הכבוד על המאמץ!" 
            : "Feedback could not be generated at this time. Great job on completing the assessment!";
    }
};
