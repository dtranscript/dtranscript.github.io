function loadTranscript() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const transcriptViewer = document.getElementById('transcriptViewer');
        transcriptViewer.innerHTML = e.target.result;
        transcriptViewer.style.display = 'block';
        
        // Scroll to top
        window.scrollTo(0, transcriptViewer.offsetTop);
    };
    reader.readAsText(file);
}
