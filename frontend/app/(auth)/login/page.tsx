"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
    // Redirect if already logged in
    useAuth(false);

    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            await authService.login(data.email, data.password);
            window.location.href = "/dashboard";
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.status === 400) {
                setError("Email hoặc mật khẩu chưa đúng bé ơi!");
            } else {
                setError("Có lỗi xảy ra, thử lại sau nhé!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-sky-100 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border-4 border-sky-200">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-sky-600 mb-2">Xin chào! 👋</h1>
                    <p className="text-slate-500">Đăng nhập để tiếp tục học tiếng Anh nhé.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 text-red-600 p-4 rounded-xl font-bold text-center border-2 border-red-200 animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-slate-700 font-bold mb-2 ml-1">Email của bé (hoặc ba mẹ)</label>
                        <input
                            {...register("email", { required: "Vui lòng nhập Email" })}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-sky-400 focus:outline-none transition font-bold text-slate-700"
                            placeholder="name@example.com"
                        />
                        {errors.email && <p className="text-red-500 mt-2 ml-2 font-bold text-sm">{(errors.email as any).message}</p>}
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-2 ml-1">Mật khẩu</label>
                        <input
                            type="password"
                            {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-sky-400 focus:outline-none transition font-bold text-slate-700"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-500 mt-2 ml-2 font-bold text-sm">{(errors.password as any).message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-4 rounded-2xl transition transform hover:scale-105 shadow-lg shadow-sky-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP 🚀"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 font-bold">
                        Chưa có tài khoản? {" "}
                        <Link href="/register" className="text-orange-500 hover:text-orange-600 underline decoration-2 underline-offset-4">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
