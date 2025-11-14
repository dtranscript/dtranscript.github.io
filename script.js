function loadTranscript() {
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
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const transcriptViewer = document.getElementById('transcriptViewer');
        
        // Extract the content from the uploaded HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(e.target.result, 'text/html');
        
        // Create transcript container
        const transcriptHTML = createTranscriptContainer(doc);
        transcriptViewer.innerHTML = transcriptHTML;
        transcriptViewer.style.display = 'block';
        
        // Add event listeners for images
        addImageEventListeners();
        
        // Scroll to transcript
        window.scrollTo({
            top: transcriptViewer.offsetTop,
            behavior: 'smooth'
        });
        
        showNotification('Transcript loaded successfully!');
    };
    
    reader.onerror = function() {
        showNotification('Error reading file!', 'error');
    };
    
    reader.readAsText(file);
}

function createTranscriptContainer(doc) {
    const header = doc.querySelector('.header') || doc.querySelector('h1');
    const messages = doc.querySelector('.messages') || doc.querySelector('.messages-container');
    const info = doc.querySelector('.info') || doc.querySelector('.info-grid');
    const footer = doc.querySelector('.footer');
    
    return `
        <div class="transcript-container">
            <div class="transcript-header">
                <h1>${header ? header.textContent : 'Discord Transcript'}</h1>
                <div class="transcript-channel-info">Uploaded Transcript</div>
            </div>
            
            ${info ? `<div class="transcript-info-grid">${info.innerHTML}</div>` : ''}
            
            <div class="transcript-messages-container">
                ${messages ? messages.innerHTML : 'No messages found'}
            </div>
            
            ${footer ? `<div class="transcript-footer">${footer.innerHTML}</div>` : 
                `<div class="transcript-footer">
                    Viewed via Discord Transcript Viewer • ${new Date().toLocaleString()}
                </div>`}
        </div>
    `;
}

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
