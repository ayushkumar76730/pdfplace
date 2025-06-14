// Global Variables
let currentUser = null;
let isAdmin = false;
let currentPreviewFile = null;
let isDarkTheme = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize application: ' + error.message);
    }
});

function initializeApp() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.textContent = '☀️';
        }
        isDarkTheme = true;
    }
    
    // Show welcome popup on first visit
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
        showWelcomePopup();
        localStorage.setItem('hasVisited', 'true');
    } else {
        closeWelcomePopup();
    }
    
    // Check if user is already logged in
    checkLoginStatus();
}

function checkLoginStatus() {
    // This would normally check server session, but we'll handle it client-side for now
    // In production, this should be a server-side check
    showMainPage();
}

// Welcome Popup Functions
function showWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    if (popup) {
        popup.style.display = 'flex';
    }
}

function closeWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Theme Toggle
function toggleTheme() {
    try {
        const body = document.body;
        const themeIcon = document.getElementById('themeIcon');
        
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
            isDarkTheme = false;
        } else {
            body.classList.add('dark-theme');
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
            isDarkTheme = true;
        }
    } catch (error) {
        console.error('Error toggling theme:', error);
    }
}

// Authentication Functions
function togglePasswordVisibility() {
    try {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.getElementById('passwordToggleIcon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = '👁️';
        }
    } catch (error) {
        console.error('Error toggling password visibility:', error);
    }
}

function login(event) {
    if (event) {
        event.preventDefault();
    }
    
    try {
        showLoading(true);
        
        const form = document.getElementById('loginForm');
        const formData = new FormData(form);
        
        fetch('/login', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user_email;
                isAdmin = data.is_admin;
                showMainApp();
                showSuccess('Login successful!');
            } else {
                showError(data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showError('Login failed: ' + error.message);
        })
        .finally(() => {
            showLoading(false);
        });
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed: ' + error.message);
        showLoading(false);
    }
}

function logout() {
    try {
        showLoading(true);
        
        fetch('/logout', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = null;
                isAdmin = false;
                showMainPage(); // Return to main page with login button
                showSuccess('Logged out successfully!');
            } else {
                showError('Logout failed');
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            showError('Logout failed: ' + error.message);
        })
        .finally(() => {
            showLoading(false);
        });
    } catch (error) {
        console.error('Logout error:', error);
        showError('Logout failed: ' + error.message);
        showLoading(false);
    }
}

function showMainPage() {
    const loginSection = document.getElementById('loginSection');
    const mainApp = document.getElementById('mainApp');
    const currentUserElement = document.getElementById('currentUser');
    const uploadSection = document.getElementById('uploadSection');
    const loginButton = document.getElementById('loginButton');
    const userInfo = document.getElementById('userInfo');
    
    if (loginSection) loginSection.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
    
    // Show login button if not logged in
    if (!currentUser) {
        if (loginButton) loginButton.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        if (currentUserElement) currentUserElement.textContent = 'Welcome! Please login to access features.';
        if (uploadSection) uploadSection.style.display = 'none';
        
        // Disable interactive features
        disableFeatures();
    } else {
        if (loginButton) loginButton.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (currentUserElement) currentUserElement.textContent = `Welcome, ${currentUser}!`;
        if (uploadSection) uploadSection.style.display = isAdmin ? 'block' : 'none';
        
        // Enable interactive features
        enableFeatures();
        loadPDFs();
        loadDownloads();
        loadComments();
        loadStorageInfo();
    }
}

function showLoginSection() {
    const loginSection = document.getElementById('loginSection');
    const mainApp = document.getElementById('mainApp');
    
    if (loginSection) loginSection.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
}

function disableFeatures() {
    // Show message for features that require login
    const pdfList = document.getElementById('pdfList');
    const downloadsList = document.getElementById('downloadsList');
    const commentsList = document.getElementById('commentsList');
    
    if (pdfList) {
        pdfList.innerHTML = '<div class="login-required"><p>Please login to view and manage PDF files.</p></div>';
    }
    if (downloadsList) {
        downloadsList.innerHTML = '<div class="login-required"><p>Please login to view download history.</p></div>';
    }
    if (commentsList) {
        commentsList.innerHTML = '<div class="login-required"><p>Please login to view and submit feedback.</p></div>';
    }
}

function enableFeatures() {
    // Features will be enabled when data is loaded
}

function showMainApp() {
    // After successful login, update the main page to show user features
    showMainPage();
}

// Forgot Password Functions
function showForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function sendPasswordReset() {
    const email = document.getElementById('resetEmail').value.trim();
    if (!email) {
        showError('Please enter your email address');
        return;
    }
    
    // Simulate password reset
    showSuccess('Password reset instructions sent to your email!');
    closeForgotPassword();
}

