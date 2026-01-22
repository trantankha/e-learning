'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

// Hàm xử lý response trước khi hiển thị
const processResponse = (response: string): string => {
    // 1. Loại bỏ các dòng trống thừa (giữ tối đa 1 dòng trống giữa đoạn)
    let processed = response
        .split('\n')
        .reduce((acc: string[], line: string, i: number, arr: string[]) => {
            // Giữ dòng này nếu: không trống, hoặc là dòng trống duy nhất liên tiếp
            if (line.trim() || (i > 0 && arr[i - 1].trim())) {
                acc.push(line);
            }
            return acc;
        }, [])
        .join('\n');

    // 2. Trim whitespace ở đầu/cuối
    processed = processed.trim();

    // 3. Nếu response quá dài (> 500 từ), thêm dấu "..." cuối
    const wordCount = processed.split(/\s+/).length;
    if (wordCount > 500) {
        const sentences = processed.split(/([.!?])/);
        let result = '';
        let count = 0;
        for (let i = 0; i < sentences.length; i += 2) {
            const sentence = sentences[i] + (sentences[i + 1] || '');
            count += sentence.split(/\s+/).length;
            if (count > 400) {
                result += sentences[i] + (sentences[i + 1] || '') + '...';
                break;
            }
            result += sentence;
        }
        processed = result.trim();
    }

    return processed;
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Danh sách câu hỏi nhanh cho bé
    const QUICK_QUESTIONS = [
        "Kể chuyện cổ tích đi! 📖",
        "Đố thỏ biết 1+1 bằng mấy? 🔢",
        "Tại sao trời lại mưa? 🌧️",
        "Hát một bài hát đi! 🎵",
        "Thỏ thích măm gì nhất? 🥕",
        "Kể chuyện hài cho bé nghe nào 😂"
    ];

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim()) return;

        setError(null);
        setIsLoading(true);

        // Bước 1: Thêm tin nhắn người dùng vào UI
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
        };
        setMessages(prev => [...prev, userMsg]);

        try {
            // Bước 2: Gọi API backend
            const userId = 1; // TODO: Lấy từ auth session
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    userId: userId,
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('No response body');
            }

            // Bước 3: Đọc stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let assistantContent = '';

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
            };
            setMessages(prev => [...prev, assistantMsg]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;

                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg?.role === 'assistant') {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMsg, content: assistantContent },
                        ];
                    }
                    return prev;
                });
            }

            const finalContent = processResponse(assistantContent);
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === 'assistant') {
                    return [
                        ...prev.slice(0, -1),
                        { ...lastMsg, content: finalContent },
                    ];
                }
                return prev;
            });

            // Xử lý chunk cuối cùng
            const finalChunk = decoder.decode();
            if (finalChunk) {
                assistantContent += finalChunk;
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg?.role === 'assistant') {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMsg, content: assistantContent },
                        ];
                    }
                    return prev;
                });
            }

        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra. Thỏ bị ốm rồi! 🤒');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const msg = input;
        setInput('');
        await sendMessage(msg);
    };

    const handleQuickQuestion = async (question: string) => {
        await sendMessage(question);
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:scale-110 text-white rounded-full p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 animate-bounce-slow focus:outline-none"
                    aria-label="Open Chat"
                >
                    <MessageCircle size={32} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] w-80 sm:w-96 h-[600px] flex flex-col overflow-hidden border-4 border-violet-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-10">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-4 flex justify-between items-center text-white rounded-t-[1.5rem] shadow-md">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white p-2 rounded-full shadow-inner">
                                <Bot className="text-violet-500 animate-pulse" size={24} />
                            </div>
                            <div>
                                <div className="font-extrabold text-lg tracking-wide">Thỏ Rocket 🐰</div>
                                <div className="text-xs text-violet-100 font-medium">Bạn thân của bé!</div>
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors focus:outline-none"
                            aria-label="Close Chat"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-violet-50">
                        {/* Hiển thị error nếu có */}
                        {error && (
                            <div className="text-center text-red-500 text-sm p-3 bg-red-100 rounded-xl border border-red-200 animate-shake">
                                🤒 Huhu: {error}
                            </div>
                        )}

                        {/* Hiển thị greeting khi chưa có tin nhắn nào */}
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-10">
                                <div className="text-6xl mb-4 animate-bounce">👋</div>
                                <p className="font-bold text-lg text-violet-600">Chào bé yêu!</p>
                                <p className="text-sm">Bé muốn trò chuyện gì <br /> với Thỏ Rocket nào? 🥕</p>
                            </div>
                        )}

                        {/* Render tất cả messages */}
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`flex gap-3 max-w-[85%] ${m.role === 'user'
                                        ? 'flex-row-reverse'
                                        : 'flex-row'
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-1 ${m.role === 'user' ? 'bg-amber-400' : 'bg-white border-2 border-violet-200'
                                        }`}>
                                        {m.role === 'user' ? '👶' : '🐰'}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={`p-3 px-4 text-sm shadow-sm ${m.role === 'user'
                                            ? 'bg-gradient-to-br from-amber-400 to-orange-400 text-white rounded-2xl rounded-tr-none'
                                            : 'bg-white text-gray-800 border-2 border-violet-100 rounded-2xl rounded-tl-none'
                                            }`}
                                    >
                                        <div className={`leading-relaxed break-words ${m.role === 'assistant' ? 'prose prose-sm prose-p:my-1 prose-headings:my-2 max-w-none' : ''}`}>
                                            {m.role === 'assistant' ? (
                                                m.content ? (
                                                    <ReactMarkdown
                                                        components={{
                                                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-violet-700" {...props} />,
                                                            h2: ({ node, ...props }) => <h2 className="text-base font-bold text-violet-600" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="font-bold text-violet-600" {...props} />,
                                                            a: ({ node, ...props }) => <a className="text-blue-500 underline decoration-wavy" target="_blank" {...props} />,
                                                            code: ({ node, ...props }: any) => <code className="bg-amber-100 text-amber-800 px-1 rounded" {...props} />,
                                                        }}
                                                    >
                                                        {m.content}
                                                    </ReactMarkdown>
                                                ) : (
                                                    <span className="text-gray-400 italic">Thỏ đang chải tai... 👂</span>
                                                )
                                            ) : (
                                                <span className="font-medium">{m.content}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Hiển thị "đang suy nghĩ" */}
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <div className="flex justify-start w-full pl-10">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border-2 border-violet-100 text-violet-400 text-xs italic flex items-center gap-2">
                                    <span>Thỏ đang nghĩ nè</span>
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions & Input Area */}
                    <div className="bg-white border-t-2 border-violet-100">
                        {/* Quick Questions Chips */}
                        {!isLoading && (
                            <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {QUICK_QUESTIONS.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickQuestion(q)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-bold rounded-full transition-colors border border-violet-200"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Form */}
                        <form onSubmit={handleSubmit} className="p-3 pt-0 flex items-center space-x-2">
                            <input
                                type="text"
                                className="flex-1 bg-gray-100 border-2 border-transparent focus:bg-white focus:border-violet-400 rounded-full px-5 py-3 text-sm focus:outline-none transition-all placeholder-gray-400 text-gray-700"
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Nhập câu hỏi ở đây nha..."
                                disabled={isLoading}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white p-3 rounded-full hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
                                disabled={isLoading || !input.trim()}
                                aria-label="Send message"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
