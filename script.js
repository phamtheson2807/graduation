// Graduation Photo Gallery JavaScript - Backend Version

// Prevent page reload loops
if (window.scriptLoaded) {
  console.warn("🚫 Script already loaded, preventing duplicate execution");
  // Don't execute the rest of the script
} else {
  window.scriptLoaded = true;
  console.log("✅ Main script loading...");
}

// Global variables
let currentImageIndex = 0;
let images = [];
let isLoading = false; // Prevent multiple simultaneous loads
let initializationComplete = false; // Prevent multiple initializations

// Load photo data from backend first, fallback to localStorage
async function loadPhotoData() {
  if (isLoading) {
    console.log("📸 Load already in progress, skipping...");
    return;
  }

  isLoading = true;
  console.log("📸 Loading photos from backend...");

  try {
    showLoading();

    // Try to get photos from backend first
    if (window.photoAPI) {
      try {
        const result = await window.photoAPI.getPhotos();
        if (
          result &&
          result.success &&
          result.photos &&
          result.photos.length > 0
        ) {
          images = result.photos.map((photo) => ({
            ...photo,
            src: photo.src.startsWith("http")
              ? photo.src
              : window.photoAPI.getImageURL(photo.src),
          }));
          console.log(`✅ Loaded ${images.length} photos from backend`);
          displayPhotos(images);
          return;
        }
      } catch (backendError) {
        console.warn("Backend not available:", backendError.message);
      }
    }

    // Try localStorage next
    try {
      const stored = localStorage.getItem("graduation_photos");
      if (stored) {
        const storedPhotos = JSON.parse(stored);
        if (storedPhotos && storedPhotos.length > 0) {
          images = storedPhotos;
          console.log(`📱 Loaded ${images.length} photos from localStorage`);
          displayPhotos(images);
          return;
        }
      }
    } catch (storageError) {
      console.warn("localStorage error:", storageError.message);
    }

    // Fallback to default photos if both backend and localStorage are empty
    console.log("📝 No photos found, using default photos");
    images = photoData || [];
    console.log(`✅ Loaded ${images.length} default photos`);

    if (images.length > 0) {
      displayPhotos(images);
    } else {
      showNoPhotos();
    }
  } catch (error) {
    console.error("❌ Error loading photos:", error);
    showNoPhotos();
  } finally {
    isLoading = false;
    hideLoading();
  }
}

// Photo data - list of images in the images folder
const photoData = [
  {
    src: "images/img-1.jpg",
    caption: "Khoảnh khắc này là của mình – của bao nỗ lực không ai thấy",
    category: "ceremony",
  },
  {
    src: "images/img-2.jpg",
    caption: "Chặng đường đại học kết thúc, nhưng hành trình mới bắt đầu 🚀",
    category: "ceremony",
  },
  {
    src: "images/img-3.jpg",
    caption:
      "Tự hào vì đã không bỏ cuộc – cảm ơn bản thân vì đã mạnh mẽ đến đây! ❤️",
    category: "friends",
  },
  {
    src: "images/img-4.jpg",
    caption: "Niềm vui và hạnh phúc trong ngày đặc biệt",
    category: "ceremony",
  },
  {
    src: "images/img-5.jpg",
    caption: "Kỷ niệm đẹp cùng bạn bè",
    category: "friends",
  },
  {
    src: "images/img-6.jpg",
    caption: "Những khoảnh khắc đáng nhớ",
    category: "family",
  },
  {
    src: "images/img-7.jpg",
    caption: "Ngày tốt nghiệp đáng nhớ",
    category: "ceremony",
  },
  {
    src: "images/img-8.jpg",
    caption: "Cùng nhau chia sẻ niềm vui",
    category: "friends",
  },
  {
    src: "images/img-9.jpg",
    caption: "Kỷ niệm không thể quên",
    category: "ceremony",
  },
  {
    src: "images/img-10.jpg",
    caption: "Hạnh phúc tràn đầy",
    category: "family",
  },
  {
    src: "images/img-11.jpg",
    caption: "Thành quả xứng đáng",
    category: "ceremony",
  },
  {
    src: "images/img-12.jpg",
    caption: "Niềm tự hão của gia đình",
    category: "family",
  },
  {
    src: "images/img-13.jpg",
    caption: "Những ký ức đẹp nhất",
    category: "ceremony",
  },
];

// DOM elements
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const captionText = document.getElementById("caption");
const backgroundMusic = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Prevent multiple initializations
  if (initializationComplete) {
    console.warn("🚫 Already initialized, skipping...");
    return;
  }

  console.log("🔥 DOM loaded, initializing simple gallery...");

  try {
    checkViewMode();
    loadPhotoData();
    initializeGallery();
    initializeMusic();
    initializeAnimations();
    initializeImageLazyLoading();

    initializationComplete = true;
    console.log("✅ Initialization completed successfully");
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    // Don't mark as complete if failed, allow retry
  }
});

