"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { UserProfileResponse, UserProfileUpdate, userService } from "@/services/userService";
import { storageService } from "@/services/storageService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useStudentStore } from "@/stores/studentStore";

interface ProfileInfoProps {
    initialData: UserProfileResponse;
}

export function ProfileInfo({ initialData }: ProfileInfoProps) {
    const [user, setUser] = useState(initialData);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UserProfileUpdate>({
        defaultValues: {
            full_name: user.full_name,
            date_of_birth: user.student_profile.date_of_birth || "",
            avatar_url: user.student_profile.avatar_url || ""
        }
    });

    // Manually register avatar_url since we don't use a standard input for it
    useEffect(() => {
        register("avatar_url");
    }, [register]);

    const currentAvatarUrl = watch("avatar_url");

    const { fetchProfile } = useStudentStore();

    const onSubmit = async (data: UserProfileUpdate) => {
        console.log("Submitting data:", data); // Debug log
        try {
            const updatedUser = await userService.updateProfile(data);
            setUser(updatedUser);
            setIsEditing(false);

            // Sync with global store (TopBar)
            await fetchProfile();

            toast.success("Cập nhật hồ sơ thành công!");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật hồ sơ");
        }
    };

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file hình ảnh");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error("Kích thước file không được quá 5MB");
            return;
        }

        setIsUploading(true);
        try {
            const response = await storageService.uploadFile(file);
            // Explicitly set the value and mark as dirty/validate
            setValue("avatar_url", response.url, { shouldValidate: true, shouldDirty: true });
            toast.success("Tải ảnh lên thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
        } finally {
            setIsUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400"></div>

            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-black text-slate-700">Thông tin cá nhân 🌟</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 p-4">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

                            <div
                                className={`relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white ${isEditing ? 'cursor-pointer hover:opacity-90' : ''}`}
                                onClick={handleAvatarClick}
                            >
                                <Image
                                    src={currentAvatarUrl || user.student_profile.avatar_url || "/images/avatar-default.png"}
                                    alt="Avatar"
                                    fill
                                    className="object-cover transition-transform duration-500 hover:scale-110"
                                    unoptimized
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                                {isEditing && !isUploading && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-bold text-sm">Đổi ảnh</span>
                                    </div>
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {isEditing ? (
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200 font-bold"
                                onClick={handleAvatarClick}
                            >
                                📷 Đổi ảnh đại diện
                            </Button>
                        ) : (
                            <div className="flex gap-4 text-center w-full">
                                <div className="flex-1 bg-yellow-100 p-3 rounded-2xl border-2 border-yellow-200 shadow-sm">
                                    <span className="block text-3xl mb-1">💎</span>
                                    <span className="font-black text-yellow-700 block">{user.student_profile.total_gems}</span>
                                    <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Gems</span>
                                </div>
                                <div className="flex-1 bg-orange-100 p-3 rounded-2xl border-2 border-orange-200 shadow-sm">
                                    <span className="block text-3xl mb-1">⭐</span>
                                    <span className="font-black text-orange-700 block">{user.student_profile.total_stars}</span>
                                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Stars</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100 transition-all">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                                    <span>📧</span> Email
                                </label>
                                <input
                                    type="text"
                                    value={user.email}
                                    disabled
                                    className="w-full font-bold text-slate-600 bg-transparent outline-none cursor-not-allowed"
                                />
                            </div>

                            <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm focus-within:border-purple-300 focus-within:ring-4 focus-within:ring-purple-100 transition-all">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                                    <span>😀</span> Họ và tên
                                </label>
                                <input
                                    {...register("full_name", { required: "Vui lòng nhập họ tên" })}
                                    disabled={!isEditing}
                                    className="w-full font-bold text-slate-700 bg-transparent outline-none disabled:text-slate-500"
                                />
                                {errors.full_name && <span className="text-red-500 text-sm mt-1">{errors.full_name.message}</span>}
                            </div>

                            <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm focus-within:border-pink-300 focus-within:ring-4 focus-within:ring-pink-100 transition-all">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                                    <span>🎂</span> Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    {...register("date_of_birth")}
                                    disabled={!isEditing}
                                    className="w-full font-bold text-slate-700 bg-transparent outline-none disabled:text-slate-500"
                                />
                            </div>

                            {/* Removed hidden input for avatar_url, handling via register in useEffect */}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            {isEditing ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditing(false)}
                                        className="rounded-xl font-bold border-2 h-12 px-6 hover:bg-slate-50"
                                        disabled={isUploading}
                                    >
                                        Hủy bỏ
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold h-12 px-8 shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300 transition-all active:scale-95"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : "Lưu thay đổi ✨"}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold h-12 px-8 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all active:scale-95"
                                >
                                    Chỉnh sửa ✏️
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
