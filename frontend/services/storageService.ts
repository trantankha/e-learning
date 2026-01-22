import axiosClient from "@/lib/axiosClient";

export interface UploadResponse {
    url: string;
    filename: string;
}

export const storageService = {
    uploadFile: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosClient.post("/storage/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
};