// Check if page is in view-only mode
function checkViewMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const viewMode = urlParams.get("view");

  if (viewMode === "shared") {
    // Hide admin link in shared mode
    const adminLink = document.querySelector('a[href="admin.html"]');
    if (adminLink) {
      adminLink.style.display = "none";
    }

    // Add watermark for shared view
    addSharedWatermark();
  }
}

// Add watermark for shared views
function addSharedWatermark() {
  const watermark = document.createElement("div");
  watermark.className =
    "fixed bottom-4 left-4 bg-black/20 text-white text-xs px-2 py-1 rounded z-30 pointer-events-none";
  watermark.textContent = "🔗 Chia sẻ từ album tốt nghiệp";
  document.body.appendChild(watermark);
}

// Load photo data from local array (DEPRECATED - use backend version above)
async function loadPhotoDataLocal() {
  console.log("📱 Loading photos from local data...");
  try {
    showLoading();

    // Use the local photoData array
    images = photoData;
    console.log(`✅ Loaded ${images.length} photos from local data`);

    displayPhotos(images);
  } catch (error) {
    console.error("❌ Error loading photos:", error);
    showNoPhotos();
  } finally {
    hideLoading();
  }
}

// Display photos in gallery
function displayPhotos(photos) {
  const galleryGrid = document.querySelector(
    ".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3"
  );
  if (!galleryGrid) return;

  // Clear existing photos
  galleryGrid.innerHTML = "";

  // Add new photos (limit to 6 for preview)
  photos.forEach((photo, index) => {
    const photoElement = createPhotoElement(photo, index);
    galleryGrid.appendChild(photoElement);
  });

  // If no photos, show message
  if (photos.length === 0) {
    galleryGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-4xl mb-4">📷</div>
                <p class="text-gray-600 mb-4">Chưa có ảnh nào được upload.</p>
                <p class="text-gray-500 text-sm">Vào trang Admin để thêm ảnh đầu tiên!</p>
            </div>
        `;
  }
}

// Create photo element
function createPhotoElement(photo, index) {
  const div = document.createElement("div");
  div.className =
    "group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 cursor-pointer bg-white";
  div.setAttribute("data-caption", photo.caption);
  div.setAttribute("data-index", index);

  div.innerHTML = `
        <div class="aspect-w-4 aspect-h-5 bg-gradient-to-br from-pink-100 to-purple-100">
            <img src="${photo.src}" 
                 alt="${photo.caption || "Ảnh tốt nghiệp"}" 
                 class="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500" 
                 loading="lazy">
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute bottom-0 left-0 right-0 p-6">
                <p class="text-white text-sm font-medium">${photo.caption}</p>
            </div>
        </div>
    `;

  // Add click event
  div.addEventListener("click", () => openModal(index));

  return div;
}

// Show no photos message
function showNoPhotos() {
  const galleryGrid = document.querySelector(
    ".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3"
  );
  if (!galleryGrid) return;

  galleryGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="text-4xl mb-4">📷</div>
            <p class="text-gray-600 mb-4">Chưa có ảnh nào được upload.</p>
            <p class="text-gray-500 text-sm">Vào trang Admin để thêm ảnh đầu tiên!</p>
        </div>
    `;
}

// Simple placeholder for updatePageViews (no longer needed)
function updatePageViews() {
  // No longer needed for local storage
}

// Show loading spinner
function showLoading() {
  const galleryGrid = document.querySelector(
    ".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3"
  );
  if (!galleryGrid) return;

  galleryGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600">Đang tải ảnh...</p>
        </div>
    `;
}

// Hide loading (handled by updateGalleryPreview)
function hideLoading() {
  // Loading is hidden when updateGalleryPreview is called
}

// Initialize gallery functionality
function initializeGallery() {
  const photoItems = document.querySelectorAll("[data-caption]");
  // Chỉ add event click cho từng item, không push vào images nữa
  photoItems.forEach((item, index) => {
    item.addEventListener("click", () => openModal(index));
  });

  // Modal navigation events
  document.getElementById("prevBtn").addEventListener("click", showPrevImage);
  document.getElementById("nextBtn").addEventListener("click", showNextImage);

  // Close modal events
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Keyboard navigation
  document.addEventListener("keydown", handleKeyPress);
}

// Initialize music functionality
function initializeMusic() {
  if (backgroundMusic) {
    // Auto-play music on user interaction
    document.addEventListener(
      "click",
      () => {
        if (!musicPlaying) {
          playMusic();
        }
      },
      { once: true }
    );
  }
}

// Music control functions
function toggleMusic() {
  if (musicPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

function playMusic() {
  if (backgroundMusic) {
    backgroundMusic
      .play()
      .then(() => {
        musicPlaying = true;
        musicToggle.innerHTML = "🔊";
        musicToggle.classList.add("animate-pulse-slow");
        showNotification("🎵 Nhạc đang phát");
      })
      .catch((error) => {
        console.log("Music autoplay prevented:", error);
        showNotification("🔇 Click để phát nhạc");
      });
  }
}

function pauseMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
    musicPlaying = false;
    musicToggle.innerHTML = "🔇";
    musicToggle.classList.remove("animate-pulse-slow");
    showNotification("🔇 Nhạc đã tạm dừng");
  }
}

// Modal functions
function openModal(index) {
  currentImageIndex = index;
  showImage(index);
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";

  // Add entrance animation
  setTimeout(() => {
    modalImg.style.transform = "scale(1)";
    modalImg.style.opacity = "1";
  }, 50);
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "auto";
  modalImg.style.transform = "scale(0.8)";
  modalImg.style.opacity = "0";
}

function showImage(index) {
  if (images[index]) {
    modalImg.src = images[index].src;
    modalImg.alt = images[index].alt;
    captionText.querySelector("p").textContent = images[index].caption;

    // Add loading effect
    modalImg.style.opacity = "0.5";
    modalImg.onload = () => {
      modalImg.style.opacity = "1";
    };
  }
}

function showPrevImage() {
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  showImage(currentImageIndex);
  addImageTransition("slide-left");
}

function showNextImage() {
  currentImageIndex = (currentImageIndex + 1) % images.length;
  showImage(currentImageIndex);
  addImageTransition("slide-right");
}

// Handle keyboard navigation
function handleKeyPress(e) {
  if (!modal.classList.contains("hidden")) {
    switch (e.key) {
      case "Escape":
        closeModal();
        break;
      case "ArrowLeft":
        showPrevImage();
        break;
      case "ArrowRight":
        showNextImage();
        break;
    }
  }
}

// Add image transition effects
function addImageTransition(direction) {
  modalImg.style.transform =
    direction === "slide-left" ? "translateX(-20px)" : "translateX(20px)";
  modalImg.style.opacity = "0.7";

  setTimeout(() => {
    modalImg.style.transform = "translateX(0)";
    modalImg.style.opacity = "1";
  }, 150);
}

// Initialize animations
function initializeAnimations() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = "fadeInUp 0.6s ease-out forwards";
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll(".group, .bg-white\\/80").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    observer.observe(el);
  });

  // Add random floating animation delays
  document.querySelectorAll(".animate-float").forEach((el, index) => {
    el.style.animationDelay = `${index * 0.5}s`;
  });
}

// Lazy loading for images
function initializeImageLazyLoading() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;

        // Add loading class
        img.classList.add("photo-loading");

        // Load the image
        const tempImg = new Image();
        tempImg.onload = () => {
          img.src = tempImg.src;
          img.classList.remove("photo-loading");
          img.style.transition = "opacity 0.3s";
          img.style.opacity = "1";
        };
        tempImg.src = img.dataset.src || img.src;

        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    img.style.opacity = "0";
    imageObserver.observe(img);
  });
}

// Utility functions
function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className =
    "fixed top-20 right-6 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300";
  notification.textContent = message;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Hide notification
  setTimeout(() => {
    notification.style.transform = "translateX(full)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add confetti effect (Easter egg)
function createConfetti() {
  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#ffeaa7",
    "#dda0dd",
  ];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 3 + "s";
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s";

    document.body.appendChild(confetti);

    // Remove confetti after animation
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 5000);
  }
}

// Secret confetti trigger (click title 5 times)
let titleClickCount = 0;
document.querySelector("h1").addEventListener("click", () => {
  titleClickCount++;
  if (titleClickCount === 5) {
    createConfetti();
    showNotification("🎉 Chúc mừng bạn đã tìm ra Easter Egg!");
    titleClickCount = 0;
  }
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Performance optimization - preload next/prev images in modal
function preloadAdjacentImages(currentIndex) {
  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  const nextIndex = (currentIndex + 1) % images.length;

  [prevIndex, nextIndex].forEach((index) => {
    if (images[index]) {
      const img = new Image();
      img.src = images[index].src;
    }
  });
}

// Loading functions
function showLoading() {
  const loadingElement = document.getElementById("gallery-loading");
  if (loadingElement) {
    loadingElement.style.display = "block";
  }
}

function hideLoading() {
  const loadingElement = document.getElementById("gallery-loading");
  if (loadingElement) {
    loadingElement.style.display = "none";
  }
}

// Error handling for images
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", function () {
    this.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkjDrG5oIGtow7RuZyB0w6xuIHThqWF5PC90ZXh0Pjwvc3ZnPg==";
    this.alt = "Hình không tìm thấy";
  });
});
