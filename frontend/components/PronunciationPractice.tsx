"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PronunciationPracticeProps {
    targetWord: string;
    onSuccess?: () => void;
    minimal?: boolean;
}

// Extend Window interface for WebkitSpeechRecognition
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

const PronunciationPractice: React.FC<PronunciationPracticeProps> = ({ targetWord, onSuccess, minimal = false }) => {
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState<string | null>(null);
    const [isMatch, setIsMatch] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(true);

    // Use useRef to keep track of the recognition instance
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
            setError("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
        }
    }, []);

    const toggleListening = () => {
        if (!isSupported) return;

        if (isListening) {
            stopListening();
            return;
        }

        setError(null);
        setSpokenText(null);
        setIsMatch(null);
        setIsListening(true);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = 'en-US'; // Set language to English
        recognition.interimResults = true; // Enable interim results for visual feedback
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                setSpokenText(finalTranscript);

                // Compare identifying punctuation differences
                const cleanSpoken = finalTranscript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
                const cleanTarget = targetWord.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

                if (cleanSpoken === cleanTarget) {
                    setIsMatch(true);
                    toast.success("Tuyệt vời! Bạn phát âm rất chuẩn!", { icon: '👏' });
                    if (onSuccess) onSuccess();
                } else {
                    setIsMatch(false);
                }
                stopListening();
            } else if (interimTranscript) {
                setSpokenText(interimTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);

            if (event.error === 'aborted') {
                setIsListening(false);
                return;
            }

            if (event.error === 'not-allowed') {
                setError("Bạn cần cấp quyền Micro để sử dụng tính năng này.");
            } else if (event.error === 'no-speech') {
                setError("Không nghe thấy gì cả. Bạn thử lại nhé!");
            } else if (event.error === 'network') {
                setError("Lỗi mạng. Vui lòng kiểm tra kết nối internet.");
            } else {
                setError(`Lỗi nhận diện: ${event.error}`);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            // Only update status if we haven't already set an error
            // Check ref to see if we manually stopped or it just ended
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start recognition", e);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                try {
                    recognitionRef.current.abort();
                } catch (e2) { }
            }
            setIsListening(false);
        }
    };

    const handleSpeakTarget = () => {
        const utterance = new SpeechSynthesisUtterance(targetWord);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) { }
            }
        };
    }, []);

    if (!isSupported) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                <AlertCircle size={20} />
                <span>Trình duyệt không hỗ trợ thu âm. Vui lòng thử Chrome/Edge.</span>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex flex-col items-center p-6 mx-auto",
            !minimal && "bg-white rounded-3xl shadow-sm border-2 border-slate-100 max-w-sm"
        )}>
            {!minimal && (
                <>
                    <h3 className="text-slate-500 font-medium mb-4 uppercase tracking-wider text-sm">Luyện nói</h3>
                    {/* Target Word Display */}
                    <div className="flex items-center gap-3 mb-8">
                        <span className="text-4xl font-black text-slate-800">{targetWord}</span>
                        <button
                            onClick={handleSpeakTarget}
                            className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                            title="Nghe mẫu"
                        >
                            <Volume2 size={24} />
                        </button>
                    </div>
                </>
            )}

            {/* Mic Button */}
            <div className="relative mb-6">
                {isListening && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75"></span>
                )}
                <button
                    onClick={toggleListening}
                    className={cn(
                        "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                        isListening
                            ? "bg-red-500 text-white scale-110 shadow-red-200"
                            : "bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-indigo-200"
                    )}
                >
                    {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                </button>
            </div>

            <p className="text-slate-500 text-sm mb-6 h-6">
                {isListening ? "Đang nghe..." : "Bấm Micro để nói"}
            </p>

            {/* Feedback Result */}
            {spokenText && (
                <div className={cn(
                    "w-full p-4 rounded-xl border-2 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2",
                    isMatch
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                )}>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold opacity-70 uppercase mb-1">
                            {isMatch ? "Chính xác!" : "Nghe được:"}
                        </span>
                        <span className="text-xl font-bold">
                            {spokenText}
                        </span>
                    </div>
                    <div>
                        {isMatch ? <CheckCircle size={32} /> : <XCircle size={32} />}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 text-red-500 text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
        </div>
    );
};

export default PronunciationPractice;
