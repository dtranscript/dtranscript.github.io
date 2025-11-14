// Load transcript when page loads if URL parameters exist
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const transcriptUrl = urlParams.get('url');
    const fileName = urlParams.get('file');
    
    if (transcriptUrl) {
        loadFromURL(transcriptUrl);
    } else if (fileName) {
        // Assuming files are in the same repository
        const repoUrl = `https://raw.githubusercontent.com/${getRepoPath()}/${fileName}`;
        loadFromURL(repoUrl);
    }
});

function getRepoPath() {
    // Extract repo path from current URL
    const path = window.location.pathname.split('/');
    return path.slice(1, 3).join('/'); // username/reponame
}

function loadFromFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Please select a file first!', 'error');
        return;
    }
    
    if (!file.name.endsWith('.html')) {
        showNotification('Please select an HTML file!', 'error');
        return;
    }
    
    showLoading();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        hideLoading();
        displayTranscript(e.target.result);
        updateURLWithFile(file.name);
    };
    
    reader.onerror = function() {
        hideLoading();
        showNotification('Error reading file!', 'error');
    };
    
    reader.readAsText(file);
}

function loadFromURL(customUrl = null) {
    const urlInput = document.getElementById('urlInput');
    const transcriptUrl = customUrl || urlInput.value;
    
    if (!transcriptUrl) {
        showNotification('Please enter a URL!', 'error');
        return;
    }
    
    // Validate URL
    try {
        new URL(transcriptUrl);
    } catch (e) {
        showNotification('Please enter a valid URL!', 'error');
        return;
    }
    
    showLoading();
    
    fetch(transcriptUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(htmlContent => {
            hideLoading();
            displayTranscript(htmlContent);
            updateURLWithParam(transcriptUrl);
        })
        .catch(error => {
            hideLoading();
            console.error('Error loading transcript:', error);
            showNotification(`Failed to load transcript: ${error.message}`, 'error');
            showErrorSection(error.message);
        });
}

function displayTranscript(htmlContent) {
    const transcriptViewer = document.getElementById('transcriptViewer');
    const uploadSection = document.getElementById('uploadSection');
    
    // Extract and format the transcript
    const formattedHTML = formatTranscriptHTML(htmlContent);
    transcriptViewer.innerHTML = formattedHTML;
    
    // Show transcript, hide upload section
    transcriptViewer.style.display = 'block';
    uploadSection.style.display = 'none';
    
    // Add event listeners for images
    addImageEventListeners();
    
    // Scroll to top of transcript
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showNotification('Transcript loaded successfully!');
}

function formatTranscriptHTML(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const header = doc.querySelector('.header') || doc.querySelector('h1');
    const messages = doc.querySelector('.messages') || doc.querySelector('.messages-container');
    const info = doc.querySelector('.info') || doc.querySelector('.info-grid');
    const footer = doc.querySelector('.footer');
    
    const title = header ? header.textContent.replace('📄 Transcript Ticket - ', '') : 'Discord Transcript';
    
    return `
        <div class="transcript-container">
            <div class="transcript-header">
                <div class="header-actions">
                    <button onclick="showUploadSection()" class="back-button">← Back</button>
                    <button onclick="shareTranscript()" class="share-button">🔗 Share</button>
                </div>
                <h1>${title}</h1>
                <div class="transcript-channel-info">Discord Transcript Viewer</div>
            </div>
            
            ${info ? `<div class="transcript-info-grid">${info.innerHTML}</div>` : ''}
            
            <div class="transcript-messages-container">
                ${messages ? messages.innerHTML : '<div class="no-messages">No messages found in transcript</div>'}
            </div>
            
            ${footer ? `<div class="transcript-footer">${footer.innerHTML}</div>` : 
                `<div class="transcript-footer">
                    Viewed via Discord Transcript Viewer • ${new Date().toLocaleString()}
                </div>`}
        </div>
    `;
}

function showUploadSection() {
    const transcriptViewer = document.getElementById('transcriptViewer');
    const uploadSection = document.getElementById('uploadSection');
    
    transcriptViewer.style.display = 'none';
    uploadSection.style.display = 'block';
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
}

function shareTranscript() {
    const currentUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Discord Transcript',
            url: currentUrl
        });
    } else {
        navigator.clipboard.writeText(currentUrl).then(() => {
            showNotification('Link copied to clipboard!');
        });
    }
}

function updateURLWithParam(url) {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('url', url);
    window.history.replaceState({}, '', newUrl);
}

function updateURLWithFile(filename) {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('file', filename);
    window.history.replaceState({}, '', newUrl);
}

function showLoading() {
    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('uploadSection').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingSection').style.display = 'none';
}

function showErrorSection(error) {
    const uploadSection = document.getElementById('uploadSection');
    uploadSection.innerHTML = `
        <div class="error-section">
            <h2>Error Loading Transcript</h2>
            <p>${error}</p>
            <button onclick="location.reload()">Try Again</button>
        </div>
    `;
}

// ... (fungsi addImageEventListeners dan showNotification tetap sama)

function addImageEventListeners() {
    const images = document.querySelectorAll('.transcript-attachment-image, .attachment-image');
    images.forEach(img => {
        img.addEventListener('click', function() {
            window.open(this.src, '_blank');
        });
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadSection = document.querySelector('.upload-section');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadSection.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadSection.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadSection.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    uploadSection.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        uploadSection.classList.add('file-drop-area');
    }
    
    function unhighlight() {
        uploadSection.classList.remove('file-drop-area');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            loadTranscript();
        }
    }
});
