// Gallery Page JavaScript - Simple Local Version

// Prevent multiple script loads
if (window.galleryScriptLoaded) {
    console.warn('🚫 Gallery script already loaded, preventing duplicate execution');
    throw new Error('Duplicate script load prevented');
} else {
    window.galleryScriptLoaded = true;
    console.log('✅ Gallery script loading...');
}

// Configuration
const STORAGE_KEY = 'graduation_photos';
const STATS_KEY = 'site_stats';

// Default photo data - from images folder
let photoData = [
    {
        id: 1,
        src: 'images/img-1.jpg',
        caption: 'Khoảnh khắc này là của mình – của bao nỗ lực không ai thấy',
        category: 'ceremony',
        date: '2024-01-15'
    },
    {
        id: 2,
        src: 'images/img-2.jpg', 
        caption: 'Chặng đường đại học kết thúc, nhưng hành trình mới bắt đầu 🚀',
        category: 'ceremony',
        date: '2024-01-15'
    },
    {
        id: 3,
        src: 'images/img-3.jpg',
        caption: 'Tự hào vì đã không bỏ cuộc – cảm ơn bản thân vì đã mạnh mẽ đến đây! ❤️', 
        category: 'friends',
        date: '2024-01-15'
    },
    {
        id: 4,
        src: 'images/img-4.jpg',
        caption: 'Niềm vui và hạnh phúc trong ngày đặc biệt',
        category: 'ceremony',
        date: '2024-01-15'
    },
    {
        id: 5,
        src: 'images/img-5.jpg',
        caption: 'Kỷ niệm đẹp cùng bạn bè',
        category: 'friends',
        date: '2024-01-15'
    },
    {
        id: 6,
        src: 'images/img-6.jpg',
        caption: 'Những khoảnh khắc đáng nhớ',
        category: 'family',
        date: '2024-01-15'
    },
    {
        id: 7,
        src: 'images/img-7.jpg',
        caption: 'Ngày tốt nghiệp đáng nhớ',
        category: 'ceremony',
        date: '2024-01-15'
    },
    {
        id: 8,
        src: 'images/img-8.jpg',
        caption: 'Cùng nhau chia sẻ niềm vui',
        category: 'friends',
        date: '2024-01-15'
    },
    {
        id: 9,
        src: 'images/img-9.jpg',
        caption: 'Kỷ niệm không thể quên',
        category: 'ceremony',
        date: '2024-01-15'
    },
    {
        id: 10,
        src: 'images/img-10.jpg',
        caption: 'Hạnh phúc tràn đầy',
        category: 'family',
        date: '2024-01-15'
    },
    {
        id: 11,
        src: 'images/img-11.jpg',
        caption: 'Thành quả xứng đáng',
        category: 'ceremony',
        date: '2024-01-15'
    },
    {
        id: 12,
        src: 'images/img-12.jpg',
        caption: 'Niềm tự hão của gia đình',
        category: 'family',
        date: '2024-01-15'
    },
    {
        id: 13,
        src: 'images/img-13.jpg',
        caption: 'Những ký ức đẹp nhất',
        category: 'ceremony',
        date: '2024-01-15'
    }
];

// Global variables
let currentImageIndex = 0;
let filteredImages = [];
let displayedImages = [];
let imagesPerLoad = 8;
let musicPlaying = false;

// DOM elements
const photoGrid = document.getElementById('photoGrid');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const captionText = document.getElementById('caption');
const imageCounter = document.getElementById('imageCounter');
const imageDate = document.getElementById('imageDate');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize the gallery
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing gallery...');
    
    // Prevent multiple initializations
    if (window.galleryInitialized) {
        console.log('📝 Gallery already initialized, skipping...');
        return;
    }
    window.galleryInitialized = true;
    
    // Show loading spinner
    if (loadingSpinner) {
        loadingSpinner.classList.remove('hidden');
        loadingSpinner.classList.add('flex');
    }
    
    try {
        await loadPhotoData();
        initializeGallery();
        initializeFilters();
        initializeMusic();
        initializeModal();
        loadImages(true); // Load all images initially
        updatePageViews();
    } catch (error) {
        console.error('Error initializing gallery:', error);
    } finally {
        // Hide loading spinner
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
            loadingSpinner.classList.remove('flex');
        }
    }
});