// Tab Navigation
function showTab(tabName) {
    try {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab content
        const selectedTab = document.getElementById(tabName + 'Tab');
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Add active class to clicked button
        const clickedButton = event.target;
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
        
        // Load data for specific tabs
        if (tabName === 'downloads') {
            loadDownloads();
        } else if (tabName === 'comments') {
            loadComments();
        }
    } catch (error) {
        console.error('Error showing tab:', error);
    }
}

// File Upload Functions
function uploadPDF(event) {
    if (event) {
        event.preventDefault();
    }
    
    try {
        if (!isAdmin) {
            showError('Upload permission denied. Admin access required.');
            return;
        }
        
        const form = document.getElementById('uploadForm');
        const fileInput = document.getElementById('pdfFile');
        const statusDiv = document.getElementById('uploadStatus');
        
        if (!fileInput.files[0]) {
            showError('Please select a PDF file');
            return;
        }
        
        const file = fileInput.files[0];
        if (file.type !== 'application/pdf') {
            showError('Please select a valid PDF file');
            return;
        }
        
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            showError('File size too large. Maximum size is 50MB.');
            return;
        }
        
        showLoading(true);
        statusDiv.innerHTML = '<div class="loading-spinner"></div> Uploading...';
        
        const formData = new FormData(form);
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess(data.message || 'File uploaded successfully!');
                form.reset();
                statusDiv.innerHTML = '';
                loadPDFs(); // Refresh file list
            } else {
                showError(data.message || 'Upload failed');
                statusDiv.innerHTML = '';
            }
        })
        .catch(error => {
            console.error('Upload error:', error);
            showError('Upload failed: ' + error.message);
            statusDiv.innerHTML = '';
        })
        .finally(() => {
            showLoading(false);
        });
    } catch (error) {
        console.error('Upload error:', error);
        showError('Upload failed: ' + error.message);
        showLoading(false);
    }
}

// File Management Functions
function loadPDFs() {
    try {
        const category = document.getElementById('categoryFilter').value;
        const search = document.getElementById('searchInput').value;
        
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        
        fetch('/files?' + params.toString())
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayPDFs(data.files);
            } else {
                showError(data.message || 'Failed to load files');
            }
        })
        .catch(error => {
            console.error('Error loading PDFs:', error);
            showError('Failed to load files: ' + error.message);
        });
    } catch (error) {
        console.error('Error loading PDFs:', error);
        showError('Failed to load files: ' + error.message);
    }
}

function displayPDFs(files) {
    const pdfList = document.getElementById('pdfList');
    if (!pdfList) return;
    
    if (files.length === 0) {
        pdfList.innerHTML = '<p class="text-center text-muted">No PDF files found.</p>';
        return;
    }
    
    pdfList.innerHTML = files.map(file => `
        <div class="pdf-item">
            <div class="pdf-header">
                <div class="pdf-info">
                    <h3>${escapeHtml(file.filename)}</h3>
                    <div class="pdf-meta">
                        <span>📅 ${file.upload_date}</span>
                        <span>📊 ${formatFileSize(file.size)}</span>
                        <span>📈 ${file.download_count} downloads</span>
                    </div>
                </div>
                <div class="pdf-category">${file.category}</div>
            </div>
            <div class="pdf-actions">
                <button class="btn-preview" onclick="previewPDF(${file.id}, '${escapeHtml(file.filename)}')">
                    👁️ Preview
                </button>
                <button class="btn-download" onclick="downloadPDF(${file.id}, '${escapeHtml(file.filename)}')">
                    📥 Download
                </button>
                ${isAdmin ? `<button class="btn-delete" onclick="deletePDF(${file.id})">🗑️ Delete</button>` : ''}
            </div>
        </div>
    `).join('');
}

function searchPDFs() {
    loadPDFs();
}

function filterByCategory() {
    loadPDFs();
}

function previewPDF(fileId, filename) {
    try {
        const modal = document.getElementById('previewModal');
        const iframe = document.getElementById('previewFrame');
        const title = document.getElementById('previewTitle');
        const loading = document.getElementById('previewLoading');
        
        if (!modal || !iframe || !title || !loading) {
            showError('Preview modal not found');
            return;
        }
        
        currentPreviewFile = fileId;
        title.textContent = `Preview: ${filename}`;
        
        // Show modal and loading
        modal.style.display = 'flex';
        loading.style.display = 'block';
        iframe.style.display = 'none';
        
        // Load PDF
        iframe.src = `/preview/${fileId}`;
        
        iframe.onload = function() {
            loading.style.display = 'none';
            iframe.style.display = 'block';
        };
        
        iframe.onerror = function() {
            loading.style.display = 'none';
            showError('Failed to load PDF preview');
            closePreview();
        };
    } catch (error) {
        console.error('Preview error:', error);
        showError('Failed to preview PDF: ' + error.message);
    }
}

