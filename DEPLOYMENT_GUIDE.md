# 🚀 Hướng dẫn triển khai lên hosting dataonline.vn

## 📋 Danh sách file cần upload

### ✅ File Frontend (bắt buộc):
```
📁 ROOT/
├── index.html          # Trang chủ
├── gallery.html        # Gallery ảnh
├── admin.html          # Trang quản lý (admin)
├── style.css           # CSS styles
├── script.js           # JavaScript chính
├── gallery.js          # JavaScript gallery
├── admin.js            # JavaScript admin
├── api-config.js       # Cấu hình API
├── phepmau.mp3         # Nhạc nền
└── README.md           # Hướng dẫn
```

### ✅ File Backend (Node.js - nếu hosting hỗ trợ):
```
📁 backend/
├── package.json        # Dependencies
├── server.js           # Server chính
├── server-supabase.js  # Server với Supabase
├── config/
│   └── supabase.js     # Config Supabase
├── routes/
│   ├── photos.js       # API routes
│   └── stats.js        # Statistics API
└── models/
    └── Photo.js        # Photo model
```

## 🔧 Bước 1: Chuẩn bị file cho hosting

### Option 1: Chỉ Frontend (hosting thường)
Nếu hosting chỉ hỗ trợ HTML/CSS/JS:

1. Upload các file frontend
2. Sửa `api-config.js` để sử dụng dịch vụ lưu trữ ảnh miễn phí
3. Có thể dùng Firebase, Cloudinary, hoặc ImgBB

### Option 2: Full-stack (hosting Node.js)
Nếu hosting hỗ trợ Node.js:

1. Upload cả frontend và backend
2. Cài đặt dependencies: `npm install`
3. Start server: `npm start`

## 🌐 Bước 2: Cấu hình cho dataonline.vn

### 1. Kiểm tra loại hosting:
- **Shared hosting**: Chỉ HTML/CSS/JS (Option 1)
- **VPS/Cloud**: Hỗ trợ Node.js (Option 2)

### 2. Cấu hình domain:
```
Tên miền: yoursite.dataonline.vn
Hoặc: custom-domain.com
```

### 3. Cấu hình SSL:
- Bật HTTPS trong control panel
- Cập nhật URL trong api-config.js

## 📁 Bước 3: Upload file

### Cách 1: File Manager (Web interface)
1. Đăng nhập hosting control panel
2. Mở File Manager
3. Vào thư mục `public_html` hoặc `www`
4. Upload tất cả file frontend

### Cách 2: FTP/SFTP
```bash
# Thông tin FTP (lấy từ hosting)
Host: ftp.dataonline.vn
Username: your_username
Password: your_password
Port: 21 (FTP) hoặc 22 (SFTP)
```

### Cách 3: Git (nếu hỗ trợ)
```bash
git clone your-repo.git
# Hoặc upload qua Git integration
```

## ⚙️ Bước 4: Cấu hình URL

Sau khi upload, cập nhật BASE_URL trong `api-config.js`:

```javascript
// Thay đổi trong api-config.js
const BASE_URL = 'https://yoursite.dataonline.vn'; // URL hosting của bạn
```

## 🖼️ Bước 5: Xử lý upload ảnh

### Option A: Upload thủ công (đơn giản nhất)
1. Tạo thư mục `images/` trên hosting
2. Upload ảnh vào đó
3. Cập nhật đường dẫn trong code

### Option B: Dùng dịch vụ cloud (khuyến nghị)
1. **Cloudinary** (miễn phí 25GB):
   - Đăng ký tại cloudinary.com
   - Lấy API key
   - Tích hợp vào admin.js

2. **ImgBB** (miễn phí không giới hạn):
   - Đăng ký tại imgbb.com
   - Sử dụng API để upload

3. **Firebase Storage**:
   - Tạo project Firebase
   - Cấu hình Storage rules
   - Upload qua JavaScript

## 🔒 Bước 6: Bảo mật admin

### 1. Đổi mật khẩu mặc định:
Trong `admin.js`, tìm và đổi:
```javascript
const ADMIN_PASSWORD = 'admin123'; // Đổi thành mật khẩu mạnh
```

### 2. Ẩn trang admin:
- Đổi tên `admin.html` thành tên khác (vd: `manage_xyz123.html`)
- Hoặc đặt trong thư mục con có bảo vệ

### 3. Cấu hình .htaccess (nếu hosting hỗ trợ):
```apache
# Bảo vệ admin
<Files "admin.html">
    AuthType Basic
    AuthName "Admin Area"
    AuthUserFile /path/to/.htpasswd
    Require valid-user
</Files>
```

## 📧 Bước 7: Test và debug

### 1. Kiểm tra console:
- Mở F12 Developer Tools
- Xem tab Console có lỗi gì không
- Sửa đường dẫn file nếu cần

### 2. Test các tính năng:
- ✅ Trang chủ hiển thị đúng
- ✅ Gallery load được ảnh
- ✅ Admin đăng nhập được
- ✅ Upload ảnh hoạt động

### 3. Mobile-friendly:
- Test trên điện thoại
- Kiểm tra responsive design

## 🚀 Bước 8: Go Live!

1. **Thông báo**:
   - Share link với bạn bè: `https://yoursite.dataonline.vn`
   - Admin access: `https://yoursite.dataonline.vn/admin.html`

2. **Monitor**:
   - Theo dõi lượng truy cập
   - Backup định kỳ
   - Cập nhật khi có ảnh mới

## 💡 Tips cho dataonline.vn:

### Hosting thường của dataonline.vn:
- Hỗ trợ PHP, MySQL
- Có thể cần chuyển backend từ Node.js sang PHP
- Bandwidth và storage có giới hạn

### Nếu muốn dùng Node.js:
- Cần gói VPS hoặc Cloud của dataonline.vn
- Cài đặt Node.js environment
- Cấu hình PM2 để chạy liên tục

## 🆘 Troubleshooting:

### Lỗi thường gặp:
1. **404 Not Found**: Kiểm tra đường dẫn file
2. **CORS Error**: Cấu hình header cho API
3. **Upload fail**: Kiểm tra quyền thư mục
4. **SSL issues**: Bật HTTPS trong hosting

### Liên hệ support:
- Email: support@dataonline.vn
- Hotline: (028) 7300 6200
- Live chat trên website

---

## ✅ Checklist triển khai:

- [ ] Backup code hiện tại
- [ ] Upload file lên hosting  
- [ ] Cấu hình domain/subdomain
- [ ] Cập nhật BASE_URL
- [ ] Test các chức năng
- [ ] Cấu hình bảo mật
- [ ] Đổi mật khẩu admin
- [ ] Test trên mobile
- [ ] Share link với mọi người

🎉 **Chúc mừng! Dự án đã sẵn sàng online!**
