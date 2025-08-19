# 🎓 Website Lưu Trữ Ảnh Tốt Nghiệp

Một trang web đẹp mắt để lưu trữ và chia sẻ những khoảnh khắc đáng nhớ trong ngày tốt nghiệp, được thiết kế với Tailwind CSS và hỗ trợ upload ảnh trực tiếp.

## ✨ Tính năng

### 🎨 **Giao diện đẹp mắt**
- **Thiết kế responsive** - Hoạt động tốt trên mọi thiết bị
- **Hiệu ứng đẹp mắt** - Animations và transitions mượt mà
- **Glassmorphism UI** - Hiệu ứng kính mờ hiện đại
- **Tailwind CSS** - Thiết kế hiện đại, tối ưu

### 📷 **Quản lý ảnh thông minh**
- **Upload ảnh trực tiếp** - Kéo thả hoặc chọn file
- **Preview trước khi upload** - Xem trước ảnh sẽ upload
- **Phân loại ảnh** - Theo danh mục (Lễ tốt nghiệp, Bạn bè, Gia đình)
- **Chỉnh sửa thông tin** - Sửa mô tả, xóa ảnh
- **Lazy loading** - Tối ưu hiệu suất tải ảnh

### 🔐 **Hệ thống phân quyền**
- **Admin mode** - Upload và quản lý ảnh
- **Viewer mode** - Chỉ xem, không upload được
- **Share link** - Chia sẻ cho người khác chỉ xem
- **Bảo mật đơn giản** - Mật khẩu admin

### 🎵 **Tính năng tương tác**
- **Phát nhạc nền** - Tự động phát nhạc khi người dùng tương tác
- **Modal xem ảnh** - Xem ảnh full-size với navigation
- **Filter ảnh** - Phân loại ảnh theo danh mục
- **Easter egg** - Click tiêu đề 5 lần để confetti

### 📊 **Thống kê**
- **Đếm lượt truy cập** - Theo dõi lượt view
- **Thống kê ảnh** - Số lượng ảnh theo danh mục
- **Lịch sử upload** - Thời gian upload gần nhất

## 📁 Cấu trúc thư mục

```
📦 Totnghiep/
├── 📄 index.html          # Trang chủ (viewer)
├── 📄 gallery.html        # Trang gallery đầy đủ
├── 📄 admin.html          # Trang admin (upload & quản lý)
├── 📄 style.css           # CSS tùy chỉnh
├── 📄 script.js           # JavaScript cho trang chủ
├── 📄 gallery.js          # JavaScript cho gallery
├── 📄 admin.js            # JavaScript cho admin
├── 🎵 phepmau.mp3         # File nhạc nền
└── 📁 images/             # Thư mục chứa ảnh
    ├── 🖼️ img-1.jpg
    ├── 🖼️ img-2.jpg
    └── ...
```

## 🚀 Cách sử dụng

### 1. Setup Backend (MongoDB Atlas)

#### **Bước 1: Cài đặt Backend**
```bash
cd backend
npm install
```

