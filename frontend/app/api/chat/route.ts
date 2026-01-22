import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const message = body.message;
        const userId = body.userId || 1; // Mặc định user_id = 1

        if (!message) {
            return new NextResponse("No message provided", { status: 400 });
        }

        // Call FastAPI backend
        const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const response = await fetch(`${backendUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, user_id: userId }),
        });

        if (!response.ok) {
            console.error("Backend error:", response.statusText);
            return new NextResponse(`Backend Error: ${response.statusText}`, { status: response.status });
        }

        // Stream response directly to client
        return new NextResponse(response.body, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        console.error("Error in chat proxy:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
