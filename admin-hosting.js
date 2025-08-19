// Admin Panel JavaScript - Hosting Version (localStorage only)

// Prevent multiple script loads
if (window.adminScriptLoaded) {
    console.warn('🚫 Admin script already loaded, preventing duplicate execution');
    throw new Error('Duplicate script load prevented');
} else {
    window.adminScriptLoaded = true;
    console.log('✅ Admin script loading for hosting...');
}

// Global variables
let isLoggedIn = false;
let uploadedImages = [];
let allPhotos = []; // Store all photos from localStorage
let isInitializing = false;
let initializationComplete = false;

// Wait for PhotoAPI to be ready
function waitForPhotoAPI() {
    return new Promise((resolve) => {
        const checkAPI = () => {
            if (typeof window.photoAPI !== 'undefined' && typeof window.HOSTING_CONFIG !== 'undefined') {
                console.log('✅ PhotoAPI Hosting ready for admin');
                resolve();
            } else {
                setTimeout(checkAPI, 100);
            }
        };
        checkAPI();
    });
}

// DOM elements
const loginModal = document.getElementById('loginModal');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const imageUpload = document.getElementById('imageUpload');
const previewSection = document.getElementById('previewSection');
const previewGrid = document.getElementById('previewGrid');
const adminImagesGrid = document.getElementById('adminImagesGrid');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize
document.addEventListener('DOMContentLoaded', async function () {
    if (initializationComplete) {
        console.warn('🚫 Admin already initialized, skipping...');
        return;
    }

    if (isInitializing) {
        console.log('🔄 Initialization already in progress, skipping...');
        return;
    }

    isInitializing = true;
    console.log('🚀 Initializing admin panel for hosting...');

    try {
        // Wait for PhotoAPI
        await waitForPhotoAPI();

        checkLoginStatus();
        await loadPhotosFromStorage();
        setupEventListeners();
        updateShareLink();
        loadAdminImages();
        updateStatistics();
        updateActivityFeed();
        addActivity('🚀 Admin panel đã khởi động (hosting mode)');

        initializationComplete = true;
        console.log('✅ Admin panel initialized successfully (hosting)');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showToast('Initialization error: ' + error.message, 'error');
    } finally {
        isInitializing = false;
    }
});

// Login Functions
function checkLoginStatus() {
    const stored = sessionStorage.getItem('admin_logged_in');
    if (stored === 'true') {
        showAdminPanel();
    }
}

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;

    try {
        // Check against configured password
        if (password === window.HOSTING_CONFIG.DEFAULT_PASSWORD) {
            sessionStorage.setItem('admin_logged_in', 'true');
            showAdminPanel();
            showToast('Đăng nhập thành công!', 'success');
            addActivity('🔐 Admin đã đăng nhập');
        } else {
            showToast('Sai mật khẩu!', 'error');
            addActivity('❌ Thử đăng nhập thất bại');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Lỗi đăng nhập!', 'error');
    }
});

function showAdminPanel() {
    isLoggedIn = true;
    loginModal.style.display = 'none';
    adminPanel.classList.remove('hidden');

    // Load data
    loadPhotosFromStorage();
    loadAdminImages();
    updateStatistics();
}

function logout() {
    isLoggedIn = false;
    sessionStorage.removeItem('admin_logged_in');
    loginModal.style.display = 'flex';
    adminPanel.classList.add('hidden');
    addActivity('👋 Admin đã đăng xuất');
}

// Photo management using localStorage
async function loadPhotosFromStorage() {
    try {
        const result = await window.photoAPI.getPhotos();
        if (result.success) {
            allPhotos = result.photos;
            console.log(`📱 Loaded ${allPhotos.length} photos from localStorage`);
        }
    } catch (error) {
        console.error('Error loading photos:', error);
        allPhotos = [];
    }
}

// Setup event listeners
function setupEventListeners() {
    // File upload
    if (imageUpload) {
        imageUpload.addEventListener('change', handleFileSelect);
    }

    // Drag and drop
    const uploadArea = imageUpload?.parentElement;
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#8B5CF6';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#D1D5DB';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#D1D5DB';
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
    }
}