function closePreview() {
    const modal = document.getElementById('previewModal');
    const iframe = document.getElementById('previewFrame');
    
    if (modal) {
        modal.style.display = 'none';
    }
    
    if (iframe) {
        iframe.src = '';
    }
    
    currentPreviewFile = null;
}

function downloadCurrentPDF() {
    if (currentPreviewFile) {
        window.open(`/download/${currentPreviewFile}`, '_blank');
    }
}

function downloadPDF(fileId, filename) {
    try {
        // Track download
        window.open(`/download/${fileId}`, '_blank');
        
        // Refresh downloads list if on downloads tab
        if (document.getElementById('downloadsTab').classList.contains('active')) {
            setTimeout(() => {
                loadDownloads();
            }, 1000);
        }
    } catch (error) {
        console.error('Download error:', error);
        showError('Failed to download PDF: ' + error.message);
    }
}

function deletePDF(fileId) {
    if (!isAdmin) {
        showError('Delete permission denied. Admin access required.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this PDF?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        fetch(`/delete/${fileId}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess(data.message || 'File deleted successfully');
                loadPDFs(); // Refresh file list
            } else {
                showError(data.message || 'Delete failed');
            }
        })
        .catch(error => {
            console.error('Delete error:', error);
            showError('Delete failed: ' + error.message);
        })
        .finally(() => {
            showLoading(false);
        });
    } catch (error) {
        console.error('Delete error:', error);
        showError('Delete failed: ' + error.message);
        showLoading(false);
    }
}

function toggleFullscreen() {
    const iframe = document.getElementById('previewFrame');
    if (!iframe) return;
    
    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
    }
}

// Downloads Functions
function loadDownloads() {
    try {
        const filter = document.getElementById('downloadsFilter').value;
        const params = new URLSearchParams();
        if (filter) params.append('filter', filter);
        
        fetch('/downloads?' + params.toString())
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayDownloads(data.downloads);
            } else {
                showError(data.message || 'Failed to load downloads');
            }
        })
        .catch(error => {
            console.error('Error loading downloads:', error);
            showError('Failed to load downloads: ' + error.message);
        });
    } catch (error) {
        console.error('Error loading downloads:', error);
        showError('Failed to load downloads: ' + error.message);
    }
}

function displayDownloads(downloads) {
    const downloadsList = document.getElementById('downloadsList');
    if (!downloadsList) return;
    
    if (downloads.length === 0) {
        downloadsList.innerHTML = '<p class="text-center text-muted">No downloads found.</p>';
        return;
    }
    
    downloadsList.innerHTML = downloads.map(download => `
        <div class="download-item">
            <div class="download-info">
                <h4>${escapeHtml(download.filename)}</h4>
                <div class="download-meta">
                    <span>📅 ${download.download_date}</span>
                    <span class="pdf-category">${download.category}</span>
                </div>
            </div>
            <div class="download-actions">
                <button onclick="downloadPDF(${download.file_id}, '${escapeHtml(download.filename)}')">
                    📥 Download Again
                </button>
            </div>
        </div>
    `).join('');
}

function filterDownloads() {
    loadDownloads();
}

function clearDownloadHistory() {
    if (!confirm('Are you sure you want to clear your download history?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        fetch('/clear_downloads', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess(data.message || 'Download history cleared');
                loadDownloads();
            } else {
                showError(data.message || 'Failed to clear history');
            }
        })
        .catch(error => {
            console.error('Clear downloads error:', error);
            showError('Failed to clear history: ' + error.message);
        })
        .finally(() => {
            showLoading(false);
        });
    } catch (error) {
        console.error('Clear downloads error:', error);
        showError('Failed to clear history: ' + error.message);
        showLoading(false);
    }
}

// Comments Functions
function submitComment(event) {
    if (event) {
        event.preventDefault();
    }
    
    try {
        const form = document.getElementById('feedbackForm');
        const formData = new FormData(form);
        
        if (!formData.get('text').trim()) {
            showError('Please enter your feedback');
            return;
        }
        
        showLoading(true);
        
        fetch('/comments', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess(data.message || 'Feedback submitted successfully');
                form.reset();
                loadComments();
            } else {
                showError(data.message || 'Failed to submit feedback');
            }
        })
        .catch(error => {
            console.error('Comment submission error:', error);
            showError('Failed to submit feedback: ' + error.message);
        })
        .finally(() => {
            showLoading(false);
        });
    } catch (error) {
        console.error('Comment submission error:', error);
        showError('Failed to submit feedback: ' + error.message);
        showLoading(false);
    }
}

