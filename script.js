document.addEventListener('DOMContentLoaded', () => {
    // ---- DOM Elements ----
    const clickOverlay = document.getElementById('click-overlay');
    const videoContainer = document.getElementById('video-container');
    const mainContent = document.getElementById('main-content');
    const video = document.getElementById('bg-video');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const cursorGlow = document.getElementById('cursor-glow');
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    const viewCountEl = document.getElementById('view-count');

    // Discord Elements
    const dPfp = document.getElementById('discord-pfp');
    const dStatus = document.getElementById('discord-status');
    const dUsername = document.getElementById('discord-username');

    // ---- Custom Mouse Cursor & Glow (Butter Smooth Animation) ----
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isClicked = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant follow for glow and dot
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function animateRing() {
        // Smooth trailing formula
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        
        let scale = isClicked ? 0.6 : 1;
        let glowScale = isClicked ? 0.8 : 1;
        
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) scale(${scale})`;
        cursorGlow.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(${glowScale})`;
        
        requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);
    
    // Add click effect for cursor
    document.addEventListener('mousedown', () => {
        isClicked = true;
        cursorRing.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    });
    document.addEventListener('mouseup', () => {
        isClicked = false;
        cursorRing.style.backgroundColor = 'transparent';
    });

    // ---- Video Progress Bar Logic ----
    const videoProgress = document.getElementById('video-progress');
    const videoTime = document.getElementById('video-time');

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    video.addEventListener('timeupdate', () => {
        if (video.duration) {
            const percent = (video.currentTime / video.duration) * 100;
            videoProgress.style.width = `${percent}%`;
            videoTime.innerText = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }
    });

    // ---- Live View Counter (Free public API) ----
    // This increments the count by 1 every time the page loads
    fetch('https://api.counterapi.dev/v1/curzzzzz/visits/up')
        .then(res => res.json())
        .then(data => {
            viewCountEl.innerText = data.count || "150";
        })
        .catch(() => {
            viewCountEl.innerText = "150"; // Fallback if API fails
        });

    // ---- Discord Profile Fallback (Public API) ----
    // This fetches your actual PFP and Banner (using japi.rest)
    fetch('https://japi.rest/discord/v1/user/1153392848490737684')
        .then(res => res.json())
        .then(resData => {
            const data = resData.data;
            if (data) {
                // Set PFP (Auto-detects GIF or PNG)
                if (data.avatarURL) {
                    // Check if it's animated by looking at the avatar hash
                    const isGif = data.avatar && data.avatar.startsWith('a_');
                    const sizeParam = '?size=512';
                    const avatarUrl = isGif ? data.avatarURL.replace('.png', '.gif') + sizeParam : data.avatarURL + sizeParam;
                    dPfp.src = avatarUrl;
                }
                
                // Set Banner
                if (data.bannerURL) {
                    const dBanner = document.getElementById('discord-banner');
                    dBanner.style.backgroundImage = `url(${data.bannerURL}?size=1024)`;
                }

                // Update Username to match global name
                if (data.global_name) {
                    dUsername.innerText = data.global_name.toLowerCase();
                } else if (data.username) {
                    dUsername.innerText = data.username.toLowerCase();
                }
            }
        })
        .catch(err => console.log("Fallback profile fetch failed", err));

    // ---- Lanyard (Live Discord Presence) ----
    const LANYARD_USER_ID = "1153392848490737684";
    const ws = new WebSocket('wss://api.lanyard.rest/socket');

    ws.onopen = () => {
        // Subscribe to the specific Discord user
        ws.send(JSON.stringify({
            op: 2,
            d: { subscribe_to_id: LANYARD_USER_ID }
        }));
    };

    ws.onmessage = (event) => {
        const { t, d } = JSON.parse(event.data);

        // When we get initial state or updates
        if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
            updateDiscord(d);
        }
    };

    // Heartbeat to keep websocket alive
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 3 }));
        }
    }, 30000);

    function updateDiscord(data) {
        if (!data || !data.discord_user) return;

        // Update Avatar
        const ext = data.discord_user.avatar.startsWith('a_') ? 'gif' : 'png';
        dPfp.src = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.${ext}?size=256`;

        // Update Banner if available via Lanyard (sometimes provided)
        const dBanner = document.getElementById('discord-banner');
        if (data.discord_user.banner) {
            const bannerExt = data.discord_user.banner.startsWith('a_') ? 'gif' : 'png';
            dBanner.style.backgroundImage = `url(https://cdn.discordapp.com/banners/${data.discord_user.id}/${data.discord_user.banner}.${bannerExt}?size=512)`;
        }

        // Update Status Dot Color
        dStatus.className = `status-dot ${data.discord_status}`;

        // Update Username
        dUsername.innerText = data.discord_user.username;

        // Custom status bubble is handled via HTML statically
    }

    // ---- Entry & Audio Logic ----
    let hasStarted = false;

    clickOverlay.addEventListener('click', () => {
        if (hasStarted) return;
        hasStarted = true;

        // Fade out overlay
        clickOverlay.style.opacity = '0';
        setTimeout(() => clickOverlay.style.display = 'none', 800);

        // Show Video
        videoContainer.classList.remove('hidden');
        
        // Start video unmuted
        video.volume = 1;
        video.muted = false;
        video.play().catch(e => console.log("Video play failed:", e));

        // Show main content EXACTLY 3 seconds later
        setTimeout(() => {
            mainContent.classList.remove('hidden');
            mainContent.classList.add('visible');
        }, 3000);
    });

    // Audio Controls
    muteBtn.addEventListener('click', () => {
        if (video.muted) {
            video.muted = false;
            volumeIcon.src = 'https://api.iconify.design/mdi:volume-high.svg?color=white';
            volumeSlider.value = video.volume || 1;
        } else {
            video.muted = true;
            volumeIcon.src = 'https://api.iconify.design/mdi:volume-off.svg?color=white';
            volumeSlider.value = 0;
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        video.volume = value;
        
        if (value > 0) {
            video.muted = false;
            volumeIcon.src = value > 0.5 
                ? 'https://api.iconify.design/mdi:volume-high.svg?color=white'
                : 'https://api.iconify.design/mdi:volume-medium.svg?color=white';
        } else {
            video.muted = true;
            volumeIcon.src = 'https://api.iconify.design/mdi:volume-off.svg?color=white';
        }
    });
});