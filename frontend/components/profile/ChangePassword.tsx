"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { PasswordChange, userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

export function ChangePassword() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordChange>();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: PasswordChange) => {
        if (data.new_password !== data.confirm_password) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        setIsLoading(true);
        try {
            await userService.changePassword({
                current_password: data.current_password,
                new_password: data.new_password
            });
            toast.success("Đổi mật khẩu thành công!");
            reset();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Có lỗi xảy ra");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 via-white to-orange-50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-rose-400 to-orange-400"></div>

            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-black text-rose-800">Bảo mật tài khoản 🔐</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto p-4">
                    <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-100 transition-all">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                            <span>🔑</span> Mật khẩu hiện tại
                        </label>
                        <input
                            type="password"
                            {...register("current_password", { required: "Vui lòng nhập mật khẩu hiện tại" })}
                            className="w-full font-bold text-slate-700 bg-transparent outline-none"
                            placeholder="••••••••"
                        />
                        {errors.current_password && <span className="text-red-500 text-sm mt-1">{errors.current_password.message}</span>}
                    </div>

                    <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100 transition-all">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                            <span>✨</span> Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            {...register("new_password", {
                                required: "Vui lòng nhập mật khẩu mới",
                                minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                            })}
                            className="w-full font-bold text-slate-700 bg-transparent outline-none"
                            placeholder="••••••••"
                        />
                        {errors.new_password && <span className="text-red-500 text-sm mt-1">{errors.new_password.message}</span>}
                    </div>

                    <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm focus-within:border-yellow-300 focus-within:ring-4 focus-within:ring-yellow-100 transition-all">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                            <span>✅</span> Xác nhận mật khẩu mới
                        </label>
                        <input
                            type="password"
                            {...register("confirm_password", { required: "Vui lòng xác nhận mật khẩu" })}
                            className="w-full font-bold text-slate-700 bg-transparent outline-none"
                            placeholder="••••••••"
                        />
                        {errors.confirm_password && <span className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</span>}
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold h-14 text-lg shadow-lg shadow-rose-200 transition-all hover:scale-[1.02]"
                    >
                        {isLoading ? "Đang xử lý..." : "Đổi mật khẩu ngay 🔥"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