// Load photo data from backend first, fallback to localStorage
async function loadPhotoData() {
    console.log('📸 Loading photos for gallery...');
    
    // Try to get photos from backend first
    if (window.photoAPI) {
        try {
            const result = await window.photoAPI.getPhotos();
            if (result && result.success && result.photos && result.photos.length > 0) {
                photoData = result.photos.map(photo => ({
                    ...photo,
                    src: photo.src.startsWith('http') ? photo.src : window.photoAPI.getImageURL(photo.src)
                }));
                console.log(`📸 Loaded ${photoData.length} photos from backend`);
                filteredImages = [...photoData];
                return;
            }
        } catch (error) {
            console.warn('Backend error:', error.message);
        }
    } else {
        console.log('📱 PhotoAPI not available, checking localStorage');
    }
    
    // Try localStorage next
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const storedPhotos = JSON.parse(stored);
        if (storedPhotos.length > 0) {
            photoData = storedPhotos;
            console.log(`📱 Loaded ${photoData.length} photos from localStorage`);
            filteredImages = [...photoData];
            return;
        }
    }
    
    // Fallback to default photos if both backend and localStorage are empty
    console.log('📝 No photos found, using default photos');
    // photoData is already initialized with default values above
    console.log(`📸 Using ${photoData.length} default photos`);
    filteredImages = [...photoData];
}

// Initialize gallery functionality
function initializeGallery() {
    filteredImages = [...photoData];
}

// Update page views
function updatePageViews() {
    const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{"views": 0}');
    stats.views = (stats.views || 0) + 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

// Initialize gallery functionality
function initializeGallery() {
    // Load more button event
    loadMoreBtn.addEventListener('click', loadMoreImages);
    
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
                observer.unobserve(img);
            }
        });
    });

    // Apply observer to images as they load
    window.observeImage = observer;
}

// Initialize filter functionality
function initializeFilters() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            filterBtns.forEach(b => {
                b.classList.remove('active', 'bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-white');
                b.classList.add('bg-white/80', 'text-gray-700');
            });
            
            this.classList.add('active', 'bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-white');
            this.classList.remove('bg-white/80', 'text-gray-700');
            
            // Filter images
            const filter = this.dataset.filter;
            filterImages(filter);
        });
    });
}

// Filter images by category
function filterImages(category) {
    showLoading();
    
    setTimeout(() => {
        if (category === 'all') {
            filteredImages = [...photoData];
        } else {
            filteredImages = photoData.filter(img => img.category === category);
        }
        
        displayedImages = [];
        photoGrid.innerHTML = '';
        loadImages(true); // Load all filtered images
        hideLoading();
    }, 300);
}

