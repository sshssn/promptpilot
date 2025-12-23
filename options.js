// Logic for Skippy+ Options Page

document.addEventListener('DOMContentLoaded', () => {
    const providerSelect = document.getElementById('providerSelect');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveBtn = document.getElementById('saveBtn');
    const statusMsg = document.getElementById('statusMsg');

    // Store keys in memory after load to swap them instantly
    let keys = {
        gemini: '',
        openai: ''
    };

    // 1. Load Settings
    chrome.storage.sync.get({
        provider: 'gemini-2.5-flash',
        geminiKey: '',
        openAiKey: '',
        apiKey: '' // Legacy fallback
    }, (items) => {
        // Strict mapping logic for provider
        let validProvider = items.provider;
        if (validProvider.includes('gemini') && validProvider !== 'gemini-2.5-flash') {
            validProvider = 'gemini-2.5-flash';
        } else if (validProvider.includes('gpt') || validProvider === 'openai') {
            validProvider = 'gpt-4o-mini';
        }

        // Initialize keys
        // If legacy apiKey exists but specific keys don't, try to migrate it
        // based on the current validProvider
        keys.gemini = items.geminiKey;
        keys.openai = items.openAiKey;

        if (items.apiKey && !keys.gemini && !keys.openai) {
            if (validProvider.includes('gemini')) keys.gemini = items.apiKey;
            if (validProvider.includes('gpt')) keys.openai = items.apiKey;
        }

        // Set UI
        providerSelect.value = validProvider;
        updateInputForProvider(validProvider);
    });

    // 2. Handle Dropdown Change
    providerSelect.addEventListener('change', (e) => {
        // Save the *current* input to memory before switching
        // (Use the PREVIOUS value? No, easier to just update on change)
        // Actually, we should save what's in the box to the relevant key in memory
        // But the box content belongs to the *previous* selection.
        // It's safer to just swap the value shown.
        updateInputForProvider(e.target.value);
    });

    // Update the input field based on selection
    function updateInputForProvider(provider) {
        if (provider.includes('gemini')) {
            apiKeyInput.value = keys.gemini || '';
            apiKeyInput.placeholder = "Enter Google Gemini API Key";
        } else {
            apiKeyInput.value = keys.openai || '';
            apiKeyInput.placeholder = "Enter OpenAI API Key";
        }
    }

    // Capture input changes to memory
    apiKeyInput.addEventListener('input', (e) => {
        const provider = providerSelect.value;
        if (provider.includes('gemini')) {
            keys.gemini = e.target.value.trim();
        } else {
            keys.openai = e.target.value.trim();
        }
    });

    // 3. Save Settings
    saveBtn.addEventListener('click', () => {
        const provider = providerSelect.value;
        // The current input value is authoritative for the allowed provider
        let currentKey = apiKeyInput.value.trim();

        if (provider.includes('gemini')) keys.gemini = currentKey;
        if (provider.includes('gpt')) keys.openai = currentKey;

        if (!currentKey) {
            showStatus('Please enter an API Key for this provider.', true);
            return;
        }

        // Save everything
        // We also save 'apiKey' as the "active" key for background.js to use easily
        chrome.storage.sync.set({
            provider,
            geminiKey: keys.gemini,
            openAiKey: keys.openai,
            apiKey: currentKey
        }, () => {
            showStatus('Settings Saved Successfully!');
        });
    });

    // Helper: Show Status Message
    function showStatus(msg, isError = false) {
        statusMsg.textContent = msg;
        statusMsg.style.color = isError ? '#ff4444' : '#00ff88';
        statusMsg.classList.add('visible');
        setTimeout(() => {
            statusMsg.classList.remove('visible');
        }, 3000);
    }
});
