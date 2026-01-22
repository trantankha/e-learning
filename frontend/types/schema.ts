export enum LessonType {
    VOCABULARY = "vocabulary",
    GRAMMAR = "grammar",
    PHONICS = "phonics",
    LISTENING = "listening",
    QUIZ = "quiz",
}

export enum UserRole {
    ADMIN = "admin",
    PARENT = "parent",
    STUDENT = "student",
}

export interface VideoMaterial {
    id: number;
    lesson_id: number;
    video_url: string;
    duration_seconds: number;
    transcript?: string;
}

export interface Question {
    id: number;
    text: string;
    options: string[];
    correct_answer: string;
}

export interface Lesson {
    id: number;
    unit_id: number;
    title: string;
    lesson_type: LessonType;
    order_index: number;
    thumbnail_url?: string;
    video_url?: string;
    attachment_url?: string;
    pronunciation_word?: string;
    questions?: Question[];

    // Relations (Optional because they might not always be fetched)
    video_material?: VideoMaterial;

    // Computed/Joined fields (often needed for frontend display)
    is_completed?: boolean;
    last_watched_position?: number;
}

export interface LessonDashboard {
    id: number;
    title: string;
    lesson_type: LessonType;
    thumbnail_url?: string;
    order_index: number;
    is_locked: boolean;
    is_completed: boolean;
    score: number;
}

export interface Unit {
    id: number;
    course_id: number;
    title: string;
    order_index: number;
    lessons?: Lesson[];
    progress_percentage?: number; // Computed
}

export interface Course {
    id: number;
    title: string;
    description: string;
    level: 'starters' | 'movers' | 'flyers';
    thumbnail_url: string;
    units?: Unit[];
}

export interface UnitDashboard {
    id: number;
    title: string;
    order_index: number;
    lessons: LessonDashboard[];
}

export interface DashboardPathResponse {
    units: UnitDashboard[];
}

export interface ShopItem {
    id: number;
    name: string;
    description?: string;
    price: number;
    category: 'hat' | 'shirt' | 'glasses' | 'background' | 'body';
    layer_order: number;
    image_url?: string;
    is_owned: boolean;
    is_equipped: boolean;
}

export interface OrderResponse {
    order_id: string;
    amount: number;
    description?: string;
    status: string;
    qr_url: string;
    discount_amount?: number;
    coupon_code?: string;
}

export interface CreateOrderRequest {
    amount: number;
    description?: string;
    item_type?: string;
    item_id?: string;
    coupon_code?: string;
}

