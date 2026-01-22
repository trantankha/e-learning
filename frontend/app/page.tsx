import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-100 to-white overflow-hidden font-sans">
      {/* Navbar / Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-4xl">🐱</span>
          <span className="text-2xl font-black text-sky-800 tracking-tight">KidsEng</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button className="rounded-full bg-white text-sky-600 hover:bg-sky-50 font-bold border-2 border-sky-100 shadow-sm">
              Đăng Nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-orange-200 shadow-lg transform hover:scale-105 transition">
              Đăng Ký Miễn Phí
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 md:pt-20 md:pb-32 flex flex-col md:flex-row items-center gap-12">
        {/* Text Content */}
        <div className="md:w-1/2 text-center md:text-left space-y-8 animate-in slide-in-from-left duration-700">
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 leading-tight">
            Học Tiếng Anh <br />
            <span className="text-sky-600">Thật Vui!</span> 🚀
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-lg mx-auto md:mx-0">
            Khám phá thế giới tiếng Anh qua video, trò chơi và những bài học đầy màu sắc dành riêng cho bé.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-xl font-black bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-200 hover:-translate-y-1 transition-all">
                Bắt Đầu Ngay ⭐
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto h-16 px-8 rounded-2xl text-xl font-bold text-slate-600 hover:bg-white/50 border-2 border-transparent hover:border-slate-200">
                Đã có tài khoản?
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image / Illustration Placeholder */}
        <div className="md:w-1/2 relative animate-in slide-in-from-right duration-700 delay-200">
          <div className="relative z-10 bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition duration-500">
            <div className="bg-sky-100 rounded-[2rem] aspect-video flex items-center justify-center overflow-hidden">
              <span className="text-9xl animate-bounce">🦁</span>
            </div>
            <div className="mt-6 flex justify-between items-center px-4">
              <div>
                <div className="h-4 w-32 bg-slate-100 rounded-full mb-2"></div>
                <div className="h-3 w-20 bg-slate-100 rounded-full"></div>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                ▶️
              </div>
            </div>
          </div>

          {/* Decor Elements */}
          <div className="absolute top-[-20px] right-[-20px] text-6xl animate-pulse delay-700">🌟</div>
          <div className="absolute bottom-[-40px] left-[-40px] text-6xl animate-bounce delay-1000">🎨</div>
          <div className="absolute top-1/2 left-[-60px] w-24 h-24 bg-yellow-300 rounded-full blur-2xl opacity-50"></div>
          <div className="absolute bottom-0 right-[-40px] w-40 h-40 bg-pink-300 rounded-full blur-3xl opacity-40"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-4">Tại sao bé thích KidsEng?</h2>
            <div className="w-24 h-2 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-sky-50 border-2 border-sky-100 hover:shadow-xl transition hover:-translate-y-2">
              <div className="w-16 h-16 bg-sky-200 rounded-2xl flex items-center justify-center text-4xl mb-6">
                📺
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Video Thú Vị</h3>
              <p className="text-slate-600 font-medium">
                Học qua các video hoạt hình vui nhộn, giúp bé tiếp thu tự nhiên.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-purple-50 border-2 border-purple-100 hover:shadow-xl transition hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-200 rounded-2xl flex items-center justify-center text-4xl mb-6">
                🎮
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Vừa Học Vừa Chơi</h3>
              <p className="text-slate-600 font-medium">
                Bài kiểm tra dưới dạng trò chơi tương tác, không gây áp lực.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-yellow-50 border-2 border-yellow-100 hover:shadow-xl transition hover:-translate-y-2">
              <div className="w-16 h-16 bg-yellow-200 rounded-2xl flex items-center justify-center text-4xl mb-6">
                🏆
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Quà Tặng Hấp Dẫn</h3>
              <p className="text-slate-600 font-medium">
                Tích lũy sao và huy hiệu sau mỗi bài học để đổi quà.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 text-center">
        <p className="font-bold text-slate-500">© 2024 Kids English E-Learning. Made with headers ❤️</p>
      </footer>
    </main>
  );
}
