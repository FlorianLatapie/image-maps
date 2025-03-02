document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const uploadArea = document.getElementById('uploadArea');
    const viewerArea = document.getElementById('viewerArea');
    const imageInput = document.getElementById('imageInput');
    const mapImage = document.getElementById('mapImage');
    const imageContainer = document.getElementById('imageContainer');
    const resetButton = document.getElementById('resetButton');
    const loading = document.getElementById('loading');

    // State variables
    let currentScale = 1;
    let currentRotation = 0;
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let translateX = 0;
    let translateY = 0;
    let initialPinchDistance = 0;
    let initialRotation = 0;
    let lastTouchCenter = { x: 0, y: 0 };

    let minScale = 1;
    let maxScale = 100;

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
        e.preventDefault();
        
        if (e.touches.length === 1) {
            // Single touch - prepare for drag
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        } 
        else if (e.touches.length === 2) {
            // Two touches - prepare for pinch and rotate
            isDragging = false;
            
            // Calculate initial distance for pinch
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialPinchDistance = getDistance(touch1, touch2);
            
            // Calculate initial angle for rotation
            initialRotation = getAngle(touch1, touch2) - currentRotation;
            
            // Calculate the center point between the two touches
            lastTouchCenter = {
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2
            };
        }
    }

    function handleTouchMove(e) {
        e.preventDefault();
        
        if (e.touches.length === 1 && isDragging) {
            // Handle drag (pan)
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateTransform();
        } 
        else if (e.touches.length === 2) {
            // Handle pinch and rotate
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            
            // Calculate center point of the gesture
            const touchCenter = {
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2
            };
            
            // Calculate new scale
            const newDistance = getDistance(touch1, touch2);
            const scaleChange = newDistance / initialPinchDistance;
            const newScale = currentScale * scaleChange;
            
            // Calculate new rotation
            const newAngle = getAngle(touch1, touch2);
            const rotationChange = newAngle - initialRotation - currentRotation;
            
            // Limit zoom level
            if (newScale >= minScale && newScale <= maxScale) {
                // Calculate how much the touch center would move due to scaling and rotation
                // Adjust translation to keep touch center fixed
                const containerRect = imageContainer.getBoundingClientRect();
                const containerCenterX = containerRect.left + containerRect.width / 2;
                const containerCenterY = containerRect.top + containerRect.height / 2;
                
                // Vector from container center to touch center
                const vectorX = touchCenter.x - containerCenterX;
                const vectorY = touchCenter.y - containerCenterY;
                
                // Adjust translation to compensate for scale change
                translateX += vectorX * (1 - scaleChange);
                translateY += vectorY * (1 - scaleChange);
                
                // Update values for next move
                currentScale = newScale;
                currentRotation += rotationChange;
                initialPinchDistance = newDistance;
                initialRotation = newAngle - currentRotation;
                lastTouchCenter = touchCenter;
            }
            
            updateTransform();
        }
    }

    function handleTouchEnd(e) {
        if (e.touches.length === 0) {
            isDragging = false;
        }
        else if (e.touches.length === 1) {
            // If we go from 2 fingers to 1 finger
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        }
    }

    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getAngle(touch1, touch2) {
        return Math.atan2(
            touch2.clientY - touch1.clientY,
            touch2.clientX - touch1.clientX
        ) * 180 / Math.PI;
    }

    function updateTransform() {
        // Apply all transformations to the container
        imageContainer.style.transform = 
            `translate(${translateX}px, ${translateY}px) rotate(${currentRotation}deg) scale(${currentScale})`;
        // Reset the image transform since we're applying all transforms to the container
        mapImage.style.transform = 'none';
    }

    function resetView() {
        // Reset transformation variables
        currentScale = 1;
        currentRotation = 0;
        translateX = 0;
        translateY = 0;
        
        // Update the transform
        updateTransform();
    }

    // Prevent default browser handling of touch events
    document.addEventListener('touchmove', (e) => {
        if (viewerArea.classList.contains('hidden') === false) {
            e.preventDefault();
        }
    }, { passive: false });

    // Prevent zooming with pinch on the entire page
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    }, { passive: false });
});