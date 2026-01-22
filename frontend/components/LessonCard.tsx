"use client";

import { LessonDashboard } from "@/types/schema";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LessonCardProps {
    lesson: LessonDashboard;
}

export function LessonCard({ lesson }: LessonCardProps) {
    if (lesson.is_locked) {
        return (
            <div className="relative flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-100 border-2 border-slate-200 opacity-70 grayscale cursor-not-allowed h-full">
                <div className="text-4xl mb-2">🔒</div>
                <h3 className="font-bold text-slate-500 text-center text-sm">{lesson.title}</h3>
                <span className="text-xs bg-slate-200 px-2 py-1 rounded-full mt-2 text-slate-500 font-bold uppercase">
                    Locked
                </span>
            </div>
        );
    }

    const isCompleted = lesson.is_completed;

    return (
        <Link href={`/lessons/${lesson.id}`} className="block h-full group">
            <div className={cn(
                "relative flex flex-col items-center p-4 rounded-3xl border-b-8 transition-all duration-300 transform h-full",
                isCompleted
                    ? "bg-green-50 border-green-200 hover:border-green-300 hover:-translate-y-1"
                    : "bg-white border-sky-100 hover:border-sky-300 hover:shadow-lg hover:-translate-y-2 shadow-sm"
            )}>
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    {isCompleted ? (
                        <span className="text-2xl">✅</span>
                    ) : (
                        <span className="w-4 h-4 rounded-full bg-red-400 block animate-pulse border-2 border-white lg:w-3 lg:h-3"></span>
                    )}
                </div>

                {/* Thumbnail Placeholder or Image */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-300 to-yellow-300 flex items-center justify-center text-3xl shadow-inner mb-3 group-hover:scale-110 transition">
                    {lesson.lesson_type === "vocabulary" && "🐶"}
                    {lesson.lesson_type === "grammar" && "📝"}
                    {lesson.lesson_type === "phonics" && "🗣️"}
                    {lesson.lesson_type === "listening" && "👂"}
                    {lesson.lesson_type === "quiz" && "❓"}
                </div>

                <h3 className="font-black text-slate-700 text-center text-md mb-1 leading-tight group-hover:text-orange-500 transition">
                    {lesson.title}
                </h3>

                <div className="mt-auto pt-2">
                    {isCompleted && (
                        <div className="flex items-center gap-1 justify-center">
                            {[1, 2, 3].map((star) => {
                                // Simple logic: If score is high enough, fill the star.
                                // Assuming max score 10.
                                // Star 1: always if completed
                                // Star 2: > 5
                                // Star 3: > 8
                                let isFilled = true;
                                if (star === 2 && lesson.score <= 5) isFilled = false;
                                if (star === 3 && lesson.score <= 8) isFilled = false;

                                // If LessonType is NOT Quiz, implies assumed full stats or just 3 stars for completion
                                if (lesson.lesson_type !== 'quiz') isFilled = true;

                                return (
                                    <span key={star} className={cn(
                                        "text-lg drop-shadow-sm transition-all",
                                        isFilled ? "text-yellow-400 scale-110" : "text-slate-200"
                                    )}>
                                        ★
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