function loadComments() {
    try {
        fetch('/comments')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayComments(data.comments);
            } else {
                showError(data.message || 'Failed to load comments');
            }
        })
        .catch(error => {
            console.error('Error loading comments:', error);
            showError('Failed to load comments: ' + error.message);
        });
    } catch (error) {
        console.error('Error loading comments:', error);
        showError('Failed to load comments: ' + error.message);
    }
}

function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="text-center text-muted">No feedback found.</p>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <div class="comment-user">${escapeHtml(comment.user_email)}</div>
                <div class="comment-date">${comment.created_at}</div>
            </div>
            <div class="comment-category">${comment.category}</div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            ${comment.is_resolved ? '<div class="comment-resolved">✅ Resolved</div>' : ''}
            ${comment.admin_reply ? `<div class="admin-reply"><strong>Admin Reply:</strong> ${escapeHtml(comment.admin_reply)}</div>` : ''}
        </div>
    `).join('');
}

// Storage Info
function loadStorageInfo() {
    try {
        fetch('/storage_info')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const storageElement = document.getElementById('storageUsage');
                if (storageElement) {
                    storageElement.textContent = `Storage: ${data.total_size_mb}MB (${data.total_files} files)`;
                }
            }
        })
        .catch(error => {
            console.error('Error loading storage info:', error);
        });
    } catch (error) {
        console.error('Error loading storage info:', error);
    }
}

// Utility Functions
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showError(message) {
    const toast = document.getElementById('errorToast');
    const messageElement = document.getElementById('errorMessage');
    
    if (toast && messageElement) {
        messageElement.textContent = message;
        toast.style.display = 'flex';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            hideToast('errorToast');
        }, 5000);
    }
    
    console.error('Error:', message);
}

function showSuccess(message) {
    const toast = document.getElementById('successToast');
    const messageElement = document.getElementById('successMessage');
    
    if (toast && messageElement) {
        messageElement.textContent = message;
        toast.style.display = 'flex';
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            hideToast('successToast');
        }, 3000);
    }
    
    console.log('Success:', message);
}

function hideToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.style.display = 'none';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Event Listeners
document.addEventListener('click', function(event) {
    // Close modals when clicking outside
    if (event.target.classList.contains('modal-overlay')) {
        if (event.target.id === 'previewModal') {
            closePreview();
        } else if (event.target.id === 'forgotPasswordModal') {
            closeForgotPassword();
        }
    }
    
    // Close popup when clicking outside
    if (event.target.classList.contains('popup-overlay')) {
        closeWelcomePopup();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key to close modals
    if (event.key === 'Escape') {
        closePreview();
        closeForgotPassword();
        closeWelcomePopup();
    }
    
    // Ctrl+/ to toggle theme
    if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        toggleTheme();
    }
});

// Handle form submissions
document.addEventListener('submit', function(event) {
    const form = event.target;
    
    if (form.id === 'loginForm') {
        login(event);
    } else if (form.id === 'uploadForm') {
        uploadPDF(event);
    } else if (form.id === 'feedbackForm') {
        submitComment(event);
    }
});

// Window resize handler
window.addEventListener('resize', function() {
    // Adjust modal sizes if needed
    const modals = document.querySelectorAll('.modal-content');
    modals.forEach(modal => {
        if (window.innerWidth < 768) {
            modal.style.width = '95%';
            modal.style.margin = '20px';
        } else {
            modal.style.width = '';
            modal.style.margin = '';
        }
    });
});

// Handle browser back button
window.addEventListener('popstate', function(event) {
    // Prevent going back to login if already logged in
    if (currentUser && document.getElementById('mainApp').style.display === 'block') {
        event.preventDefault();
        history.pushState(null, null, location.href);
    }
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// Error handling for uncaught exceptions
window.addEventListener('error', function(event) {
    console.error('Unhandled error:', event.error);
    showError('An unexpected error occurred. Please try again.');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An unexpected error occurred. Please try again.');
    event.preventDefault();
});

// Network status handling
window.addEventListener('online', function() {
    showSuccess('Connection restored');
});

window.addEventListener('offline', function() {
    showError('Connection lost. Some features may not work.');
});

// Visibility change handler
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && currentUser) {
        // Refresh data when tab becomes visible
        if (document.getElementById('uploadsTab').classList.contains('active')) {
            loadPDFs();
        } else if (document.getElementById('downloadsTab').classList.contains('active')) {
            loadDownloads();
        } else if (document.getElementById('commentsTab').classList.contains('active')) {
            loadComments();
        }
    }
});