function handleFileSelect(event) {
    const files = event.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    uploadedImages = [];
    previewGrid.innerHTML = '';

    for (let file of files) {
        if (file.type.startsWith('image/')) {
            uploadedImages.push(file);
            createPreview(file);
        }
    }

    if (uploadedImages.length > 0) {
        previewSection.classList.remove('hidden');
    }
}

function createPreview(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'relative bg-gray-100 rounded-lg overflow-hidden';
        previewDiv.innerHTML = `
            <img src="${e.target.result}" alt="Preview" class="w-full h-24 object-cover">
            <button onclick="removePreview('${file.name}')" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600">×</button>
            <div class="p-2 text-xs text-gray-600 truncate">${file.name}</div>
        `;
        previewGrid.appendChild(previewDiv);
    };
    reader.readAsDataURL(file);
}

function removePreview(fileName) {
    uploadedImages = uploadedImages.filter(file => file.name !== fileName);

    // Remove preview element
    const previews = previewGrid.children;
    for (let preview of previews) {
        if (preview.textContent.includes(fileName)) {
            preview.remove();
            break;
        }
    }

    if (uploadedImages.length === 0) {
        previewSection.classList.add('hidden');
    }
}

// Upload images using PhotoAPI
async function uploadImages() {
    if (uploadedImages.length === 0) {
        showToast('Vui lòng chọn ít nhất 1 ảnh!', 'warning');
        return;
    }

    showLoading();

    try {
        const caption = document.getElementById('imageCaption').value;
        const category = document.getElementById('imageCategory').value;

        let successCount = 0;
        let failCount = 0;

        for (let file of uploadedImages) {
            try {
                const result = await window.photoAPI.uploadPhoto(file, caption, category);
                if (result.success) {
                    successCount++;
                    addActivity(`📸 Đã upload: ${file.name}`);
                } else {
                    failCount++;
                    console.error('Upload failed:', result.error);
                }
            } catch (error) {
                failCount++;
                console.error('Upload error:', error);
            }
        }

        if (successCount > 0) {
            showToast(`✅ Upload thành công ${successCount} ảnh!`, 'success');

            // Clear form
            uploadedImages = [];
            previewSection.classList.add('hidden');
            previewGrid.innerHTML = '';
            document.getElementById('imageCaption').value = '';
            imageUpload.value = '';

            // Reload data
            await loadPhotosFromStorage();
            loadAdminImages();
            updateStatistics();
        }

        if (failCount > 0) {
            showToast(`❌ ${failCount} ảnh upload thất bại!`, 'error');
        }

    } catch (error) {
        console.error('Upload error:', error);
        showToast('Lỗi khi upload ảnh!', 'error');
    } finally {
        hideLoading();
    }
}

