# PRN232 Auto Grader Client

Giao diện quản trị cho hệ thống chấm bài tự động PRN232. Ứng dụng hỗ trợ hai nhóm quy trình chính:

- **PE Exam Grading:** quản lý kỳ thi, bài tập, thí sinh, bài nộp, kết quả và xuất điểm.
- **Lab Grading:** quản lý học kỳ, lab, test case, bài nộp, tiến trình chấm và đồng bộ điểm.

## Công nghệ

- Next.js 16 (App Router)
- React 19 và TypeScript
- Tailwind CSS 4
- Driver.js (hướng dẫn sử dụng tương tác)
- Docker (standalone Next.js image)

## Yêu cầu

- Node.js 22 LTS hoặc phiên bản tương thích với Next.js 16
- npm (dự án sử dụng `package-lock.json`)
- Backend Grading Auto Server đang hoạt động
- Docker và Docker Compose nếu chạy bằng container

## Chạy local

1. Cài dependency:

   ```bash
   npm ci
   ```

2. Tạo file cấu hình môi trường:

   ```bash
   cp .env.local.example .env.local
   ```

   Trên PowerShell:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

3. Điều chỉnh `.env.local` theo môi trường backend.

4. Khởi động development server:

   ```bash
   npm run dev
   ```

5. Mở [http://localhost:3000](http://localhost:3000).

Mặc định client gọi API tại `http://localhost:5049/api/v1`.

## Biến môi trường

| Biến | Bắt buộc | Giá trị local gợi ý | Mô tả |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Có | `http://localhost:5049/api/v1` | Base URL của backend API, bao gồm prefix `/api/v1`. |
| `NEXT_PUBLIC_APP_URL` | Có | `http://localhost:3000` | URL public của client, dùng để tạo OAuth callback URL. |
| `NEXT_PUBLIC_GOOGLE_AUTH_URL` | Không | Để trống | URL đầy đủ để bắt đầu Google OAuth. Khi để trống, client suy ra URL từ API nhưng nút đăng nhập vẫn báo OAuth chưa được cấu hình. |
| `SKIP_AUTH` | Chỉ dev | `true` | Bỏ qua kiểm tra auth phía server trong môi trường development. |
| `NEXT_PUBLIC_SKIP_AUTH` | Chỉ dev | `true` | Bỏ qua auth phía client trong môi trường development. |

> `SKIP_AUTH` và `NEXT_PUBLIC_SKIP_AUTH` không có hiệu lực khi `NODE_ENV=production`. Không bật auth bypass trên môi trường triển khai thật.

Nếu dùng đăng nhập Google, backend cần cho phép callback về:

```text
<NEXT_PUBLIC_APP_URL>/auth/callback
```

## Các lệnh thường dùng

| Lệnh | Chức năng |
| --- | --- |
| `npm run dev` | Chạy development server có hot reload. |
| `npm run lint` | Kiểm tra ESLint. |
| `npm run build` | Tạo production build. |
| `npm run start` | Chạy production build đã tạo. |
| `npm run docker:dev` | Pull và chạy image dev theo `docker/docker-compose.dev.yml`. |
| `npm run docker:dev:down` | Dừng stack Docker dev. |
| `npm run docker:prod` | Pull và chạy image production theo `docker/docker-compose.prod.yml`. |
| `npm run docker:prod:down` | Dừng stack Docker production. |

Trước khi mở pull request hoặc bàn giao thay đổi, nên chạy:

```bash
npm run lint
npm run build
```

## Chạy production không dùng Docker

```bash
npm ci
npm run build
npm run start
```

Ứng dụng mặc định lắng nghe tại `http://localhost:3000`.

## Chạy bằng Docker Compose

Các file Compose hiện tại **pull image có sẵn từ Docker Hub**, không build source code tại máy.

1. Tạo file môi trường:

   ```powershell
   Copy-Item docker/.env.example docker/.env.local
   ```

2. Cập nhật các giá trị trong `docker/.env.local`:

   ```dotenv
   DOCKER_USERNAME=your_docker_hub_username
   IMAGE_TAG=latest
   FE_PORT=3001
   NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

3. Chạy container:

   ```bash
   npm run docker:dev
   ```

4. Mở `http://localhost:3001` hoặc port đã đặt trong `FE_PORT`.

Với production, tạo `docker/.env` thay vì `docker/.env.local`, sau đó chạy:

```bash
npm run docker:prod
```

### Tự build Docker image

Các biến `NEXT_PUBLIC_*` được nhúng vào bundle lúc build. Vì vậy phải truyền đúng giá trị khi tạo image:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 \
  --build-arg NEXT_PUBLIC_APP_URL=https://grader.example.com \
  -t grading-auto-client:local .
```

Đổi biến `NEXT_PUBLIC_*` lúc container đã chạy không thay thế được giá trị đã build vào client bundle; hãy build lại image khi URL API hoặc URL ứng dụng thay đổi.

## CI/CD

Workflow `.github/workflows/ci.yml` chạy khi push lên nhánh `main`, build image Linux AMD64 và đẩy hai tag lên Docker Hub:

- `latest`
- Git commit SHA

Repository cần cấu hình:

- Secrets: `DOCKER_USERNAME`, `DOCKER_PASSWORD`
- Variables: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`

## Cấu trúc chính

```text
src/
├── app/          # Routes và layouts theo Next.js App Router
├── components/   # UI, layout và shared components
├── config/       # Cấu hình ứng dụng
├── hooks/        # React hooks
├── lib/          # API client, auth và utilities
└── types/        # TypeScript types
docker/           # Docker Compose và mẫu biến môi trường
public/           # Static assets
```

## Xử lý lỗi thường gặp

- **Client không gọi được API:** kiểm tra `NEXT_PUBLIC_API_URL`, backend và cấu hình CORS. URL phải chứa `/api/v1`.
- **Bị chuyển về trang đăng nhập khi phát triển:** kiểm tra cả `SKIP_AUTH=true` và `NEXT_PUBLIC_SKIP_AUTH=true`, sau đó khởi động lại dev server.
- **Đổi biến môi trường nhưng giao diện chưa cập nhật:** dừng và chạy lại dev server; với Docker production cần build lại image.
- **Docker mở sai cổng:** kiểm tra `FE_PORT` trong file env của Docker. Cổng mặc định của Compose là `3001`.
