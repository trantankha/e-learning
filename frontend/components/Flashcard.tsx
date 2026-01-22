'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import PronunciationPractice from './PronunciationPractice';

interface FlashcardProps {
    word: string;
    meaning: string;
    pronunciation?: string;
    imageUrl?: string;
    onFlip?: (isFlipped: boolean) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, meaning, pronunciation, imageUrl, onFlip }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleFlip = () => {
        if (!isAnimating) {
            const newState = !isFlipped;
            setIsFlipped(newState);
            setIsAnimating(true);
            if (onFlip) onFlip(newState);
        }
    };

    const playAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Implement TTS or audio file play here
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div
            className="w-full max-w-sm h-96 cursor-pointer perspective-1000"
            onClick={handleFlip}
        >
            <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, animationDirection: "normal" as any }}
                onAnimationComplete={() => setIsAnimating(false)}
                className="w-full h-full relative preserve-3d"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Side */}
                <div
                    className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-xl flex flex-col items-center justify-center p-6 border-2 border-indigo-100"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {/* Image Placeholder or Actual Image */}
                    <div className="w-40 h-40 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                        {imageUrl ? (
                            <img src={imageUrl} alt={word} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span className="text-4xl">🖼️</span>
                        )}
                    </div>

                    <button
                        onClick={playAudio}
                        className="mt-4 p-3 bg-indigo-100 rounded-full hover:bg-indigo-200 transition-colors"
                    >
                        <Volume2 className="w-6 h-6 text-indigo-600" />
                    </button>
                    <p className="mt-2 text-sm text-gray-500">Nhấp vào hình ảnh để lật</p>
                </div>

                {/* Back Side */}
                <div
                    className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-xl flex flex-col items-center justify-center p-6 border-2 border-orange-100 rotate-y-180"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">{word}</h2>
                    {pronunciation && (
                        <p className="text-lg text-gray-500 font-mono mb-6">/{pronunciation}/</p>
                    )}

                    <div className="w-full h-px bg-gray-200 my-4"></div>

                    <h3 className="text-3xl font-medium text-indigo-600 text-center mb-4">{meaning}</h3>

                    {/* Pronunciation Practice Integration */}
                    <div
                        className="w-full flex justify-center mt-2 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PronunciationPractice targetWord={word} minimal={true} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Flashcard;
