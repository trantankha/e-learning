import axiosClient from "@/lib/axiosClient";

export interface Vocabulary {
    id: number;
    word: string;
    meaning?: string;
    pronunciation?: string;
    example_sentence?: string;
    image_url?: string;
    audio_url?: string;
    lesson_id?: number;
}

export interface UserWordProgress {
    id: number;
    user_id: number;
    word_id: number;
    box_level: number;
    next_review_at: string;
    last_reviewed_at?: string;
}

export interface WordReviewResponse {
    word: Vocabulary;
    progress: UserWordProgress;
}

export const studyService = {
    getWordsToReview: async (): Promise<WordReviewResponse[]> => {
        const response = await axiosClient.get("/study/review-today");
        return response.data;
    },

    submitWordProgress: async (wordId: number, isCorrect: boolean): Promise<UserWordProgress> => {
        const response = await axiosClient.post("/study/submit-word", {
            word_id: wordId,
            is_correct: isCorrect,
        });
        return response.data;
    }
};
