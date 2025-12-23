import { LLMService } from './lib/llm_service.js';

const llmService = new LLMService();

// Background script for Skippy+
chrome.runtime.onInstalled.addListener(() => {
  console.log('Skippy+ extension installed');
});

// Capture and Solve Logic
async function handleCaptureAndSolve(request, sender, sendResponse) {
  try {
    // Get all potential keys
    const settings = await chrome.storage.sync.get({
      provider: 'gemini-2.5-flash',
      apiKey: '',
      geminiKey: '',
      openAiKey: ''
    });

    // Determine correct key
    let activeKey = settings.apiKey; // Fallback
    if (settings.provider.startsWith('gemini') && settings.geminiKey) {
      activeKey = settings.geminiKey;
    } else if (settings.provider.startsWith('gpt') && settings.openAiKey) {
      activeKey = settings.openAiKey;
    }

    if (!activeKey) {
      sendResponse({ error: 'API Key not set. Please configure in settings.' });
      return;
    }

    // Capture visible tab
    const dataUrl = await captureTab(sender.tab?.windowId);

    // Solve using LLM
    const answer = await llmService.solve(dataUrl, settings.provider, activeKey);

    sendResponse({ success: true, answer: answer });
  } catch (err) {
    console.error('Solve error:', err);
    sendResponse({ success: false, error: err.message });
  }
}

function captureTab(windowId) {
  return new Promise((resolve, reject) => {
    // Use windowId if provided, else null for current
    const target = windowId || null;
    chrome.tabs.captureVisibleTab(target, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(dataUrl);
      }
    });
  });
}

// Unified Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  if (request.action === 'log') {
    console.log('Content script log:', request.message);
    sendResponse({ received: true });
    return false; // synchronous response
  }

  if (request.action === 'solveScreen') {
    handleCaptureAndSolve(request, sender, sendResponse);
    return true; // asynchronous response
  }

  if (request.action === 'captureVisibleTab') {
    const targetWin = request.windowId || null;
    chrome.tabs.captureVisibleTab(targetWin, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ dataUrl: dataUrl });
      }
    });
    return true;
  }
});

