"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
    useAuth(false); // Redirect to dashboard if logged in

    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [refCode, setRefCode] = useState<string | null>(null);

    useEffect(() => {
        try {
            const sp = new URLSearchParams(window.location.search);
            setRefCode(sp.get("ref"));
        } catch (e) {
            setRefCode(null);
        }
    }, []);

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            await authService.register(data.email, data.password, data.fullName, refCode || undefined);
            // Auto login after register
            await authService.login(data.email, data.password);
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.status === 400) {
                setError("Email này đã được đăng ký rồi bé ơi!");
            } else {
                setError("Có lỗi xảy ra, thử lại sau nhé!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-orange-100 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border-4 border-orange-200">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-orange-500 mb-2">Tạo tài khoản 🌟</h1>
                    <p className="text-slate-500">Tham gia cùng chúng tớ nào!</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 text-red-600 p-4 rounded-xl font-bold text-center border-2 border-red-200 animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-slate-700 font-bold mb-2 ml-1">Tên của bé</label>
                        <input
                            {...register("fullName", { required: "Vui lòng nhập tên" })}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-orange-400 focus:outline-none transition font-bold text-slate-700"
                            placeholder="Ví dụ: Bé Bi"
                        />
                        {errors.fullName && <p className="text-red-500 mt-2 ml-2 font-bold text-sm">{(errors.fullName as any).message}</p>}
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-2 ml-1">Email</label>
                        <input
                            {...register("email", { required: "Vui lòng nhập Email" })}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-orange-400 focus:outline-none transition font-bold text-slate-700"
                            placeholder="name@example.com"
                        />
                        {errors.email && <p className="text-red-500 mt-2 ml-2 font-bold text-sm">{(errors.email as any).message}</p>}
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-2 ml-1">Mật khẩu</label>
                        <input
                            type="password"
                            {...register("password", { required: "Vui lòng nhập mật khẩu", minLength: { value: 6, message: "Mật khẩu ít nhất 6 ký tự nha" } })}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-orange-400 focus:outline-none transition font-bold text-slate-700"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-500 mt-2 ml-2 font-bold text-sm">{(errors.password as any).message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition transform hover:scale-105 shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang tạo tài khoản..." : "ĐĂNG KÝ NGAY ✨"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 font-bold">
                        Đã có tài khoản? {" "}
                        <Link href="/login" className="text-sky-500 hover:text-sky-600 underline decoration-2 underline-offset-4">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
