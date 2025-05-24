export interface Question {
    id: number;
    book_id: number;
    lesson_id: number;
    question_text: string;
    options: string; // This is a JSON string in the database
    correct_answer: string;
    explanation?: string;
    difficulty_level: number;
    question_hash?: string;
    has_image: boolean;
    image_description?: string;
    image_url?: string;
}

export interface ExamResults {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    topic_analysis: {
        [key: string]: {
            percentage: number;
            correct: number;
            total: number;
            questions: {
                question_text: string;
                correct: boolean;
                explanation: string;
                difficulty: number;
            }[];
        };
    };
    weak_topics: string[];
    strong_topics: string[];
    skill_gaps: SkillGap[];
    overall_recommendations: {
        study_plan: string;
        next_steps: Array<{
            topic: string;
            steps: string[];
        }>;
    };
}

export type ResourceType = {
    title: string;
    type: 'book' | 'video' | 'practice' | 'online' | 'class';
    description: string;
};

export type SkillGap = {
    topic: string;
    gap_size: number;
    priority: 'high' | 'medium' | 'low';
    specific_areas: Array<{
        concept: string;
        detailed_explanation: string;
        common_mistakes: string;
        improvement_tips: string;
    }>;
    recommended_resources: ResourceType[];
};
  