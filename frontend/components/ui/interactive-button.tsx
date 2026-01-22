
"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Extend HTMLMotionProps to include standard button attributes and motion props
// Omit 'ref' to avoid conflicts if you plan to forward ref (optional but good practice)
interface InteractiveButtonProps extends HTMLMotionProps<"button"> {
    isLoading?: boolean;
    children: React.ReactNode;
}

export const InteractiveButton = ({
    className,
    isLoading = false,
    children,
    onClick,
    disabled,
    ...props
}: InteractiveButtonProps) => {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }} // Added hover effect for consistency
            className={cn(
                "relative flex items-center justify-center px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            onClick={onClick}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {children}
        </motion.button>
    );
};
