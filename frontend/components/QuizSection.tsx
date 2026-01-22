"use client";

import { useState } from "react";
import { Question } from "@/types/schema";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface QuizSectionProps {
    questions: Question[];
    onComplete: (score: number, total: number) => void;
}

export function QuizSection({ questions, onComplete }: QuizSectionProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null); // null = not answered, true = correct, false = wrong
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // If no questions, don't render anything
    if (!questions || questions.length === 0) {
        return null;
    }

    const currentQuestion = questions[currentQuestionIndex];

    const handleOptionClick = (option: string) => {
        if (selectedOption) return; // Prevent changing answer

        setSelectedOption(option);
        const correct = option === currentQuestion.correct_answer;
        setIsCorrect(correct);

        if (correct) {
            new Audio('/sounds/correct.mp3').play().catch(e => console.error("Audio play failed:", e));
            setScore((prev) => prev + 1);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            new Audio('/sounds/wrong.wav').play().catch(e => console.error("Audio play failed:", e));
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedOption(null);
            setIsCorrect(null);
        } else {
            setShowResult(true);
            onComplete(score + (isCorrect ? 1 : 0), questions.length); // Include current answer if correct
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsCorrect(null);
        setScore(0);
        setShowResult(false);
    };

    if (showResult) {
        return (
            <div className="mt-8 rounded-3xl bg-white p-8 shadow-xl border-4 border-yellow-200 text-center">
                <h2 className="text-3xl font-black text-orange-500 mb-4">Kết quả</h2>
                <p className="text-2xl text-slate-700 mb-6">
                    Bé đã trả lời đúng <span className="font-bold text-green-600">{score}</span> / {questions.length} câu!
                </p>
                <button
                    onClick={handleRetry}
                    className="rounded-full bg-blue-500 px-8 py-3 font-bold text-white shadow-lg hover:bg-blue-600 transition hover:scale-105"
                >
                    Làm lại nào! 🔄
                </button>
            </div>
        );
    }

    return (
        <div className="mt-8 w-full max-w-3xl mx-auto">
            <div className="rounded-3xl bg-white p-6 md:p-10 shadow-xl border-b-8 border-b-purple-100 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-2 bg-slate-100 w-full">
                    <div
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-center mb-6 mt-2">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                    </span>
                    <span className="text-sm font-bold text-yellow-500">
                        ⭐ {score}
                    </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center min-h-[80px] flex items-center justify-center">
                    {currentQuestion.text}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedOption === option;
                        const isCorrectAnswer = option === currentQuestion.correct_answer;

                        let btnClass = "bg-sky-50 text-sky-700 hover:bg-sky-100 border-2 border-sky-100";

                        if (selectedOption) {
                            if (isSelected && isCorrect) {
                                btnClass = "bg-green-500 text-white border-green-600 shadow-green-200 ring-4 ring-green-100"; // User picked correct
                            } else if (isSelected && !isCorrect) {
                                btnClass = "bg-red-500 text-white border-red-600 shadow-red-200 ring-4 ring-red-100"; // User picked wrong
                            } else if (!isSelected && isCorrectAnswer && !isCorrect) {
                                btnClass = "bg-green-100 text-green-700 border-green-200"; // Show correct answer if user was wrong
                            } else {
                                btnClass = "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400"; // Disable others
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(option)}
                                disabled={!!selectedOption}
                                className={cn(
                                    "py-4 px-6 rounded-2xl text-lg md:text-xl font-bold transition-all duration-200 transform shadow-sm touch-manipulation active:scale-95 min-h-[64px]",
                                    btnClass,
                                    !selectedOption && "hover:-translate-y-1 hover:shadow-md"
                                )}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback Area */}
                {selectedOption && (
                    <div className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {isCorrect ? (
                            <div className="text-center mb-4">
                                <p className="text-3xl mb-2">🎉</p>
                                <p className="text-2xl font-black text-green-500">Good job! Chính xác!</p>
                            </div>
                        ) : (
                            <div className="text-center mb-4">
                                <p className="text-3xl mb-2">😅</p>
                                <p className="text-2xl font-black text-red-500">Sai rồi bé ơi! Thử lại sau nhé.</p>
                            </div>
                        )}

                        <button
                            onClick={handleNext}
                            className="mt-2 rounded-full bg-orange-500 px-10 py-3 font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 transition hover:scale-105"
                        >
                            {currentQuestionIndex < questions.length - 1 ? "Câu tiếp theo ➡" : "Xem kết quả 🏁"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
