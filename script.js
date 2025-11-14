// Global state
let currentTranscriptHTML = '';

// Show upload methods
function showUpload(method) {
    document.querySelector('.upload-options').style.display = 'none';
    document.getElementById('backButton').style.display = 'block';
    
    if (method === 'file') {
        document.getElementById('fileUpload').style.display = 'block';
        setupFileUpload();
    } else {
        document.getElementById('urlUpload').style.display = 'block';
    }
}

// Show main menu
function showMainMenu() {
    document.querySelector('.upload-options').style.display = 'grid';
    document.getElementById('backButton').style.display = 'none';
    document.getElementById('fileUpload').style.display = 'none';
    document.getElementById('urlUpload').style.display = 'none';
}

// Setup file upload with drag & drop
function setupFileUpload() {
    const dropArea = document.getElementById('fileDropArea');
    const fileInput = document.getElementById('fileInput');
    
    // Click to select file
    dropArea.addEventListener('click', () => fileInput.click());
    
    // Drag & drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    dropArea.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFileSelect, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    document.getElementById('fileDropArea').classList.add('drag-over');
}

function unhighlight() {
    document.getElementById('fileDropArea').classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.name.endsWith('.html')) {
            loadFromFile(file);
        } else {
            showNotification('Please select an HTML file!', 'error');
        }
    }
}

// Load from file
function loadFromFile(file) {
    showLoading();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        hideLoading();
        currentTranscriptHTML = e.target.result;
        openTranscriptViewer();
    };
    
    reader.onerror = function() {
        hideLoading();
        showNotification('Error reading file!', 'error');
    };
    
    reader.readAsText(file);
}

// Load from URL
function loadFromURL() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        showNotification('Please enter a URL!', 'error');
        return;
    }
    
    // Validate URL
    try {
        new URL(url);
    } catch (e) {
        showNotification('Please enter a valid URL!', 'error');
        return;
    }
    
    showLoading();
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            hideLoading();
            currentTranscriptHTML = html;
            openTranscriptViewer();
        })
        .catch(error => {
            hideLoading();
            console.error('Error loading transcript:', error);
            showNotification(`Failed to load transcript: ${error.message}`, 'error');
        });
}

// Open transcript viewer
function openTranscriptViewer() {
    // Encode HTML for URL parameter
    const encodedHTML = encodeURIComponent(currentTranscriptHTML);
    
    // Open in new tab with transcript data
    const viewerUrl = `viewer.html?data=${encodedHTML}`;
    window.open(viewerUrl, '_blank');
}

// Loading functions
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Notification system
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'var(--red)' : 'var(--green)'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
