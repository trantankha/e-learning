"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lesson } from "@/types/schema";
import axiosClient from "@/lib/axiosClient";
import { QuizSection } from "@/components/QuizSection";
import PronunciationPractice from "@/components/PronunciationPractice";

import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/useAuth";
import { useStudentStore } from "@/stores/studentStore";
import toast from "react-hot-toast";

export default function LessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params.id;

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Generic handler for progress submission
    const submitProgress = async (score: number, total: number) => {
        try {
            if (!lesson) return;
            const res = await axiosClient.post('/progress/mark-complete', {
                lesson_id: lesson.id,
                score: score,
                total_questions: total
            });

            const { earned_gems, earned_stars } = res.data;
            if (earned_gems > 0 || earned_stars > 0) {
                useStudentStore.getState().addRewards(earned_gems, earned_stars);

                let message = "";
                let icon = '🎁';

                if (earned_gems > 0 && earned_stars > 0) {
                    message = `Chúc mừng! Con nhận được ${earned_gems} 💎 và ${earned_stars} ⭐`;
                } else if (earned_gems > 0) {
                    message = `Tuyệt vời! Con đã hoàn thành bài học và nhận ${earned_gems} 💎`;
                } else if (earned_stars > 0) {
                    message = `Xuất sắc! Con trả lời đúng và nhận được ${earned_stars} ⭐`;
                    icon = '⭐';
                }

                toast.success(message, {
                    duration: 5000,
                    icon: icon,
                    style: {
                        borderRadius: '20px',
                        background: '#fff',
                        color: '#333',
                        border: '2px solid #f97316', // Orange border
                    },
                });
            }
            console.log("Progress saved:", res.data);
        } catch (err) {
            console.error("Failed to save progress:", err);
        }
    };

    const handleVideoEnded = async () => {
        // 1. Fire Confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        // 2. Call API & Update State
        // Submit with 0/0 to indicate Video Completion (Not a Quiz)
        // This ensures backend awards Gems (completion) but NOT Stars (no quiz passed)
        await submitProgress(0, 0);
    };

    const handleQuizComplete = (score: number, total: number) => {
        submitProgress(score, total);
    };

    // Protect Route
    const { isAuthenticated, loading: authLoading } = useAuth(true);

    useEffect(() => {
        if (!lessonId || !isAuthenticated) return;

        const fetchLesson = async () => {
            try {
                setLoading(true);
                // Using axiosClient
                const response = await axiosClient.get<Lesson>(`/lessons/${lessonId}`);
                setLesson(response.data);
            } catch (err: any) {
                console.error("Failed to fetch lesson:", err);
                setError("Không thể tải bài học. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [lessonId, isAuthenticated]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-sky-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-yellow-400 border-t-orange-500"></div>
                    <p className="text-xl font-bold text-sky-700 animate-pulse">Đang tải bài học...</p>
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-red-50 p-4">
                <div className="text-6xl mb-4">😿</div>
                <h1 className="text-2xl font-bold text-red-600 mb-2">Oh no!</h1>
                <p className="text-gray-700 mb-6">{error || "Không tìm thấy bài học."}</p>
                <button
                    onClick={() => router.back()}
                    className="rounded-full bg-blue-500 px-6 py-2 font-bold text-white shadow-lg hover:bg-blue-600 transition"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f0f9ff] pb-20">
            {/* Top Navigation Bar Helper */}
            <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm md:px-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 rounded-lg bg-sky-100 px-4 py-2 font-bold text-sky-700 hover:bg-sky-200 transition"
                >
                    <span>⬅</span> Quay lại
                </button>
                <div className="text-lg font-bold text-orange-500">
                    Bài {lesson.order_index}
                </div>
            </div>

            <div className="mx-auto max-w-5xl p-4 md:p-8">
                {/* Video Player Section */}
                <div className="overflow-hidden rounded-3xl bg-black shadow-2xl ring-4 ring-orange-200">
                    <div className="relative aspect-video w-full">
                        {lesson.video_url ? (
                            <video
                                controls
                                src={lesson.video_url}
                                className="h-full w-full object-contain"
                                poster={lesson.thumbnail_url}
                                autoPlay={false}
                                onEnded={handleVideoEnded}
                            >
                                Trình duyệt của bé không hỗ trợ thẻ video.
                            </video>
                        ) : (
                            <div className="flex h-full items-center justify-center bg-slate-800 text-white">
                                <p>Video đang được cập nhật...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lesson Info */}
                <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl md:p-10 border-b-8 border-b-sky-100">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <span className="rounded-full bg-yellow-400 px-4 py-1 text-sm font-black text-yellow-900 uppercase tracking-wider shadow-sm">
                                {lesson.lesson_type}
                            </span>
                        </div>

                        <h1 className="text-3xl font-black text-sky-900 md:text-5xl leading-tight">
                            {lesson.title}
                        </h1>

                        <p className="text-lg text-slate-600 md:text-xl leading-relaxed">
                            Chúc bé học vui vẻ với bài học <strong>{lesson.title}</strong> nhé!
                            Hãy xem video thật kỹ và làm bài tập nhen!
                        </p>

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-wrap gap-4">
                            {lesson.attachment_url && (
                                <a
                                    href={lesson.attachment_url}
                                    target="_blank"
                                    className="flex items-center gap-2 rounded-2xl bg-indigo-100 px-6 py-3 font-bold text-indigo-700 hover:bg-indigo-200 transition"
                                >
                                    📚 Tải tài liệu
                                </a>
                            )}
                        </div>

                        {/* Pronunciation Practice Section */}
                        <div className="mt-10 border-t-2 border-slate-100 pt-10">
                            <h2 className="text-3xl font-black text-center text-pink-600 mb-6">
                                🗣️ Luyện phát âm
                            </h2>
                            <p className="text-center text-slate-500 mb-6">
                                Bé hãy thử đọc to từ vựng này nhé!
                            </p>
                            <PronunciationPractice
                                targetWord={lesson.pronunciation_word || lesson.questions?.[0]?.correct_answer || lesson.title.split(":")[0]}
                                onSuccess={() => {
                                    confetti({
                                        particleCount: 100,
                                        spread: 70,
                                        origin: { y: 0.6 },
                                        colors: ['#f472b6', '#ec4899'] // Pink confetti
                                    });
                                    // Optional: Add small reward
                                    useStudentStore.getState().addRewards(5, 0);
                                    toast.success("Giỏi quá! +5 Gems 💎");
                                }}
                            />
                        </div>

                        {/* Quiz Section */}
                        {lesson.questions && lesson.questions.length > 0 && (
                            <div className="mt-10 border-t-2 border-slate-100 pt-10">
                                <h2 className="text-3xl font-black text-center text-purple-600 mb-2">
                                    🎮 Thử thách trí nhớ
                                </h2>
                                <p className="text-center text-slate-500 mb-6">Trả lời đúng để nhận Sao nhé!</p>
                                <QuizSection questions={lesson.questions} onComplete={handleQuizComplete} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
