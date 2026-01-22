"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import { DashboardPathResponse, UnitDashboard } from "@/types/schema";
import { useAuth } from "@/hooks/useAuth";
import { LessonCard } from "@/components/LessonCard";

export default function DashboardPage() {
    const { isAuthenticated } = useAuth(true); // Protect route
    const [units, setUnits] = useState<UnitDashboard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchPath = async () => {
            try {
                const res = await axiosClient.get<DashboardPathResponse>("/dashboard/path");
                setUnits(res.data.units);
            } catch (error) {
                console.error("Failed to fetch path", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPath();
    }, [isAuthenticated]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header / Hero */}
            <div className="mb-12 text-center bg-white p-8 rounded-3xl shadow-sm border-2 border-sky-100">
                <h1 className="text-4xl font-black text-sky-800 mb-2">
                    Bản đồ học tập 🗺️
                </h1>
                <p className="text-slate-500 font-medium">
                    Cùng chinh phục các thử thách để nhận huy hiệu nhé!
                </p>
            </div>

            <div className="space-y-12">
                {units.map((unit) => (
                    <div key={unit.id} className="relative">
                        {/* Unit Title */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-orange-200">
                                {unit.order_index}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-700">
                                {unit.title}
                            </h2>
                        </div>

                        {/* Lessons Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 ml-0 md:ml-10 px-4 md:px-0">
                            {unit.lessons.map((lesson) => (
                                <LessonCard key={lesson.id} lesson={lesson} />
                            ))}
                        </div>

                        {/* Connector Line (Design decoration) */}
                        <div className="absolute left-[22px] top-12 bottom-[-48px] w-1 bg-slate-200 -z-10 last:hidden"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