#### **Bước 2: Cấu hình MongoDB Atlas**
1. **Đăng ký MongoDB Atlas** tại [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Tạo cluster mới** (chọn free tier)
3. **Tạo database user**:
   - Database Access → Add New Database User
   - Username: `graduser`
   - Password: tạo password mạnh
4. **Whitelist IP**:
   - Network Access → Add IP Address
   - Chọn "Allow Access from Anywhere" (0.0.0.0/0)
5. **Lấy connection string**:
   - Clusters → Connect → Connect your application
   - Copy connection string

#### **Bước 3: Cấu hình Cloudinary (để lưu ảnh)**
1. **Đăng ký Cloudinary** tại [cloudinary.com](https://cloudinary.com)
2. **Lấy API credentials** từ dashboard
3. **Copy**: Cloud Name, API Key, API Secret

#### **Bước 4: Tạo file .env**
```bash
cd backend
cp .env.example .env
```

Chỉnh sửa `.env` với thông tin của bạn:
```env
MONGODB_URI=mongodb+srv://graduser:your_password@cluster0.xxxxx.mongodb.net/graduation_gallery
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_PASSWORD=your_secure_password
```

#### **Bước 5: Chạy Backend**
```bash
npm run dev
```
Backend sẽ chạy tại: `http://localhost:3000`

### 2. Chạy Frontend

#### **Bước 1: Cập nhật API URL**
Mở file `api-config.js` và đổi:
```javascript
BASE_URL: 'http://localhost:3000/api', // Local development
// Hoặc URL deploy của bạn: 'https://your-api.herokuapp.com/api'
```

#### **Bước 2: Chạy Frontend**
- **Cách 1**: Double-click `index.html`
- **Cách 2**: Live Server (VS Code)
- **Cách 3**: Python server
```bash
python -m http.server 8000
# Truy cập: http://localhost:8000
```

### 3. Đăng nhập Admin

1. **Truy cập admin**: `admin.html`
2. **Đăng nhập**:
   - Username: `admin`
   - Password: (như trong file .env)

### 4. Upload ảnh

1. **Chọn ảnh**: Kéo thả hoặc click chọn
2. **Thêm thông tin**: Mô tả, danh mục
3. **Upload**: Ảnh sẽ lưu trên Cloudinary & MongoDB
4. **Hiển thị**: Tự động hiện trên website

### 5. Chia sẻ website

1. **Deploy backend** lên Heroku/Railway/Render
2. **Deploy frontend** lên Netlify/Vercel/GitHub Pages
3. **Copy share link** từ admin panel
4. **Gửi cho bạn bè**: Họ chỉ xem, không upload được

## 🔧 Tùy chỉnh

### Thay đổi mật khẩu admin
```javascript
// Trong admin.js, dòng 4
const ADMIN_PASSWORD = 'your_secure_password';
```

### Thay đổi màu sắc
```javascript
// Trong HTML files, phần tailwind.config
// Thay đổi gradient colors:
'from-purple-600 to-pink-600' → 'from-blue-600 to-green-600'
```

### Tùy chỉnh danh mục
```javascript
// Trong admin.html và gallery.html
// Thêm/sửa option trong select:
<option value="new_category">Tên danh mục mới</option>
```

## 💾 Lưu trữ dữ liệu

### LocalStorage Keys:
- `graduation_photos` - Dữ liệu ảnh
- `site_stats` - Thống kê truy cập
- `admin_logged_in` - Trạng thái đăng nhập admin

### Backup dữ liệu:
```javascript
// Export data
const data = localStorage.getItem('graduation_photos');
console.log(data); // Copy và lưu vào file

// Import data
localStorage.setItem('graduation_photos', 'your_backup_data');
```

## 🔒 Bảo mật

### Lưu ý quan trọng:
- **Mật khẩu admin** lưu trong JavaScript (không an toàn tuyệt đối)
- **Dữ liệu ảnh** lưu trong LocalStorage (local only)
- **Phù hợp cho**: Sử dụng cá nhân, chia sẻ trong nhóm nhỏ
- **Không phù hợp cho**: Website công khai, dữ liệu nhạy cảm

### Tăng cường bảo mật:
1. Đổi mật khẩu admin phức tạp
2. Host trên server riêng tư
3. Sử dụng HTTPS
4. Backup dữ liệu thường xuyên

## 🌐 Triển khai

### Cách 1: Local
- Mở `index.html` trực tiếp trong trình duyệt

### Cách 2: Live Server (VS Code)
- Cài extension "Live Server"
- Right-click `index.html` → "Open with Live Server"

### Cách 3: Hosting
- Upload tất cả files lên web hosting
- Truy cập qua domain/URL của bạn

## 📱 Responsive

Website tự động responsive cho:
- 📱 **Mobile** (< 768px) - Touch-friendly
- 📺 **Tablet** (768px - 1024px) - Optimized grid
- 🖥️ **Desktop** (> 1024px) - Full features

## � Troubleshooting

**Ảnh không hiển thị:**
- Kiểm tra file có upload thành công không
- Xem Console để check lỗi
- Thử refresh trang

**Không đăng nhập được admin:**
- Kiểm tra mật khẩu trong `admin.js`
- Clear browser cache
- Thử trình duyệt khác

**Mất dữ liệu:**
- Dữ liệu lưu trong LocalStorage (local only)
- Xóa browser data sẽ mất ảnh
- Nên backup thường xuyên

## 🎉 Tips & Tricks

### Easter Eggs:
- Click tiêu đề chính 5 lần → Confetti effect
- Keyboard shortcuts trong modal: ←/→ (chuyển ảnh), Esc (đóng)

### Performance:
- Nén ảnh trước khi upload (< 1MB recommended)
- Không upload quá nhiều ảnh cùng lúc
- Clear browser cache nếu chậm

### UX tốt nhất:
- Đặt tên ảnh có ý nghĩa
- Phân loại đúng danh mục
- Viết mô tả chi tiết

## 📄 License

Free to use cho mục đích cá nhân. Nếu sử dụng cho thương mại, vui lòng credit.

## 🤝 Đóng góp

Nếu bạn có ý tưởng cải thiện, welcome PRs và issues!

---

**Chúc bạn có những kỷ niệm đẹp! 🎓✨**

### 🔗 Demo Links:
- **Trang chủ**: `index.html` 
- **Gallery**: `gallery.html`
- **Admin**: `admin.html` (password: admin123)
- **Share link**: `index.html?view=shared`
