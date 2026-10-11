# ✨ TypoFixer Web Extension

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Tested with Bun](https://img.shields.io/badge/tested%20with-bun-f472b6.svg)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Chrome & Brave](https://img.shields.io/badge/Browser-Chrome%20%7C%20Brave%20%7C%20Edge%20%7C%20Firefox-success)](https://github.com/domz-1/typo-fixer-extension)

> **Smart Bilingual Typo Fixer & Accidental Keyboard Layout Converter** (Arabic ⇄ English) for Chrome, Brave, Edge, and Firefox.
> Press **`Alt + Q`** in any input, textarea, or contenteditable field to fix typos and convert reversed layouts instantly in-place!

---

## 🌟 Key Features

- **⚡ Instant In-Place Correction (`Alt + Q`)**:
  - Works anywhere on the web: Google Docs, Gmail, WhatsApp Web, Slack, Notion, ChatGPT, GitHub, LinkedIn, Twitter/X, Discord, and any text form!
  - Replaces text immediately in the active input without reloading or losing focus.
- **🔀 Bilingual Keyboard Layout Recovery (Arabic ⇄ English)**:
  - Accidentally typed English while on Arabic layout? (e.g. `sghl ugd;l` ➔ `سلام عليكم`, `;dt phg;` ➔ `كيف حالك`).
  - Accidentally typed Arabic while on English layout? (e.g. `غخعفعلاث` ➔ `Youtube`, `لخخل` ➔ `Google`, `بثف` ➔ `Git`).
- **🪄 Floating Magic Wand (`🪄`)**:
  - Optional subtle floating button appearing near the input field when an error is detected. Click once to fix!
- **🎨 Glassmorphic HUD & Undo**:
  - Floating toast notification displays the original vs. fixed text with an **Undo** button.
- **🧪 Interactive Popup Playground**:
  - Open the extension popup anytime to test corrections live with stats tracking (words fixed, layout swaps saved, time saved).
- **📝 Personal Snippets Expander**:
  - Add your custom text expansions (e.g., `ty` ➔ `Thank you`, `brb` ➔ `Be right back`).

---

## 📦 How to Install & Use (1 Minute Setup)

### In Google Chrome / Brave / Microsoft Edge:

1. Open your browser and navigate to the Extensions page:
   - **Brave**: `brave://extensions`
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
2. Enable **Developer mode** (toggle switch in the top-right corner).
3. Click the **Load unpacked** button (top-left).
4. Select the directory:
   ```
   /home/adham/projects/typo-fixer-extension
   ```
5. Pin the **TypoFixer** icon in your browser toolbar! 🎉

---

## 🎮 How to Use

1. Click into any input field, textarea, or chat box on any website.
2. Type whatever you want (even with typos or wrong keyboard layout):
   - Example 1: `teh wnat to amke pelase`
   - Example 2: `sghl ugd;l`
   - Example 3: `غخعفعلاث`
3. Press **`Alt + Q`** (or click the floating wand `🪄` or right-click ➔ **✨ Fix Typo & Layout**).
4. Watch it instantly transform into clean, corrected text!

---

## 🛠️ Development & Testing

Built with zero external runtime dependencies for maximum speed and security.

```bash
# Run unit tests
bun test

# Format code
bun run format
```

---

## 📄 License

MIT License © 2026 Adham ([@domz-1](https://github.com/domz-1))