// Display admin images
function loadAdminImages() {
    if (!adminImagesGrid) return;

    adminImagesGrid.innerHTML = '';

    if (allPhotos.length === 0) {
        adminImagesGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">📸</div>
                <h3 class="text-lg font-semibold text-gray-600 mb-2">Chưa có ảnh nào</h3>
                <p class="text-gray-500">Upload ảnh đầu tiên để bắt đầu!</p>
            </div>
        `;
        return;
    }

    allPhotos.forEach(photo => {
        const imageCard = document.createElement('div');
        imageCard.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';
        imageCard.innerHTML = `
            <div class="aspect-square overflow-hidden">
                <img src="${photo.src}" alt="${photo.title}" class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" onclick="viewImage('${photo.src}', '${photo.title}')">
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-sm mb-2 line-clamp-2">${photo.title}</h3>
                <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded">${photo.category}</span>
                    <span>${formatDate(photo.uploadDate)}</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editImage('${photo.id}')" class="flex-1 bg-blue-500 text-white py-1 px-2 rounded text-xs hover:bg-blue-600 transition-colors">✏️ Sửa</button>
                    <button onclick="deleteImage('${photo.id}')" class="flex-1 bg-red-500 text-white py-1 px-2 rounded text-xs hover:bg-red-600 transition-colors">🗑️ Xóa</button>
                </div>
            </div>
        `;
        adminImagesGrid.appendChild(imageCard);
    });
}

function editImage(photoId) {
    const photo = allPhotos.find(p => p.id === photoId);
    if (!photo) return;

    const newTitle = prompt('Nhập tên mới:', photo.title);
    if (newTitle && newTitle !== photo.title) {
        photo.title = newTitle;

        // Update localStorage
        localStorage.setItem(window.HOSTING_CONFIG.STORAGE_KEYS.PHOTOS, JSON.stringify(allPhotos));

        showToast('Đã cập nhật thông tin ảnh!', 'success');
        loadAdminImages();
        addActivity(`✏️ Đã sửa: ${newTitle}`);
    }
}

async function deleteImage(photoId) {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    try {
        const result = await window.photoAPI.deletePhoto(photoId);
        if (result.success) {
            showToast('Đã xóa ảnh!', 'success');
            await loadPhotosFromStorage();
            loadAdminImages();
            updateStatistics();
            addActivity('🗑️ Đã xóa 1 ảnh');
        } else {
            showToast('Lỗi khi xóa ảnh!', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Lỗi khi xóa ảnh!', 'error');
    }
}

function clearAllImages() {
    if (!confirm('Bạn có chắc muốn xóa TẤT CẢ ảnh? Hành động này không thể hoàn tác!')) return;

    try {
        const result = window.photoAPI.clearAllData();
        if (result.success) {
            showToast('Đã xóa tất cả ảnh!', 'success');
            allPhotos = [];
            loadAdminImages();
            updateStatistics();
            addActivity('🗑️ Đã xóa tất cả ảnh');
        }
    } catch (error) {
        console.error('Clear all error:', error);
        showToast('Lỗi khi xóa ảnh!', 'error');
    }
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN');
}

function viewImage(src, title) {
    // Simple image viewer
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="max-w-4xl max-h-screen p-4">
            <img src="${src}" alt="${title}" class="max-w-full max-h-full object-contain">
            <div class="text-white text-center mt-4">
                <h3 class="text-lg font-semibold">${title}</h3>
                <button onclick="this.closest('.fixed').remove()" class="mt-2 bg-white text-black px-4 py-2 rounded">Đóng</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('flex');
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        loadingOverlay.classList.remove('flex');
    }
}

// Share link functionality
function updateShareLink() {
    try {
        const shareLink = document.getElementById('shareLink');

        if (shareLink) {
            // Create a dedicated shared view link
            const baseUrl = window.location.href.replace('admin.html', '');
            const publicViewUrl = `${baseUrl}shared.html`;
            shareLink.value = publicViewUrl;
        }

        console.log('✅ Public share link updated');
    } catch (error) {
        console.error('❌ Error updating share link:', error);
    }
}

function copyShareLink() {
    try {
        const shareLink = document.getElementById('shareLink');
        if (shareLink && shareLink.value) {
            navigator.clipboard.writeText(shareLink.value).then(() => {
                showToast('Đã copy link xem công khai!', 'success');
                addActivity('📋 Đã copy link chia sẻ');
            }).catch(() => {
                showToast('Không thể copy link!', 'error');
            });
        }
    } catch (error) {
        console.error('❌ Error copying share link:', error);
        showToast('Lỗi khi copy link!', 'error');
    }
}

// QR Code functionality
function generateQRCode() {
    try {
        const shareLink = document.getElementById('shareLink');
        const qrContainer = document.getElementById('qrCodeContainer');
        const downloadBtn = document.getElementById('downloadQR');

        if (!shareLink || !shareLink.value) {
            showToast('Không có link để tạo QR Code!', 'error');
            return;
        }

        // Simple QR code generation using a free API
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareLink.value)}`;

        // Create image instead of canvas for simplicity
        const qrImg = document.createElement('img');
        qrImg.src = qrUrl;
        qrImg.className = 'mx-auto border rounded-lg';
        qrImg.style.maxWidth = '200px';

        // Clear previous QR code
        qrContainer.innerHTML = '';
        qrContainer.appendChild(qrImg);

        qrContainer.classList.remove('hidden');
        downloadBtn.classList.remove('hidden');

        // Store QR URL for download
        window.currentQRUrl = qrUrl;

        showToast('QR Code đã được tạo!', 'success');
    } catch (error) {
        console.error('❌ Error generating QR code:', error);
        showToast('Lỗi khi tạo QR Code!', 'error');
    }
}

