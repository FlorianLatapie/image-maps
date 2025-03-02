document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const uploadArea = document.getElementById('uploadArea');
    const viewerArea = document.getElementById('viewerArea');
    const imageInput = document.getElementById('imageInput');
    const mapImage = document.getElementById('mapImage');
    const imageContainer = document.getElementById('imageContainer');
    const loading = document.getElementById('loading');

    // Initialize Zoom
    const zoomInstance = new Zoom(imageContainer, {
        pan: true,
        rotate: true,
        minZoom: 0.5,
        maxZoom: 30
    });

    // Handle image upload
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Show loading spinner
        loading.classList.remove('hidden');

        // Create URL for the image
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Hide loading spinner and show viewer
                mapImage.src = e.target.result;
                uploadArea.classList.add('hidden');
                viewerArea.classList.remove('hidden');
                loading.classList.add('hidden');
            };
            
            img.onerror = () => {
                loading.classList.add('hidden');
                alert('Error loading the image. Please try another one.');
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    });
});