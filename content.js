// Enhanced Video Skipper with Quiz Answer Detection
class VideoSkipper {
  constructor() {
    this.videos = [];
    this.originalSpeeds = new Map();
    this.cachedAnswers = [];
    this.networkDetectedAnswer = { text: '', index: -1, meta: {} };
    this.captures = [];
    this.recentDomQueries = [];
    this.logs = [];
    this.isLogging = false;
    this.detectedAnswers = new Map();
    this.init();
  }

  init() {
    this.findVideos();
    this.observeNewVideos();

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sendResponse);
    });

    // Auto-detect answers on page load
    this.autoDetectAnswers();
    this.installNetworkSpies();
  }

  findVideos() {
    this.videos = document.querySelectorAll('video');
    console.log(`Found ${this.videos.length} video(s) on the page`);
  }

  observeNewVideos() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.tagName === 'VIDEO') {
              this.videos = document.querySelectorAll('video');
              console.log(`New video detected. Total videos: ${this.videos.length}`);
            }
            const videos = node.querySelectorAll && node.querySelectorAll('video');
            if (videos && videos.length > 0) {
              this.videos = document.querySelectorAll('video');
              console.log(`New videos detected in subtree. Total videos: ${this.videos.length}`);
            }
          }
        });
      });
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }

  handleMessage(request, sendResponse) {
    switch (request.action) {
      case 'skip':
        this.skipVideo();
        sendResponse({ success: true, message: 'Video skipped' });
        break;
      case 'autoAnswer':
        try {
          const ok = this.autoAnswer();
          sendResponse({ success: ok, message: ok ? 'Answered' : 'Could not determine answer' });
        } catch (e) {
          sendResponse({ success: false, message: e?.message || 'Auto-answer failed' });
        }
        break;
      case 'smartAnswer':
        try {
          this.autoDetectAnswers();
          const ok = this.autoAnswer();
          sendResponse({ success: ok, message: ok ? 'Smart answer detected and applied' : 'Could not detect answer' });
        } catch (e) {
          sendResponse({ success: false, message: e?.message || 'Smart answer failed' });
        }
        break;
      case 'getVideoInfo':
        const info = this.getVideoInfo();
        sendResponse({ success: true, data: info });
        break;
      case 'scanForAnswers':
        try {
          const answers = this.extractCorrectAnswers();
          if (answers.length > 0) {
            this.cachedAnswers = answers;
            this.skipVideo();
          }
          sendResponse({ success: true, data: { answers } });
        } catch (e) {
          sendResponse({ success: false, message: e?.message || 'Scan failed' });
        }
        break;
      case 'startLogging':
        this.startLogging();
        sendResponse({ success: true, message: 'Started logging' });
        break;
      case 'stopLogging':
        this.stopLogging();
        sendResponse({ success: true, message: 'Stopped logging' });
        break;
      case 'getLogs':
        sendResponse({ success: true, data: { logs: this.logs } });
        break;
      case 'clearLogs':
        this.logs = [];
        sendResponse({ success: true, message: 'Cleared logs' });
        break;
      case 'getSmartAnswers':
        sendResponse({ success: true, data: { answers: this.detectedAnswers || new Map() } });
        break;
      default:
        sendResponse({ success: false, message: 'Unknown action' });
    }
  }

  skipVideo() {
    this.videos.forEach((video, index) => {
      const doSkip = () => {
        if (video.duration && !isNaN(video.duration)) {
          try { video.currentTime = Math.max(0, video.duration - 0.1); } catch (_) { }
        } else {
          try { video.currentTime = (video.currentTime || 0) + 300; } catch (_) { }
        }
        console.log(`Skipped video ${index + 1}`);
      };

      if (isNaN(video.duration) || !isFinite(video.duration) || video.duration === 0) {
        const onMeta = () => { doSkip(); video.removeEventListener('loadedmetadata', onMeta); };
        video.addEventListener('loadedmetadata', onMeta, { once: true });
        setTimeout(doSkip, 1000);
      } else {
        doSkip();
      }
    });
  }

  getVideoInfo() {
    const videoInfo = [];
    this.videos.forEach((video, index) => {
      videoInfo.push({
        index: index,
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
        playbackRate: video.playbackRate,
        src: video.src || video.currentSrc
      });
    });

    const quiz = this.extractQuizInfo();
    return {
      count: this.videos.length,
      videos: videoInfo,
      pageTitle: document.title || '',
      correctAnswers: this.cachedAnswers,
      quiz,
      preSubmit: this.networkDetectedAnswer
    };
  }

  // Enhanced answer detection based on your logs
  autoDetectAnswers() {
    console.log('🔍 Auto-detecting answers...');

    // 1. Look for elements with "correct-answer" class (from your logs)
    const correctElements = document.querySelectorAll('.correct-answer, .correct, [class*="correct"]');
    correctElements.forEach(el => {
      const text = el.textContent?.trim();
      if (text && text.length > 0) {
        this.detectedAnswers.set(text, { source: 'correct-class', confidence: 0.9 });
        console.log(`✅ Found correct answer via class: ${text}`);
      }
    });

    // 2. Look for "The correct answer is X" patterns
    const text = document.body?.innerText || '';
    const correctAnswerMatch = text.match(/The correct answer is ([A-Z])/i);
    if (correctAnswerMatch) {
      const answer = correctAnswerMatch[1];
      this.detectedAnswers.set(answer, { source: 'text-pattern', confidence: 0.95 });
      console.log(`✅ Found correct answer via text: ${answer}`);
    }

    // 3. Look for elements with "wrong-answer" class to identify correct ones
    const wrongElements = document.querySelectorAll('.wrong-answer, [class*="wrong"]');
    const allOptions = document.querySelectorAll('li, .option, [role="option"]');

    allOptions.forEach(option => {
      const isWrong = Array.from(wrongElements).includes(option);
      if (!isWrong && option.textContent?.trim()) {
        const text = option.textContent.trim();
        this.detectedAnswers.set(text, { source: 'not-wrong', confidence: 0.7 });
        console.log(`✅ Found potential correct answer: ${text}`);
      }
    });

    // 4. Look for data attributes
    const dataElements = document.querySelectorAll('[data-correct="true"], [data-answer], [data-solution]');
    dataElements.forEach(el => {
      const answer = el.getAttribute('data-answer') || el.getAttribute('data-solution') || el.textContent?.trim();
      if (answer) {
        this.detectedAnswers.set(answer, { source: 'data-attribute', confidence: 0.8 });
        console.log(`✅ Found answer via data attribute: ${answer}`);
      }
    });

    // 5. Look for JavaScript variables
    this.scanJavaScriptForAnswers();

    console.log(`🎯 Total detected answers: ${this.detectedAnswers.size}`);
    return this.detectedAnswers.size > 0;
  }

  scanJavaScriptForAnswers() {
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      const content = script.textContent || '';
      if (content.length > 100 && content.length < 5000) {
        // Look for common patterns
        const patterns = [
          /correctAnswer\s*[=:]\s*["']([^"']+)["']/gi,
          /correct_answer\s*[=:]\s*["']([^"']+)["']/gi,
          /answer\s*[=:]\s*["']([^"']+)["']/gi,
          /solution\s*[=:]\s*["']([^"']+)["']/gi
        ];

        patterns.forEach(pattern => {
          const matches = content.matchAll(pattern);
          for (const match of matches) {
            if (match[1]) {
              const answer = match[1].trim();
              this.detectedAnswers.set(answer, { source: 'javascript', confidence: 0.85 });
              console.log(`✅ Found answer via JavaScript: ${answer}`);
            }
          }
        });
      }
    });
  }

  extractCorrectAnswers() {
    const results = [];
    try {
      const text = document.body?.innerText || '';
      if (!text) return results;

      const lines = text.split(/\r?\n/);
      for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const lower = trimmed.toLowerCase();
        if (lower.includes('correct answer') || lower.includes('the correct answer is')) {
          // Extract answer from line
          const answerMatch = trimmed.match(/[A-Z]\)/);
          if (answerMatch) {
            results.push(answerMatch[0].replace(')', ''));
          }
        }
      }
    } catch (_) { }

    return Array.from(new Set(results));
  }

  extractQuizInfo() {
    const result = { options: [], detectedCorrectText: '', detectedCorrectIndex: -1 };

    try {
      // Look for quiz options
      const container = document.querySelector('#answers ol, .quiz-container, [role="listbox"]');
      if (container) {
        const items = Array.from(container.querySelectorAll('li, .option, [role="option"]'));
        items.forEach((li, idx) => {
          const text = li.textContent?.trim() || '';
          result.options.push({ index: idx, label: text });

          // Check if this option is marked as correct
          const classes = li.className || '';
          if (classes.includes('correct') || classes.includes('correct-answer')) {
            result.detectedCorrectIndex = idx;
            result.detectedCorrectText = text;
          }
        });
      }

      // If we found a correct answer, cache it
      if (result.detectedCorrectText) {
        this.cachedAnswers = Array.from(new Set([...(this.cachedAnswers || []), result.detectedCorrectText]));
      }
    } catch (_) { }

    return result;
  }

  autoAnswer() {
    console.log('🎯 Attempting auto-answer...');

    // Try to find quiz container and options
    const container = this.findQuizContainer();
    if (!container) {
      console.log('❌ No quiz container found');
      return false;
    }

    const items = this.findQuizItems(container);
    if (items.length === 0) {
      console.log('❌ No quiz items found');
      return false;
    }

    console.log(`📝 Found ${items.length} quiz options`);

    // Try to use detected answers
    if (this.detectedAnswers.size > 0) {
      const detectedAnswer = Array.from(this.detectedAnswers.keys())[0];
      console.log(`🧠 Using detected answer: ${detectedAnswer}`);

      const foundIndex = this.findAnswerIndex(items, detectedAnswer);
      if (foundIndex >= 0) {
        return this.clickQuizItem(items[foundIndex], foundIndex);
      }
    }

    // Fallback: look for elements marked as correct
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const classes = item.className || '';
      if (classes.includes('correct') || classes.includes('correct-answer')) {
        console.log(`✅ Found correct option by class: ${item.textContent?.slice(0, 50)}`);
        return this.clickQuizItem(item, i);
      }
    }

    console.log('❌ Could not determine correct answer');
    return false;
  }

  findQuizContainer() {
    const candidates = [
      '#answers ol',
      '.quiz-container',
      '[role="listbox"]',
      '.answers',
      '.options',
      '[data-quiz]',
      '[data-question]'
    ];

    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  findQuizItems(container) {
    const queries = ['li', '[role="option"]', '.option', '.answer-option', 'label'];
    for (const q of queries) {
      const found = Array.from(container.querySelectorAll(q));
      if (found.length >= 2) return found;
    }
    return Array.from(container.querySelectorAll('*'));
  }

  findAnswerIndex(items, answer) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const text = (item.textContent || '').toLowerCase();
      const answerLower = answer.toLowerCase();

      if (text.includes(answerLower) || answerLower.includes(text)) {
        return i;
      }
    }
    return -1;
  }

  clickQuizItem(item, index) {
    try {
      console.log(`🖱️ Clicking quiz item ${index}: ${item.textContent?.slice(0, 50)}`);

      // Try different click targets
      const clickTargets = [
        item.querySelector('input[type="radio"]'),
        item.querySelector('input[type="checkbox"]'),
        item.querySelector('button'),
        item.querySelector('label'),
        item
      ];

      for (const target of clickTargets) {
        if (target) {
          target.scrollIntoView({ block: 'center' });
          target.click();
          console.log(`✅ Successfully clicked: ${target.tagName}`);
          return true;
        }
      }
    } catch (e) {
      console.log(`❌ Failed to click quiz item: ${e.message}`);
    }
    return false;
  }

  installNetworkSpies() {
    if (this._spiesInstalled) return;
    this._spiesInstalled = true;

    // Fetch spy
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      try {
        const clone = res.clone();
        const contentType = clone.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await clone.json();
          this.parseAnswerFromPayload(json);
        }
      } catch (_) { }
      return res;
    };
  }

  parseAnswerFromPayload(payload) {
    try {
      if (!payload || typeof payload !== 'object') return;

      // Look for common answer fields
      const answerFields = ['correctAnswer', 'correct_answer', 'answer', 'solution', 'key'];
      for (const field of answerFields) {
        if (payload[field]) {
          this.detectedAnswers.set(payload[field], { source: 'network', confidence: 0.8 });
          console.log(`✅ Found answer via network: ${payload[field]}`);
        }
      }
    } catch (_) { }
  }

  // Logging functionality
  startLogging() {
    this.isLogging = true;
    this.log('Started comprehensive quiz interaction logging', 'interaction');
  }

  stopLogging() {
    this.isLogging = false;
    this.log('Stopped quiz interaction logging', 'interaction');
  }

  log(message, type = 'interaction', data = null) {
    if (!this.isLogging) return;

    const logEntry = {
      timestamp: Date.now(),
      type: type,
      message: message,
      data: data,
      url: window.location.href
    };

    this.logs.push(logEntry);

    if (this.logs.length > 1000) {
      this.logs.splice(0, this.logs.length - 1000);
    }

    try {
      chrome.runtime.sendMessage({
        action: 'newLog',
        data: logEntry
      });
    } catch (_) { }
  }
}

// Initialize the video skipper
const videoSkipper = new VideoSkipper();

// Re-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      videoSkipper.findVideos();
    }, 1000);
  });
}