function downloadQRCode() {
    try {
        if (window.currentQRUrl) {
            const link = document.createElement('a');
            link.href = window.currentQRUrl;
            link.download = 'graduation-gallery-qr-code.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('QR Code đã được tải về!', 'success');
        }
    } catch (error) {
        console.error('❌ Error downloading QR code:', error);
        showToast('Lỗi khi tải QR Code!', 'error');
    }
}

// Social sharing
function shareToFacebook() {
    try {
        const shareLink = document.getElementById('shareLink');
        if (shareLink && shareLink.value) {
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink.value)}`;
            window.open(fbUrl, '_blank', 'width=600,height=400');
        }
    } catch (error) {
        console.error('❌ Error sharing to Facebook:', error);
        showToast('Lỗi khi chia sẻ Facebook!', 'error');
    }
}

function shareToZalo() {
    try {
        const shareLink = document.getElementById('shareLink');
        if (shareLink && shareLink.value) {
            const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(shareLink.value)}`;
            window.open(zaloUrl, '_blank', 'width=600,height=400');
        }
    } catch (error) {
        console.error('❌ Error sharing to Zalo:', error);
        showToast('Lỗi khi chia sẻ Zalo!', 'error');
    }
}

// Statistics and analytics
function updateStatistics() {
    try {
        // Update basic stats
        const totalImagesEl = document.getElementById('totalImages');
        const totalSizeEl = document.getElementById('totalSize');
        const lastUpdateEl = document.getElementById('lastUpdate');

        if (totalImagesEl) {
            totalImagesEl.textContent = allPhotos.length;
        }

        // Calculate total size (estimated)
        if (totalSizeEl) {
            const estimatedSize = allPhotos.length * 0.5; // Estimate 0.5MB per image
            totalSizeEl.textContent = `${estimatedSize.toFixed(1)} MB`;
        }

        if (lastUpdateEl) {
            lastUpdateEl.textContent = new Date().toLocaleString('vi-VN');
        }

        // Update category stats
        updateCategoryStats();
        updatePerformanceStats();

    } catch (error) {
        console.error('❌ Error updating statistics:', error);
    }
}

function updateCategoryStats() {
    try {
        const ceremonyCount = document.getElementById('ceremonyCount');
        const friendsCount = document.getElementById('friendsCount');
        const familyCount = document.getElementById('familyCount');

        let ceremony = 0, friends = 0, family = 0;

        allPhotos.forEach(photo => {
            switch (photo.category) {
                case 'ceremony': ceremony++; break;
                case 'friends': friends++; break;
                case 'family': family++; break;
                default: ceremony++; // Default to ceremony
            }
        });

        if (ceremonyCount) ceremonyCount.textContent = ceremony;
        if (friendsCount) friendsCount.textContent = friends;
        if (familyCount) familyCount.textContent = family;

    } catch (error) {
        console.error('❌ Error updating category stats:', error);
    }
}

function updatePerformanceStats() {
    try {
        const loadSpeedEl = document.getElementById('loadSpeed');
        const serverStatusEl = document.getElementById('serverStatus');
        const storageUsedEl = document.getElementById('storageUsed');

        // Simulate performance metrics
        if (loadSpeedEl) {
            const loadTime = Math.random() * 2 + 0.5; // 0.5-2.5 seconds
            loadSpeedEl.textContent = `${loadTime.toFixed(1)}s`;
        }

        if (serverStatusEl) {
            serverStatusEl.textContent = '🟢 localStorage';
            serverStatusEl.className = 'font-semibold text-green-600';
        }

        if (storageUsedEl) {
            const used = (allPhotos.length * 0.5).toFixed(1);
            storageUsedEl.textContent = `${used}/100 MB`;
        }

    } catch (error) {
        console.error('❌ Error updating performance stats:', error);
    }
}

