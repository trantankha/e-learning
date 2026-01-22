export const LessonSkeleton = () => {
    return (
        <div className="w-full p-4 space-y-4 border rounded-xl shadow-sm bg-white dark:bg-zinc-900 animate-pulse">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32 dark:bg-gray-700"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full dark:bg-gray-700"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 dark:bg-gray-700"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6 dark:bg-gray-700"></div>
            </div>
        </div>
    );
};

export const CardSkeleton = () => {
    return (
        <div className="flex flex-col space-y-3 animate-pulse">
            <div className="h-[125px] w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-2">
                <div className="h-4 w-[250px] rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-[200px] rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
        </div>
    );
};
