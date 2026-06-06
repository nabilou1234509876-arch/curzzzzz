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
    const viewCountEl = document.getElementById('view-count');

    // Discord Elements
    const dPfp = document.getElementById('discord-pfp');
    const dStatus = document.getElementById('discord-status');
    const dUsername = document.getElementById('discord-username');
    const dActivity = document.getElementById('discord-activity');

    // ---- Custom Cursor Glow ----
    document.addEventListener('mousemove', (e) => {
        // Move glow effect smoothly to cursor position
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
    
    // Add click effect for cursor
    document.addEventListener('mousedown', () => cursorGlow.style.transform = 'translate(-50%, -50%) scale(0.8)');
    document.addEventListener('mouseup', () => cursorGlow.style.transform = 'translate(-50%, -50%) scale(1)');

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

        // Update Status Dot Color
        dStatus.className = `status-dot ${data.discord_status}`;

        // Update Username
        dUsername.innerText = data.discord_user.username;

        // Update Activity
        if (data.activities && data.activities.length > 0) {
            // Find a game or custom status
            const customStatus = data.activities.find(a => a.type === 4);
            const game = data.activities.find(a => a.type === 0);

            if (game) {
                dActivity.innerHTML = `<span class="activity-bold">Playing</span> ${game.name}`;
            } else if (customStatus) {
                dActivity.innerHTML = `${customStatus.emoji ? customStatus.emoji.name + ' ' : ''}${customStatus.state || ''}`;
            } else {
                dActivity.innerHTML = `<span class="activity-bold">Playing</span> A professional coder`;
            }
        } else {
            dActivity.innerHTML = `<span class="activity-bold">Playing</span> A professional coder`;
        }
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