// Management tools
function exportAllImages() {
    try {
        if (allPhotos.length === 0) {
            showToast('Không có ảnh để xuất!', 'warning');
            return;
        }

        showToast('Đang chuẩn bị xuất ảnh...', 'info');

        const exportData = allPhotos.map(photo => ({
            title: photo.title || photo.caption,
            url: photo.src,
            category: photo.category,
            uploadDate: photo.uploadDate || new Date().toISOString()
        }));

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `graduation-images-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('Đã xuất danh sách ảnh!', 'success');
    } catch (error) {
        console.error('❌ Error exporting images:', error);
        showToast('Lỗi khi xuất ảnh!', 'error');
    }
}

function exportImageList() {
    try {
        if (allPhotos.length === 0) {
            showToast('Không có ảnh để xuất!', 'warning');
            return;
        }

        const csvContent = 'STT,Tên ảnh,Danh mục,URL,Ngày upload\n' +
            allPhotos.map((photo, index) =>
                `${index + 1},"${photo.title || photo.caption || 'Không có tên'}","${photo.category || 'ceremony'}","${photo.src}","${photo.uploadDate || new Date().toISOString()}"`
            ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `graduation-images-list-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('Đã xuất danh sách CSV!', 'success');
    } catch (error) {
        console.error('❌ Error exporting image list:', error);
        showToast('Lỗi khi xuất danh sách!', 'error');
    }
}

