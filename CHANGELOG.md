# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2024-12-23

### Added
- **Dedicated Options Page**: Migrated settings from the popup to a standalone `options.html` page for better accessibility and management.
- **Provider Selection**: Added support for switching between **Google Gemini 2.5 Flash** and **OpenAI GPT-4o Mini**.
- **Secure Storage**: Implemented `chrome.storage.sync` logic to securely handle and migrate API keys between providers.
- **Modern UI Overhaul**: Redesigned the options page with a dark, glassmorphism-inspired theme using CSS variables.

### Changed
- **Popup UI**: Simplified the popup interface to focus on core actions, redirecting complex settings to the options page.
- **AI Logic**: Updated `llm_service.js` to handle dynamic provider switching and specific model endpoints.

### Fixed
- Resolved UI issues where dropdown menus in the small popup window were cut off or unusable.
- Fixed legacy API key handling to ensure smooth migration for existing users.

## [0.1.0] - 2024-12-20

### Added
- Initial release of **Skippy+**.
- Core video skipping functionality.
- Basic AI screen solver integration using Gemini 1.5 Flash.
- Quiz interaction logging system.
