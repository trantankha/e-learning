# 🎓 Kids English E-Learning Platform

> Nền tảng học tiếng Anh trực tuyến toàn diện cho trẻ em với giao diện tương tác, quản lý tiến độ học tập, hệ thống gamification và các công cụ học tập hiện đại.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

---

## 📋 Mục Lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu tiên quyết](#yêu-cầu-tiên-quyết)
- [Cài đặt nhanh](#cài-đặt-nhanh-với-docker)
- [Cài đặt chi tiết](#cài-đặt-chi-tiết)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Giới Thiệu

**Kids English E-Learning** là một nền tảng học tiếng Anh toàn diện dành cho trẻ em, được thiết kế với mục tiêu:

- 📚 Cung cấp nội dung học tập đa phương tiện (văn bản, âm thanh, hình ảnh)
- 🎮 Tạo trải nghiệm học tập hấp dẫn thông qua gamification
- 📊 Theo dõi tiến độ học tập chi tiết của từng học sinh
- 💳 Hỗ trợ thanh toán khóa học và quản lý đơn hàng
- 🔐 Quản lý người dùng an toàn với xác thực JWT
- 🚀 Đáp ứng cao với kiến trúc microservice

---

## ✨ Tính Năng Chính

### 👥 Quản Lý Người Dùng
- Đăng ký và đăng nhập với email
- Quản lý hồ sơ cá nhân
- Phân quyền: học sinh, giáo viên, quản trị viên
- Hỗ trợ ngôn ngữ đa dạng

### 📚 Quản Lý Khóa Học
- Cấu trúc khóa học phân cấp (Module → Bài học → Câu hỏi)
- Nội dung tương tác với hình ảnh, âm thanh, video
- Theo dõi tiến độ học tập chi tiết

### 🎮 Gamification
- Hệ thống điểm (coins/points)
- Huy hiệu và thành tích
- Bảng xếp hạng (leaderboard)
- Phần thưởng độc quyền

### 📊 Báo Cáo & Phân Tích
- Báo cáo chi tiết về hiệu suất học tập
- Biểu đồ tiến độ theo thời gian
- Phân tích điểm mạnh và yếu

### 💬 Hỗ Trợ Học Tập
- Chat trực tuyến với AI hoặc hỗ trợ viên
- Thực hành phát âm với phản hồi
- Flashcard thích ứng (SRS)

### 🛍️ Cửa Hàng In-App & GemShop
- Mua các khóa học bổ sung
- Đặc quyền người dùng cao cấp
- Quản lý đơn hàng và thanh toán

### 💎 GemShop - Thanh Toán VietQR/SePay
- **Gem Packs**: 5 gói từ 1K đến 50K gems với bonus từ 0% đến 20%
- **Mã giảm giá (Coupon)**: Hỗ trợ mã giảm giá tự động kiểm tra
- **VietQR Payment**: QR code tự động sinh, thanh toán qua ngân hàng
- **Tự động xử lý**: Webhook từ SePay cập nhật tự động, gems được cộng ngay
- **Email xác nhận**: Gửi tự động sau khi thanh toán thành công

---

## 🛠️ Công Nghệ Sử Dụng

### 🔧 Backend
| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|----------|---------|
| **Python** | 3.10+ | Ngôn ngữ lập trình |
| **FastAPI** | 0.109.0 | Framework API |
| **PostgreSQL** | 15 | Cơ sở dữ liệu chính |
| **SQLAlchemy** | 2.0.25 | ORM |
| **Alembic** | 1.13.1 | Migration database |
| **MinIO** | 7.2.4 | Lưu trữ file (S3 compatible) |
| **Celery** | 5.3.6 | Task queue asynchronous |
| **RabbitMQ** | 3 | Message broker |
| **JWT** | JSON Web Tokens | Xác thực |

### ⚛️ Frontend
| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|----------|---------|
| **Next.js** | 16.1.1 | Framework React/SSR |
| **React** | 19.2.3 | UI Library |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4 | Styling |
| **Zustand** | 5.0.10 | State management |
| **Axios** | 1.13.2 | HTTP client |
| **React Hook Form** | 7.71.1 | Form management |

### 🐳 DevOps
- **Docker** & **Docker Compose** - Containerization
- **PostgreSQL** - Database
- **RabbitMQ** - Message broker
- **MinIO** - Object storage

---

## 📦 Yêu Cầu Tiên Quyết

### Phương pháp 1: Docker (Khuyến nghị)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (bao gồm Docker Compose)
- 4GB RAM tối thiểu
- Internet connection

### Phương pháp 2: Local Development
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/) (bao gồm npm)
- [PostgreSQL 15+](https://www.postgresql.org/download/)
- Git

---

## 🚀 Cài Đặt Nhanh Với Docker

Đây là cách nhanh nhất để khởi chạy toàn bộ hệ thống.

```bash
# 1. Clone repository
git clone <repository-url>
cd e-learning

# 2. Khởi chạy services với Docker Compose
docker-compose up -d

# 3. Chạy migration database
docker-compose exec backend python run.py

# 4. Seed dữ liệu (tùy chọn)
docker-compose exec backend python seed.py

# 5. Truy cập ứng dụng
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MinIO Console: http://localhost:9001
- RabbitMQ: http://localhost:15672
```

### Dừng hệ thống:
```bash
docker-compose down
```

### Xem logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📖 Cài Đặt Chi Tiết

### 1. Thiết Lập Backend

Backend xử lý logic API, tương tác cơ sở dữ liệu và xác thực.

#### Bước 1: Clone Repository & Chuẩn Bị
```bash
git clone <repository-url>
cd e-learning/backend
```

#### Bước 2: Tạo Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Bước 3: Cài Đặt Dependencies
```bash
pip install -r requirements.txt
```

#### Bước 4: Cấu Hình Environment
```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa .env với các giá trị phù hợp
# DATABASE_URL=postgresql://user:password@localhost:5432/learning_english_db
# SECRET_KEY=your-secret-key-here
# MINIO_URL=http://localhost:9000
```

#### Bước 5: Chuẩn Bị Database
```bash
# Chạy migration
alembic upgrade head

# Seed dữ liệu (tùy chọn)
python seed.py
```

#### Bước 6: Khởi Chạy Backend
```bash
# Development
python run.py

# hoặc với uvicorn trực tiếp
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend sẽ chạy tại: **http://localhost:8000**
- API Documentation (Swagger): **http://localhost:8000/docs**
- ReDoc: **http://localhost:8000/redoc**

---

### 2. Thiết Lập Frontend

Frontend là ứng dụng Next.js tương tác cho người dùng.

#### Bước 1: Di Chuyển vào Thư Mục Frontend
```bash
cd e-learning/frontend
```

#### Bước 2: Cài Đặt Dependencies
```bash
npm install
# hoặc
yarn install
```

#### Bước 3: Cấu Hình Environment
```bash
# Tạo file .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_APP_NAME=Kids English E-Learning
```

#### Bước 4: Chạy Development Server
```bash
npm run dev
# hoặc
yarn dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

#### Bước 5: Build Production
```bash
npm run build
npm start
```

---

### 3. Thiết Lập Services Kèm Theo

#### PostgreSQL
```bash
# Nếu sử dụng local (không Docker)
# Tải tại: https://www.postgresql.org/download/

# Tạo database
createdb learning_english_db

# Hoặc trong psql
CREATE DATABASE learning_english_db;
```

#### MinIO (Object Storage)
```bash
# Tải tại: https://min.io/download
# Hoặc chạy qua Docker
docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
```

#### RabbitMQ (Message Broker)
```bash
# Docker
docker run -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

---

## 📁 Cấu Trúc Dự Án

```
e-learning/
│
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── main.py                   # Entry point
│   │   ├── api/v1/                   # API routes (v1)
│   │   ├── models/                   # SQLAlchemy models
│   │   ├── schemas/                  # Pydantic schemas
│   │   ├── services/                 # Business logic
│   │   ├── core/                     # Config, security, database
│   │   ├── fixtures/                 # Sample data
│   │   └── templates/                # Email templates
│   ├── alembic/                      # Database migrations
│   ├── requirements.txt               # Python dependencies
│   ├── run.py                        # Entry point script
│   ├── seed.py                       # Database seeding
│   ├── Dockerfile                    # Docker image config
│   └── alembic.ini                   # Alembic config
│
├── frontend/                         # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── (auth)/                   # Auth pages
│   │   ├── (dashboard)/              # Protected dashboard pages
│   │   └── api/                      # API routes
│   ├── components/                   # React components
│   │   ├── dashboard/
│   │   ├── learning-player/
│   │   ├── auth/
│   │   └── ui/
│   ├── hooks/                        # Custom React hooks
│   ├── services/                     # API service calls
│   ├── stores/                       # Zustand stores
│   ├── types/                        # TypeScript types
│   ├── package.json                  # Node dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── next.config.ts                # Next.js config
│   └── Dockerfile                    # Docker image config
│
├── collection/                       # Postman/API collections
├── resource/                         # Assets & resources
├── docker-compose.yml                # Docker services orchestration
├── .gitignore                        # Git ignore rules
└── README.md                         # This file
```

---

## 💡 Hướng Dẫn Sử Dụng

### Cho Học Sinh

#### 1. Đăng Ký Tài Khoản
- Truy cập http://localhost:3000/register
- Nhập email, tên và mật khẩu
- Xác nhận email (nếu có)
- Đăng nhập vào tài khoản

#### 2. Khám Phá Khóa Học
- Vào mục "Khóa học" để xem danh sách
- Click vào khóa học để xem chi tiết
- Mua khóa học bằng coins hoặc thanh toán
- Bắt đầu học tập

#### 3. Theo Dõi Tiến Độ
- Dashboard hiển thị tiến độ hôm nay
- Xem badges, achievements đã mở
- Kiểm tra bảng xếp hạng (Leaderboard)
- Xem báo cáo học tập chi tiết

#### 4. Sử Dụng Tính Năng Học Tập
- **Flashcard**: Học từ vựng với spaced repetition
- **Bài kiểm tra**: Làm bài tập để kiểm tra kiến thức
- **Thực hành phát âm**: Ghi âm và so sánh
- **Chat**: Hỏi đáp với hỗ trợ viên

#### 5. Mua Khóa Học & Nâng Cấp
- Truy cập cửa hàng (Shop)
- Chọn khóa học hoặc gói nâng cấp
- Thanh toán qua Stripe/PayPal
- Truy cập ngay khóa học mới mua

### Cho Giáo Viên

#### 1. Tạo Khóa Học
- Đăng nhập với tài khoản giáo viên
- Chọn "Tạo Khóa Học"
- Thêm modules, bài học, câu hỏi
- Đặt giá và xuất bản

#### 2. Quản Lý Học Sinh
- Xem danh sách học sinh đã tham gia
- Theo dõi tiến độ từng học sinh
- Cấp điểm và feedback

#### 3. Phân Tích Hiệu Suất
- Xem thống kê khóa học
- Phân tích tỷ lệ hoàn thành
- Xem điểm trung bình học sinh

### Cho Quản Trị Viên

#### 1. Quản Lý Hệ Thống (Admin Panel)
```
http://localhost:8000/admin
```
- Quản lý người dùng (Users)
- Quản lý khóa học (Courses)
- Quản lý đơn hàng (Orders)
- Xem logs hệ thống

#### 2. Quản Lý Nội Dung
- Duyệt khóa học từ giáo viên
- Quản lý coupon/khuyến mãi
- Cấu hình hệ thống

---

## 🔌 API Documentation

### Endpoints Chính

#### Authentication
```
POST   /api/v1/auth/register        - Đăng ký
POST   /api/v1/auth/login           - Đăng nhập
POST   /api/v1/auth/logout          - Đăng xuất
POST   /api/v1/auth/refresh-token   - Làm mới token
```

#### Users
```
GET    /api/v1/users/me              - Lấy thông tin user hiện tại
PUT    /api/v1/users/{user_id}       - Cập nhật thông tin user
GET    /api/v1/users/{user_id}       - Lấy thông tin user
```

#### Courses
```
GET    /api/v1/courses               - Lấy danh sách khóa học
GET    /api/v1/courses/{course_id}   - Lấy chi tiết khóa học
POST   /api/v1/courses               - Tạo khóa học (Giáo viên)
PUT    /api/v1/courses/{course_id}   - Cập nhật khóa học
DELETE /api/v1/courses/{course_id}   - Xóa khóa học
```

#### Study Progress
```
GET    /api/v1/progress              - Lấy tiến độ học
POST   /api/v1/progress/submit       - Nộp bài
GET    /api/v1/progress/{course_id}  - Lấy tiến độ khóa học
```

#### Orders & Payments
```
POST   /api/v1/orders                - Tạo đơn hàng
GET    /api/v1/orders/{order_id}     - Lấy chi tiết đơn hàng
GET    /api/v1/orders                - Lấy danh sách đơn hàng
```

Xem **full API docs** tại: `http://localhost:8000/docs`

---

## 🔧 Development Workflow

### Chạy Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

### Code Quality
```bash
# Backend - Lint Python code
pylint app/
black app/
flake8 app/

# Frontend - Lint TypeScript/React
npm run lint
```

### Database Migrations
```bash
# Tạo migration mới
alembic revision --autogenerate -m "Migration message"

# Chạy migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

---

## 📋 Biến Môi Trường (Environment Variables)

### Backend (.env)
```ini
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/learning_english_db

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@example.com

# MinIO
MINIO_URL=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minio123
MINIO_BUCKET_NAME=learning-english

# Celery
CELERY_BROKER_URL=amqp://guest:guest123@localhost:5672//
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Google Gemini AI
GOOGLE_GENAI_API_KEY=your-api-key

# Environment
DEBUG=True
ENVIRONMENT=development
```

### Frontend (.env.local)
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Kids English E-Learning
NEXT_PUBLIC_STRIPE_KEY=your-stripe-public-key
```

---

## 🐛 Troubleshooting

### ❌ "Connection refused" cho PostgreSQL
```bash
# Kiểm tra PostgreSQL đang chạy
# Windows: Services → Tìm PostgreSQL
# macOS/Linux: brew services list

# Hoặc khởi động lại
sudo service postgresql restart  # Linux
brew services restart postgresql # macOS
```

### ❌ "ModuleNotFoundError" trong Backend
```bash
# Kiểm tra virtual environment đã active
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Cài lại dependencies
pip install -r requirements.txt
```

### ❌ "Port already in use"
```bash
# Frontend (Port 3000)
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Backend (Port 8000)
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### ❌ CORS errors trên Frontend
- Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.local`
- Đảm bảo backend đã khởi chạy
- Kiểm tra CORS settings trong `backend/app/main.py`

### ❌ Database migration errors
```bash
# Kiểm tra status migration
alembic current

# Xem all migrations
alembic history

# Rollback về version cụ thể
alembic downgrade <revision_id>

# Reset (xóa tất cả tables và migrate lại)
alembic downgrade base
alembic upgrade head
```

### ❌ Docker không khởi động được
```bash
# Kiểm tra Docker daemon
docker ps

# Xem logs chi tiết
docker-compose logs backend
docker-compose logs frontend

# Rebuild images
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Performance & Optimization

### Backend Optimization
- ✅ Database indexing trên các trường thường xuyên query
- ✅ Caching với Redis
- ✅ Async tasks với Celery
- ✅ Pagination trên API endpoints
- ✅ Lazy loading cho relationships

### Frontend Optimization
- ✅ Code splitting & dynamic imports
- ✅ Image optimization với Next.js Image component
- ✅ CSS purging với Tailwind
- ✅ Service Worker caching
- ✅ API request caching

---

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Mở Pull Request

---

## 📄 License

Project này sử dụng license [MIT](LICENSE) - tự do sử dụng cho mục đích thương mại và cá nhân.

---

## 📧 Support & Contact

- 📧 Email: support@example.com
- 💬 Discord: [Join Server]
- 🐛 Issues: [GitHub Issues]
- 📖 Documentation: [Wiki]

---

## 🙏 Cảm Ơn

Cảm ơn tất cả những người đóng góp và cộng đồng đã hỗ trợ dự án này!

---

**Last Updated**: January 2026
**Version**: 1.0.0
    *   **Windows:**
        ```bash
        venv\Scripts\activate
        ```
    *   **macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```

4.  **Cài đặt các gói phụ thuộc:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Cấu hình biến môi trường:**
    Tạo file `.env` trong thư mục `backend`. Bạn có thể sử dụng cấu hình mẫu sau:
    ```env
    PROJECT_NAME="Kids English E-Learning"
    API_V1_STR="/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
    
    # Cơ sở dữ liệu (Cập nhật thông tin Postgres của bạn nếu cần)
    POSTGRES_SERVER=localhost
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=password
    POSTGRES_DB=learning_english_db
    POSTGRES_PORT=5432
    
    # Bảo mật
    SECRET_KEY=YOUR_SUPER_SECRET_KEY_HERE
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    
    # MinIO
    MINIO_ENDPOINT=localhost:9000
    MINIO_ACCESS_KEY=minioadmin
    MINIO_SECRET_KEY=minio123
    BUCKET_NAME=e-learning
    ```

6.  **Chạy Migrations cho cơ sở dữ liệu:**
    ```bash
    alembic upgrade head
    ```

7.  **Khởi tạo dữ liệu mẫu (Tùy chọn):**
    Script này sẽ tạo dữ liệu ban đầu (vai trò, tài khoản admin, v.v.) vào cơ sở dữ liệu.
    ```bash
    python seed.py
    ```

8.  **Khởi chạy Server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    API sẽ chạy tại `http://localhost:8000`. Tài liệu API có thể truy cập tại `http://localhost:8000/docs`.

### 2. Thiết Lập Frontend

Frontend là giao diện người dùng dành cho học sinh và quản trị viên.

1.  **Di chuyển vào thư mục frontend:**
    ```bash
    cd frontend
    ```

2.  **Cài đặt các gói phụ thuộc:**
    ```bash
    npm install
    ```

3.  **Cấu hình biến môi trường:**
    Tạo file `.env.local` trong thư mục `frontend`:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    ```

4.  **Khởi chạy Server Phát triển:**
    ```bash
    npm run dev
    ```
    Ứng dụng sẽ chạy tại `http://localhost:3000`.

### 3. Dịch Vụ Docker (MinIO)

Dự án này sử dụng MinIO để lưu trữ đối tượng (hình ảnh, tệp tin). Bạn có thể chạy nó dễ dàng bằng Docker.

1.  **Di chuyển về thư mục gốc của dự án:**
    ```bash
    cd ..
    ```
    (Đảm bảo bạn đang ở thư mục chứa `docker-compose.yml`)

2.  **Khởi chạy MinIO:**
    ```bash
    docker-compose up -d minio createbuckets
    ```
    *   **MinIO Console:** `http://localhost:9001` (User: `minioadmin`, Pass: `minio123`)
    *   **MinIO API:** `http://localhost:9000`