// Load initial images
function loadImages(loadAll = false) {
    const startIndex = displayedImages.length;
    let endIndex;
    
    if (loadAll) {
        // Load all images at once
        endIndex = filteredImages.length;
    } else {
        // Load in batches
        endIndex = Math.min(startIndex + imagesPerLoad, filteredImages.length);
    }
    
    const imagesToLoad = filteredImages.slice(startIndex, endIndex);
    
    imagesToLoad.forEach((imageData, index) => {
        createImageElement(imageData, startIndex + index);
    });
    
    displayedImages.push(...imagesToLoad);
    
    // Update load more button
    if (displayedImages.length >= filteredImages.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// Load more images
function loadMoreImages() {
    showLoading();
    
    setTimeout(() => {
        loadImages();
        hideLoading();
    }, 500);
}

// Create image element
function createImageElement(imageData, index) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 cursor-pointer bg-white opacity-0 animate-fadeInUp';
    imageDiv.style.animationDelay = `${(index % imagesPerLoad) * 0.1}s`;
    imageDiv.dataset.index = index;
    imageDiv.dataset.caption = imageData.caption;
    imageDiv.dataset.date = imageData.date;
    
    imageDiv.innerHTML = `
        <div class="aspect-w-4 aspect-h-5 bg-gradient-to-br from-pink-100 to-purple-100">
            <img data-src="${imageData.src}" 
                 alt="${imageData.caption}" 
                 class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 opacity-0 transition-opacity"
                 loading="lazy">
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute bottom-0 left-0 right-0 p-4">
                <p class="text-white text-sm font-medium line-clamp-2">${imageData.caption}</p>
                <p class="text-white/75 text-xs mt-1">${formatDate(imageData.date)}</p>
            </div>
        </div>
        <div class="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
        </div>
    `;
    
    // Add click event
    imageDiv.addEventListener('click', () => openModal(index));
    
    // Add to grid
    photoGrid.appendChild(imageDiv);
    
    // Observe image for lazy loading
    const img = imageDiv.querySelector('img');
    window.observeImage.observe(img);
    
    // Show element
    setTimeout(() => {
        imageDiv.classList.remove('opacity-0');
        imageDiv.classList.add('opacity-100');
    }, 50);
}

// Initialize modal functionality
function initializeModal() {
    // Close modal events
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Navigation events
    document.getElementById('prevBtn').addEventListener('click', showPrevImage);
    document.getElementById('nextBtn').addEventListener('click', showNextImage);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
}

// Modal functions
function openModal(index) {
    currentImageIndex = index;
    showImage(index);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    
    // Update counter
    updateImageInfo(index);
}

function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

function showImage(index) {
    const imageData = displayedImages[index];
    if (imageData) {
        modalImg.src = imageData.src;
        modalImg.alt = imageData.caption;
        captionText.querySelector('p').textContent = imageData.caption;
        
        // Update image info
        updateImageInfo(index);
        
        // Preload adjacent images
        preloadAdjacentImages(index);
    }
}

function updateImageInfo(index) {
    imageCounter.textContent = `${index + 1} / ${displayedImages.length}`;
    imageDate.textContent = formatDate(displayedImages[index].date);
}

function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + displayedImages.length) % displayedImages.length;
    showImage(currentImageIndex);
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % displayedImages.length;
    showImage(currentImageIndex);
}

// Handle keyboard navigation
function handleKeyPress(e) {
    if (!modal.classList.contains('hidden')) {
        switch(e.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    }
}

// Preload adjacent images
function preloadAdjacentImages(currentIndex) {
    const prevIndex = (currentIndex - 1 + displayedImages.length) % displayedImages.length;
    const nextIndex = (currentIndex + 1) % displayedImages.length;
    
    [prevIndex, nextIndex].forEach(index => {
        if (displayedImages[index]) {
            const img = new Image();
            img.src = displayedImages[index].src;
        }
    });
}

// Music functionality
function initializeMusic() {
    if (backgroundMusic) {
        // Auto-play music on user interaction
        document.addEventListener('click', () => {
            if (!musicPlaying) {
                playMusic();
            }
        }, { once: true });
    }
}

function toggleMusic() {
    if (musicPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    if (backgroundMusic) {
        backgroundMusic.play().then(() => {
            musicPlaying = true;
            musicToggle.innerHTML = '<span class="text-lg">🔊</span>';
            musicToggle.classList.add('animate-pulse-slow');
        }).catch((error) => {
            console.log('Music autoplay prevented:', error);
        });
    }
}

function pauseMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        musicPlaying = false;
        musicToggle.innerHTML = '<span class="text-lg">🔇</span>';
        musicToggle.classList.remove('animate-pulse-slow');
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showLoading() {
    loadingSpinner.classList.remove('hidden');
    loadingSpinner.classList.add('flex');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    loadingSpinner.classList.remove('flex');
}

// Search functionality (bonus feature)
function initializeSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Tìm kiếm ảnh...';
    searchInput.className = 'w-full max-w-md mx-auto px-4 py-2 rounded-full border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500';
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm === '') {
            filteredImages = [...photoData];
        } else {
            filteredImages = photoData.filter(img => 
                img.caption.toLowerCase().includes(searchTerm)
            );
        }
        
        displayedImages = [];
        photoGrid.innerHTML = '';
        loadImages();
    });
    
    // Add search input to the page
    const header = document.querySelector('main .container > div:first-child');
    const searchContainer = document.createElement('div');
    searchContainer.className = 'mt-6';
    searchContainer.appendChild(searchInput);
    header.appendChild(searchContainer);
}

// Initialize search (uncomment to enable)
// initializeSearch();

// Error handling for images
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkjDrG5oIGtow7RuZyB0w6xuIHRoYXlcL3RleHQ+PC9zdmc+';
        e.target.alt = 'Hình không tìm thấy';
    }
}, true);
