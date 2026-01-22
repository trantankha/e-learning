'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Flashcard from '@/components/Flashcard';
import { studyService, WordReviewResponse } from '@/services/studyService';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReviewSessionPage() {
    const router = useRouter();
    const [words, setWords] = useState<WordReviewResponse[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);

    // Stats for the summary
    const [correctCount, setCorrectCount] = useState(0);

    useEffect(() => {
        fetchWords();
    }, []);

    const fetchWords = async () => {
        try {
            const data = await studyService.getWordsToReview();
            setWords(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch words", error);
            setLoading(false);
        }
    };

    const handleAnswer = async (isCorrect: boolean) => {
        if (currentIndex >= words.length) return;

        const currentWord = words[currentIndex];

        try {
            await studyService.submitWordProgress(currentWord.word.id, isCorrect);

            if (isCorrect) setCorrectCount(prev => prev + 1);

            // Move to next card after a short delay or immediately
            if (currentIndex < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                completeSession();
            }
        } catch (error) {
            console.error("Error submitting progress", error);
        }
    };

    const completeSession = () => {
        setCompleted(true);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full"
                >
                    <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Tuyệt vời!</h1>
                    <p className="text-gray-600 mb-6">
                        Con đã hoàn thành bài ôn tập hôm nay.
                    </p>
                    <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                        <p className="text-lg font-semibold text-indigo-700">
                            Đã ôn: {words.length} từ
                        </p>
                        <p className="text-sm text-indigo-500">
                            Đúng {correctCount}/{words.length}
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 transition shadow-lg"
                    >
                        Về trang chủ
                    </button>
                </motion.div>
            </div>
        );
    }

    if (words.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Không có từ nào cần ôn!</h2>
                    <p className="text-gray-600 mb-4">Hôm nay con đã hoàn thành xuất sắc rồi.</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                        Quay lại bảng điều khiển
                    </button>
                </div>
            </div>
        );
    }

    const currentWordData = words[currentIndex].word;

    return (
        <div className="flex flex-col items-center min-h-screen bg-slate-50 py-10 px-4">
            <div className="w-full max-w-md mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Ôn tập hôm nay</h1>
                <div className="text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {words.length}
                </div>
            </div>

            <div className="w-full max-w-md relative min-h-[400px] flex justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentWordData.id}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="w-full flex justify-center"
                    >
                        <Flashcard
                            word={currentWordData.word}
                            meaning={currentWordData.meaning || ''}
                            pronunciation={currentWordData.pronunciation}
                            imageUrl={currentWordData.image_url}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="w-full max-w-xs mt-10 grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleAnswer(false)}
                    className="flex flex-col items-center justify-center p-4 bg-white border-2 border-red-100 rounded-2xl shadow-sm hover:bg-red-50 hover:border-red-200 transition-all group"
                >
                    <XCircle className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-red-600">Con chưa nhớ</span>
                </button>

                <button
                    onClick={() => handleAnswer(true)}
                    className="flex flex-col items-center justify-center p-4 bg-white border-2 border-green-100 rounded-2xl shadow-sm hover:bg-green-50 hover:border-green-200 transition-all group"
                >
                    <CheckCircle className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-green-600">Con đã thuộc</span>
                </button>
            </div>
        </div>
    );
}
