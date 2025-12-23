# Skippy+ (Beta)

**The Ultimate Video Skipper and AI Screen Solver.**

Skippy+ is a powerful Chrome extension designed to enhance your online learning and browsing experience. It combines intelligent video speed controls with advanced AI capabilities to solve on-screen questions instantly.

![Skippy Logo](128x128.png)

## ✨ New in v0.1.2
- **Dedicated Options Page:** A centralized hub to manage your preferences and API keys securely.
- **Multiple AI Models:** Support for **Google Gemini 2.5 Flash** (Recommended) and **OpenAI GPT-4o Mini**.
- **Modern UI:** A sleek, dark-themed interface for a premium user experience.

## 🚀 Key Features

### 🤖 AI-Powered Screen Solver
- **Instant Answers:** Capture any question on your screen and get an immediate answer using state-of-the-art AI.
- **Model Flexibility:** Choose between the speed of Gemini 1.5/2.5 Flash or the precision of GPT-4o Mini.
- **Secure Key Management:** Your API keys are stored locally in your browser's secure storage.

### ⏩ Video Control
- **Smart Skipping:** Innovative logic to skip videos to the very end instantly.
- **Speed Boost:** Accelerate playback when you just need to skim through content.

### 📊 Advanced Quiz Logging (Legacy)
- **Interaction Capture:** Logs user clicks and form submissions for analysis.
- **Network Monitoring:** Inspects API calls related to quiz data.
- **JSON Export:** Download your interaction logs for offline review.

## 🛠️ Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/sshssn/promptpilot.git
   ```
2. **Load into Chrome:**
   - Navigate to `chrome://extensions/`.
   - Enable **Developer Mode** (top right toggle).
   - Click **Load unpacked**.
   - Select the directory where you cloned the repository.

## ⚙️ Configuration

1. Click the **Skippy+** icon in your toolbar.
2. Select **Settings** (or right-click the icon and choose Options).
3. On the **Options Page**:
   - Choose your preferred **AI Provider** (Gemini or OpenAI).
   - Enter your **API Key**.
   - Click **Save Configuration**.

## 🔒 Privacy & Security

- **Local Processing:** All logging and logic operate locally within your browser.
- **Secure Storage:** API keys are stored in `chrome.storage.sync` and are never shared with third parties (except the respective AI providers when making a request).
- **No Analytics:** We do not track your usage or collect personal data.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

**Made with ❤️ by ssh**