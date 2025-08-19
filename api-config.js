// 🌐 API Configuration for Hosting Version
// Tối ưu cho dataonline.vn hosting (không cần Node.js backend)

console.log("🌐 Loading API config for hosting version...");

// Configuration for hosting
const HOSTING_CONFIG = {
  // ImgBB API for image upload (miễn phí)
  IMGBB_API_KEY: "a9d67b722b0b6fef72a5392838ce78da", // Đăng ký tại imgbb.com
  IMGBB_UPLOAD_URL: "https://api.imgbb.com/1/upload",

  // Storage keys for localStorage
  STORAGE_KEYS: {
    PHOTOS: "graduation_photos",
    STATS: "graduation_stats",
    SETTINGS: "graduation_settings",
    ADMIN_PASSWORD: "admin_password",
  },

  // Default settings
  DEFAULT_PASSWORD: "123456", // Mật khẩu admin
  MAX_IMAGES: 50,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

// Photo API class for hosting version
class PhotoAPIHosting {
  constructor() {
    this.initializeStorage();
    console.log("📦 PhotoAPI Hosting initialized");
  }

  // Initialize localStorage if empty
  initializeStorage() {
    if (!localStorage.getItem(HOSTING_CONFIG.STORAGE_KEYS.PHOTOS)) {
      localStorage.setItem(
        HOSTING_CONFIG.STORAGE_KEYS.PHOTOS,
        JSON.stringify([])
      );
    }
    if (!localStorage.getItem(HOSTING_CONFIG.STORAGE_KEYS.STATS)) {
      localStorage.setItem(
        HOSTING_CONFIG.STORAGE_KEYS.STATS,
        JSON.stringify({
          totalViews: 0,
          lastUpdate: new Date().toISOString(),
        })
      );
    }
  }

  // Get all photos
  async getPhotos() {
    try {
      const photos = JSON.parse(
        localStorage.getItem(HOSTING_CONFIG.STORAGE_KEYS.PHOTOS) || "[]"
      );
      return {
        success: true,
        photos: photos,
        total: photos.length,
      };
    } catch (error) {
      console.error("Error getting photos:", error);
      return { success: false, photos: [], error: error.message };
    }
  }

  // Upload photo to ImgBB
  async uploadPhoto(file, caption = "", category = "ceremony") {
    try {
      if (file.size > HOSTING_CONFIG.MAX_FILE_SIZE) {
        throw new Error("File quá lớn! Tối đa 5MB");
      }

      // Check current photo count
      const currentPhotos = JSON.parse(
        localStorage.getItem(HOSTING_CONFIG.STORAGE_KEYS.PHOTOS) || "[]"
      );
      if (currentPhotos.length >= HOSTING_CONFIG.MAX_IMAGES) {
        throw new Error(`Tối đa ${HOSTING_CONFIG.MAX_IMAGES} ảnh!`);
      }

      // Upload to ImgBB
      const formData = new FormData();
      formData.append("key", HOSTING_CONFIG.IMGBB_API_KEY);
      formData.append("image", file);
      formData.append("name", `graduation_${Date.now()}`);

      const response = await fetch(HOSTING_CONFIG.IMGBB_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          "Upload failed: " + (result.error?.message || "Unknown error")
        );
      }

      // Save photo info to localStorage
      const photoData = {
        id: Date.now().toString(),
        src: result.data.url,
        thumb: result.data.thumb?.url || result.data.url,
        title: caption || `Ảnh tốt nghiệp ${currentPhotos.length + 1}`,
        caption: caption,
        category: category,
        uploadDate: new Date().toISOString(),
        size: file.size,
        deleteUrl: result.data.delete_url, // For future deletion
      };

      currentPhotos.push(photoData);
      localStorage.setItem(
        HOSTING_CONFIG.STORAGE_KEYS.PHOTOS,
        JSON.stringify(currentPhotos)
      );

      // Update stats
      this.updateStats();

      return {
        success: true,
        photo: photoData,
        message: "Upload thành công!",
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete photo
  async deletePhoto(photoId) {
    try {
      const photos = JSON.parse(
        localStorage.getItem(HOSTING_CONFIG.STORAGE_KEYS.PHOTOS) || "[]"
      );
      const updatedPhotos = photos.filter((photo) => photo.id !== photoId);

      localStorage.setItem(
        HOSTING_CONFIG.STORAGE_KEYS.PHOTOS,
        JSON.stringify(updatedPhotos)
      );
      this.updateStats();

      return {
        success: true,
        message: "Đã xóa ảnh!",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update statistics
  updateStats() {
    const stats = {
      totalViews: this.getStats().totalViews,
      lastUpdate: new Date().toISOString(),
      totalPhotos: JSON.parse(
        localStorage.getItem(HOSTING_CONFIG.STORAGE_KEYS.PHOTOS) || "[]"
      ).length,
    };
    localStorage.setItem(
      HOSTING_CONFIG.STORAGE_KEYS.STATS,
      JSON.stringify(stats)
    );
  }

  // Get statistics
  getStats() {
    return JSON.parse(
      localStorage.getItem(HOSTING_CONFIG.STORAGE_KEYS.STATS) || "{}"
    );
  }

  // Increment view count
  incrementViews() {
    const stats = this.getStats();
    stats.totalViews = (stats.totalViews || 0) + 1;
    localStorage.setItem(
      HOSTING_CONFIG.STORAGE_KEYS.STATS,
      JSON.stringify(stats)
    );
  }

  // Check health (always healthy for localStorage)
  async checkHealth() {
    return {
      success: true,
      status: "healthy",
      message: "Local storage ready",
      timestamp: new Date().toISOString(),
    };
  }

  // Get image URL (already full URL from ImgBB)
  getImageURL(src) {
    return src; // ImgBB returns full URLs
  }

  // Clear all data (admin function)
  clearAllData() {
    localStorage.removeItem(HOSTING_CONFIG.STORAGE_KEYS.PHOTOS);
    localStorage.removeItem(HOSTING_CONFIG.STORAGE_KEYS.STATS);
    this.initializeStorage();
    return { success: true, message: "Đã xóa tất cả dữ liệu!" };
  }

  // Export data for backup
  exportData() {
    return {
      photos: JSON.parse(
        localStorage.getItem(HOSTING_CONFIG.STORAGE_KEYS.PHOTOS) || "[]"
      ),
      stats: JSON.parse(
        localStorage.getItem(HOSTING_CONFIG.STORAGE_KEYS.STATS) || "{}"
      ),
      exportDate: new Date().toISOString(),
    };
  }

  // Import data from backup
  importData(data) {
    try {
      if (data.photos) {
        localStorage.setItem(
          HOSTING_CONFIG.STORAGE_KEYS.PHOTOS,
          JSON.stringify(data.photos)
        );
      }
      if (data.stats) {
        localStorage.setItem(
          HOSTING_CONFIG.STORAGE_KEYS.STATS,
          JSON.stringify(data.stats)
        );
      }
      return { success: true, message: "Import thành công!" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create global instance
window.photoAPI = new PhotoAPIHosting();
window.HOSTING_CONFIG = HOSTING_CONFIG;

// Increment views when page loads
document.addEventListener("DOMContentLoaded", () => {
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/"
  ) {
    window.photoAPI.incrementViews();
  }
});

console.log("✅ PhotoAPI Hosting ready!");

// Demo setup - create some sample photos if none exist
document.addEventListener("DOMContentLoaded", async () => {
  const photos = await window.photoAPI.getPhotos();
  if (photos.photos.length === 0) {
    console.log("📸 Setting up demo photos...");

    // Add some demo photos (you can remove this in production)
    const demoPhotos = [
      {
        id: "1",
        src: "https://via.placeholder.com/600x400/8B5CF6/ffffff?text=Graduation+Photo+1",
        thumb:
          "https://via.placeholder.com/300x200/8B5CF6/ffffff?text=Graduation+Photo+1",
        title: "Lễ tốt nghiệp 2025",
        caption: "Khoảnh khắc đáng nhớ nhất",
        category: "ceremony",
        uploadDate: new Date().toISOString(),
        size: 500000,
      },
      {
        id: "2",
        src: "https://via.placeholder.com/600x400/EC4899/ffffff?text=With+Friends",
        thumb:
          "https://via.placeholder.com/300x200/EC4899/ffffff?text=With+Friends",
        title: "Cùng bạn bè",
        caption: "Những người bạn thân yêu",
        category: "friends",
        uploadDate: new Date().toISOString(),
        size: 450000,
      },
    ];

    localStorage.setItem(
      HOSTING_CONFIG.STORAGE_KEYS.PHOTOS,
      JSON.stringify(demoPhotos)
    );
    window.photoAPI.updateStats();
    console.log("✅ Demo photos added!");
  }
});

// 🚨 QUAN TRỌNG:
// 1. Đăng ký ImgBB tại: https://imgbb.com/
// 2. Lấy API key và thay thế 'your_imgbb_api_key_here'
// 3. Đổi DEFAULT_PASSWORD thành mật khẩu mạnh
// 4. Test upload trước khi deploy