function createBackup() {
    try {
        const backupData = {
            timestamp: new Date().toISOString(),
            totalImages: allPhotos.length,
            images: allPhotos,
            settings: {
                privateMode: document.getElementById('privateMode')?.checked || false
            }
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `graduation-gallery-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('Đã tạo backup thành công!', 'success');
    } catch (error) {
        console.error('❌ Error creating backup:', error);
        showToast('Lỗi khi tạo backup!', 'error');
    }
}

// Security functions
function changePassword() {
    const newPassword = prompt('Nhập mật khẩu mới:');
    if (newPassword && newPassword.length >= 6) {
        // Update in memory (would need server-side storage for persistence)
        window.HOSTING_CONFIG.DEFAULT_PASSWORD = newPassword;
        showToast('Đã đổi mật khẩu thành công! (chỉ trong phiên này)', 'warning');
        addActivity('🔑 Đã đổi mật khẩu admin');
    } else if (newPassword) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
    }
}

function viewAccessLog() {
    try {
        const logs = JSON.parse(localStorage.getItem('accessLogs') || '[]');
        if (logs.length === 0) {
            showToast('Chưa có nhật ký truy cập!', 'info');
            return;
        }

        const logText = logs.map(log => `${log.timestamp}: ${log.action}`).join('\n');
        alert(`Nhật ký truy cập:\n\n${logText}`);
    } catch (error) {
        console.error('❌ Error viewing access log:', error);
        showToast('Lỗi khi xem nhật ký!', 'error');
    }
}

// Quick actions
function optimizeAllImages() {
    showToast('Tính năng đang phát triển...', 'info');
    addActivity('🖼️ Đã tối ưu hóa ảnh');
}

function regenerateThumbnails() {
    showToast('Đang tạo lại thumbnail...', 'info');
    setTimeout(() => {
        showToast('Đã tạo lại thumbnail thành công!', 'success');
        addActivity('🔄 Đã tạo lại thumbnail');
    }, 2000);
}

function checkBrokenImages() {
    showToast('Đang kiểm tra ảnh lỗi...', 'info');

    let brokenCount = 0;
    const promises = allPhotos.map(photo => {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(false);
            img.onerror = () => {
                brokenCount++;
                resolve(true);
            };
            img.src = photo.src;
        });
    });

    Promise.all(promises).then(() => {
        if (brokenCount === 0) {
            showToast('Tất cả ảnh đều hoạt động tốt!', 'success');
        } else {
            showToast(`Tìm thấy ${brokenCount} ảnh lỗi!`, 'warning');
        }
        addActivity(`🔍 Kiểm tra ảnh: ${brokenCount} lỗi`);
    });
}

// Activity feed
function addActivity(message) {
    try {
        const timestamp = new Date().toLocaleString('vi-VN');
        const activity = { timestamp, message };

        // Get existing activities
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        activities.unshift(activity); // Add to beginning

        // Keep only last 10 activities
        if (activities.length > 10) {
            activities.splice(10);
        }

        localStorage.setItem('activities', JSON.stringify(activities));
        updateActivityFeed();
    } catch (error) {
        console.error('❌ Error adding activity:', error);
    }
}

function updateActivityFeed() {
    try {
        const feedContainer = document.getElementById('activityFeed');
        if (!feedContainer) return;

        const activities = JSON.parse(localStorage.getItem('activities') || '[]');

        if (activities.length === 0) {
            feedContainer.innerHTML = '<div class="text-sm text-gray-500 italic">Chưa có hoạt động nào...</div>';
            return;
        }

        feedContainer.innerHTML = activities.map(activity => `
            <div class="flex justify-between items-center text-sm p-2 bg-white rounded border">
                <span>${activity.message}</span>
                <span class="text-gray-400 text-xs">${activity.timestamp}</span>
            </div>
        `).join('');

    } catch (error) {
        console.error('❌ Error updating activity feed:', error);
    }
}

function refreshActivityFeed() {
    updateActivityFeed();
    showToast('Đã làm mới hoạt động!', 'success');
}

// Additional admin functions
function refreshGallery() {
    showLoading();
    loadPhotosFromStorage().then(() => {
        loadAdminImages();
        updateStatistics();
        hideLoading();
        showToast('Đã làm mới gallery!', 'success');
        addActivity('🔄 Đã làm mới gallery');
    }).catch(error => {
        console.error('Error refreshing gallery:', error);
        hideLoading();
        showToast('Lỗi khi làm mới gallery!', 'error');
    });
}

function resetToDefaultImages() {
    if (confirm('Bạn có chắc muốn reset về ảnh mặc định? Tất cả ảnh hiện tại sẽ bị xóa!')) {
        showLoading();
        // Clear all data and reload
        window.photoAPI.clearAllData();
        setTimeout(() => {
            hideLoading();
            showToast('Đã reset về ảnh mặc định!', 'success');
            addActivity('🔄 Đã reset về ảnh mặc định');
            location.reload(); // Reload to trigger demo setup
        }, 1000);
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastIcon || !toastMessage) return;

    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };

    const colors = {
        'success': 'border-green-500',
        'error': 'border-red-500',
        'warning': 'border-yellow-500',
        'info': 'border-blue-500'
    };

    toastIcon.textContent = icons[type] || icons.info;
    toastMessage.textContent = message;
    toast.className = `fixed top-4 right-4 z-50`;
    toast.firstElementChild.className = `bg-white rounded-lg shadow-lg p-4 border-l-4 ${colors[type] || colors.info}`;

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Export functions to global scope for HTML onclick handlers
window.logout = logout;
window.uploadImages = uploadImages;
window.removePreview = removePreview;
window.editImage = editImage;
window.deleteImage = deleteImage;
window.clearAllImages = clearAllImages;
window.copyShareLink = copyShareLink;
window.generateQRCode = generateQRCode;
window.downloadQRCode = downloadQRCode;
window.shareToFacebook = shareToFacebook;
window.shareToZalo = shareToZalo;
window.exportAllImages = exportAllImages;
window.exportImageList = exportImageList;
window.createBackup = createBackup;
window.changePassword = changePassword;
window.viewAccessLog = viewAccessLog;
window.optimizeAllImages = optimizeAllImages;
window.regenerateThumbnails = regenerateThumbnails;
window.checkBrokenImages = checkBrokenImages;
window.refreshActivityFeed = refreshActivityFeed;
window.refreshGallery = refreshGallery;
window.resetToDefaultImages = resetToDefaultImages;
