document.addEventListener('DOMContentLoaded', () => {
    const clickOverlay = document.getElementById('click-overlay');
    const videoContainer = document.getElementById('video-container');
    const mainContent = document.getElementById('main-content');
    const video = document.getElementById('bg-video');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');

    let hasStarted = false;

    // Handle initial click
    clickOverlay.addEventListener('click', () => {
        if (hasStarted) return;
        hasStarted = true;

        // Hide overlay, show video
        clickOverlay.style.opacity = '0';
        setTimeout(() => {
            clickOverlay.style.display = 'none';
        }, 500);

        videoContainer.classList.remove('hidden');
        
        // Start video unmuted
        video.volume = 1;
        video.muted = false;
        video.play().catch(e => console.log("Video play failed:", e));

        // Wait exactly 3 seconds, then show the profile links/controls
        setTimeout(() => {
            mainContent.classList.remove('hidden');
            mainContent.classList.add('visible');
        }, 3000);
    });

    // Audio controls functionality
    muteBtn.addEventListener('click', () => {
        if (video.muted) {
            video.muted = false;
            muteBtn.textContent = '🔊';
            volumeSlider.value = video.volume;
        } else {
            video.muted = true;
            muteBtn.textContent = '🔇';
            volumeSlider.value = 0;
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        video.volume = value;
        
        if (value > 0) {
            video.muted = false;
            muteBtn.textContent = value > 0.5 ? '🔊' : '🔉';
        } else {
            video.muted = true;
            muteBtn.textContent = '🔇';
        }
    });
});