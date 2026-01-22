"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";

interface DailyProgress {
    date: string;
    minutes: number;
}

interface WeeklyReportResponse {
    total_minutes: number;
    lessons_completed: number;
    learned_words: string[];
    weak_words: string[];
    daily_chart: DailyProgress[];
}

export default function ReportsPage() {
    const [report, setReport] = useState<WeeklyReportResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const { data } = await axiosClient.get("/reports/weekly");
                setReport(data);
            } catch (error) {
                console.error("Failed to fetch report:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading report data...</div>;
    }

    if (!report) {
        return <div className="p-8 text-center text-red-500">Failed to load report.</div>;
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <span className="text-4xl">📊</span>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Báo Cáo Học Tập</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Time */}
                <Card className="border-2 border-sky-100 shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-sky-700 uppercase tracking-wider">Thời Gian Học</CardTitle>
                        <div className="p-2 bg-sky-100 rounded-xl">
                            <Clock className="h-5 w-5 text-sky-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">{report.total_minutes} <span className="text-lg font-medium text-slate-500">phút</span></div>
                        <p className="text-sm font-medium text-sky-600/80 mt-1">Trong 7 ngày qua</p>
                    </CardContent>
                </Card>

                {/* Lessons Completed */}
                <Card className="border-2 border-indigo-100 shadow-sm bg-indigo-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Bài Đã Học</CardTitle>
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">{report.lessons_completed} <span className="text-lg font-medium text-slate-500">bài</span></div>
                        <p className="text-sm font-medium text-indigo-600/80 mt-1">Hoàn thành xuất sắc</p>
                    </CardContent>
                </Card>

                {/* Words Learned */}
                <Card className="border-2 border-green-100 shadow-sm bg-green-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-green-700 uppercase tracking-wider">Từ Mới</CardTitle>
                        <div className="p-2 bg-green-100 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">{report.learned_words.length} <span className="text-lg font-medium text-slate-500">từ</span></div>
                        <p className="text-sm font-medium text-green-600/80 mt-1">Đã thuộc làu</p>
                    </CardContent>
                </Card>

                {/* Weak Words Count */}
                <Card className="border-2 border-orange-100 shadow-sm bg-orange-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-orange-700 uppercase tracking-wider">Cần Ôn Tập</CardTitle>
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">{report.weak_words.length} <span className="text-lg font-medium text-slate-500">từ</span></div>
                        <p className="text-sm font-medium text-orange-600/80 mt-1">Cố gắng thêm nhé!</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <Card className="col-span-4 border-2 border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        Biểu Đồ Năng Lượng (Phút)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pl-0">
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={report.daily_chart}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={12}
                                    fontWeight={600}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString("vi-VN", { weekday: 'short' })}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    fontWeight={600}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}
                                />
                                <Bar
                                    dataKey="minutes"
                                    fill="#3b82f6"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                    activeBar={{ fill: '#2563eb' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Words Lists */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2 border-green-100 shadow-sm h-full">
                    <CardHeader className="bg-green-50/30 border-b border-green-50 flex flex-row items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800">Bộ Sưu Tập Từ Vựng</CardTitle>
                            <p className="text-sm text-slate-500 font-medium">Bé đã học thuộc những từ này</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {report.learned_words.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {report.learned_words.map((word, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-green-100 text-green-700 border border-green-200 rounded-full text-sm font-bold shadow-sm">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <p>Chưa có từ nào mới trong tuần này.</p>
                                <p className="text-sm">Hãy học bài mới nhé!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-2 border-orange-100 shadow-sm h-full">
                    <CardHeader className="bg-orange-50/30 border-b border-orange-50 flex flex-row items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800">Cần Luyện Tập Thêm</CardTitle>
                            <p className="text-sm text-slate-500 font-medium">Làm lại bài tập để nhớ lâu hơn</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {report.weak_words.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {report.weak_words.map((word, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-white text-orange-600 border-2 border-orange-100 rounded-full text-sm font-bold shadow-sm">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 flex flex-col items-center gap-2">
                                <span className="text-4xl">🌟</span>
                                <p className="text-slate-600 font-bold">Xuất sắc quá!</p>
                                <p className="text-sm text-slate-400">Bé không có từ nào bị sai nhiều.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
