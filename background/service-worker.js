/**
 * TypoFixer Background Service Worker (Manifest V3)
 */

importScripts("/core/engine.js");

const DEFAULT_SETTINGS = {
  autoLayout: true,
  autoFormat: true,
  showFloatingWand: true,
  showToast: true,
  customSnippets: {
    ty: "Thank you",
    brb: "Be right back",
    gm: "Good morning",
  },
  stats: {
    totalFixes: 0,
    layoutSwaps: 0,
  },
};

chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings if not already present
  chrome.storage.local.get(null, (existing) => {
    const toSet = {};
    for (const key in DEFAULT_SETTINGS) {
      if (existing[key] === undefined) {
        toSet[key] = DEFAULT_SETTINGS[key];
      }
    }
    if (Object.keys(toSet).length > 0) {
      chrome.storage.local.set(toSet);
    }
  });

  // Create context menu
  chrome.contextMenus.create({
    id: "typo-fixer-fix",
    title: "✨ Fix Typo & Layout (Alt+Q)",
    contexts: ["selection", "editable"],
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "typo-fixer-fix" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_FIX" });
  }
});

// Handle Keyboard Shortcuts from chrome.commands
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "fix-typo-command" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_FIX" });
  }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "RECORD_FIX") {
    chrome.storage.local.get("stats", (data) => {
      const stats = data.stats || { totalFixes: 0, layoutSwaps: 0 };
      stats.totalFixes += msg.count || 1;
      if (msg.layoutSwapped) {
        stats.layoutSwaps += 1;
      }
      chrome.storage.local.set({ stats });
      sendResponse({ success: true, stats });
    });
    return true;
  }
});
