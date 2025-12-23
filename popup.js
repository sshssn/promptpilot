// Popup Logic for Skippy+

document.addEventListener('DOMContentLoaded', async () => {
    // UI Elements
    const tabs = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.section');
    const openSettingsBtn = document.getElementById('openSettings');

    // Feature Elements
    const videoCountEl = document.getElementById('videoCount');
    const skipBtn = document.getElementById('skipBtn');
    const solveBtn = document.getElementById('solveBtn');
    const answerResult = document.getElementById('answerResult');
    const solverLoading = document.getElementById('solverLoading');

    // --- Tabs Logic ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- Settings Logic (Redirect to Options) ---
    openSettingsBtn.addEventListener('click', () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });

    // --- Skipper Logic ---
    async function updateVideoStats() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        chrome.tabs.sendMessage(tab.id, { action: 'getVideoInfo' }, (response) => {
            if (chrome.runtime.lastError) {
                videoCountEl.textContent = '0 (Refresh Page)';
            } else if (response && response.data) {
                videoCountEl.textContent = response.data.count || 0;
            }
        });
    }

    skipBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            chrome.tabs.sendMessage(tab.id, { action: 'skip' });
        }
    });

    // Initialize Skipper Stats
    updateVideoStats();
    setInterval(updateVideoStats, 2000);

    // --- Solver Logic ---
    solveBtn.addEventListener('click', async () => {
        // UI Reset
        answerResult.style.display = 'none';
        answerResult.textContent = '';
        solverLoading.style.display = 'block';
        solveBtn.disabled = true;

        try {
            // Send message to background to handle capture and solve 
            const response = await chrome.runtime.sendMessage({ action: 'solveScreen' });

            solverLoading.style.display = 'none';
            solveBtn.disabled = false;

            if (response && response.success) {
                answerResult.style.display = 'block';
                answerResult.textContent = response.answer;
            } else {
                answerResult.style.display = 'block';
                answerResult.textContent = `Error: ${response.error || 'Unknown error'}`;
            }

        } catch (e) {
            solverLoading.style.display = 'none';
            solveBtn.disabled = false;
            answerResult.style.display = 'block';
            answerResult.textContent = `Error: ${e.message}`;
        }
    });
});
