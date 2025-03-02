document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const uploadArea = document.getElementById('uploadArea');
    const viewerArea = document.getElementById('viewerArea');
    const imageInput = document.getElementById('imageInput');
    const mapImage = document.getElementById('mapImage');
    const imageContainer = document.getElementById('imageContainer');
    const resetButton = document.getElementById('resetButton');
    const loading = document.getElementById('loading');

    let minScale = 1;
    let maxScale = 100;

    let initialDistance = 0;
    let initialAngle = 0;
    let currentScale = 1;
    let currentRotation = 0;

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
                
                // Reset transformations
                resetView();
            };
            
            img.onerror = () => {
                loading.classList.add('hidden');
                alert('Error loading the image. Please try another one.');
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    });

    // Touch event handlers
    imageContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    imageContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    imageContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Reset view button
    resetButton.addEventListener('click', resetView);

    function handleTouchStart(e) {
        if (e.touches.length === 2) {
            initialDistance = getDistance(e.touches);
            initialAngle = getAngle(e.touches);
        }
    }

    function handleTouchMove(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const newDistance = getDistance(e.touches);
            const newAngle = getAngle(e.touches);

            const scaleChange = newDistance / initialDistance;
            const rotationChange = newAngle - initialAngle;

            currentScale = Math.min(Math.max(minScale, currentScale * scaleChange), maxScale);
            currentRotation += rotationChange;

            mapImage.style.transform = `scale(${currentScale}) rotate(${currentRotation}deg)`;

            initialDistance = newDistance;
            initialAngle = newAngle;
        }
    }

    function handleTouchEnd(e) {
        if (e.touches.length < 2) {
            initialDistance = 0;
            initialAngle = 0;
        }
    }

    function getDistance(touches) {
        const [touch1, touch2] = touches;
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getAngle(touches) {
        const [touch1, touch2] = touches;
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.atan2(dy, dx) * (180 / Math.PI);
    }
});
