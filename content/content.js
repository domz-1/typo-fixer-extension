/**
 * TypoFixer Content Script
 * Captures Alt+Q, executes bilingual correction, auto-replaces text, and provides HUD feedback.
 */

(function () {
  "use strict";

  let currentSettings = {
    autoLayout: true,
    autoFormat: true,
    showFloatingWand: true,
    showToast: true,
    customSnippets: {},
  };

  let lastUndoState = null;
  let toastTimeout = null;
  let typingTimer = null;
  let activeWandTarget = null;

  // Load settings from storage
  function loadSettings() {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(null, (data) => {
        if (data) {
          currentSettings = { ...currentSettings, ...data };
        }
      });
    }
  }

  loadSettings();
  if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener(() => loadSettings());
  }

  // Inject UI container into DOM
  const hudContainer = document.createElement("div");
  hudContainer.id = "tf-hud-root";
  document.documentElement.appendChild(hudContainer);

  // --- FLOATING TOAST ---
  function showToast(original, fixed, layoutDirection, onUndo) {
    if (!currentSettings.showToast) return;

    let toast = document.getElementById("tf-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "tf-toast";
      toast.className = "tf-toast";
      hudContainer.appendChild(toast);
    }

    let badgeHtml = "";
    if (layoutDirection === "en-to-ar") {
      badgeHtml = '<span class="tf-badge">EN ➔ AR</span>';
    } else if (layoutDirection === "ar-to-en") {
      badgeHtml = '<span class="tf-badge">AR ➔ EN</span>';
    }

    toast.innerHTML = `
      <div class="tf-toast-icon">✨</div>
      <div class="tf-toast-content">
        <div class="tf-toast-title">TypoFixer ${badgeHtml}</div>
        <div class="tf-toast-text" title="${fixed}">${fixed}</div>
      </div>
      <div class="tf-toast-actions">
        <button type="button" class="tf-btn-undo" id="tf-undo-btn">Undo</button>
        <button type="button" class="tf-toast-close" id="tf-close-btn">&times;</button>
      </div>
    `;

    document.getElementById("tf-undo-btn")?.addEventListener("click", () => {
      if (onUndo) onUndo();
      hideToast();
    });

    document
      .getElementById("tf-close-btn")
      ?.addEventListener("click", hideToast);

    // Show with animation
    requestAnimationFrame(() => {
      toast.classList.add("tf-visible");
    });

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(hideToast, 4000);
  }

  function hideToast() {
    const toast = document.getElementById("tf-toast");
    if (toast) {
      toast.classList.remove("tf-visible");
    }
  }

  // --- FLOATING WAND BUTTON ---
  let wandButton = null;
  function getWandButton() {
    if (!wandButton) {
      wandButton = document.createElement("div");
      wandButton.className = "tf-wand-button";
      wandButton.title = "✨ Click to fix typo & layout (Alt+Q)";
      wandButton.innerHTML = "🪄";
      hudContainer.appendChild(wandButton);

      wandButton.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (activeWandTarget) {
          executeFixOnTarget(activeWandTarget);
          hideWand();
        }
      });
    }
    return wandButton;
  }

  function positionWand(targetEl) {
    if (!currentSettings.showFloatingWand || !targetEl) return;
    const btn = getWandButton();
    const rect = targetEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    btn.style.top = `${window.scrollY + rect.top + 6}px`;
    btn.style.left = `${window.scrollX + rect.right - 34}px`;
    btn.classList.add("tf-wand-visible");
    activeWandTarget = targetEl;
  }

  function hideWand() {
    if (wandButton) {
      wandButton.classList.remove("tf-wand-visible");
      activeWandTarget = null;
    }
  }

  // --- TEXT REPLACEMENT LOGIC ---
  function executeFixOnTarget(el) {
    if (!window.TypoFixerEngine) return;

    const isInput =
      el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
    const isContentEditable =
      el.isContentEditable || document.designMode === "on";

    if (isInput) {
      handleInputFix(el);
    } else if (isContentEditable) {
      handleContentEditableFix(el);
    } else {
      // General window selection
      handleSelectionFix();
    }
  }

  function handleInputFix(el) {
    const fullText = el.value || "";
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const hasSelection = start !== end;

    let targetText = "";
    let replaceStart = 0;
    let replaceEnd = 0;

    if (hasSelection) {
      targetText = fullText.substring(start, end);
      replaceStart = start;
      replaceEnd = end;
    } else {
      // No selection: fix entire field or current line
      targetText = fullText;
      replaceStart = 0;
      replaceEnd = fullText.length;
    }

    if (!targetText.trim()) return;

    const res = window.TypoFixerEngine.fixText(targetText, currentSettings);
    if (res.isChanged) {
      lastUndoState = {
        type: "input",
        element: el,
        original: targetText,
        start: replaceStart,
        end: replaceStart + res.fixed.length,
      };

      el.focus();
      el.setSelectionRange(replaceStart, replaceEnd);

      // Framework-friendly replacement
      if (!document.execCommand("insertText", false, res.fixed)) {
        el.setRangeText(res.fixed, replaceStart, replaceEnd, "end");
      }

      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));

      // Record stats
      if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          action: "RECORD_FIX",
          layoutSwapped: res.layoutSwapped,
        });
      }

      showToast(targetText, res.fixed, res.layoutDirection, () => {
        // Undo handler
        el.focus();
        el.setSelectionRange(replaceStart, replaceStart + res.fixed.length);
        if (!document.execCommand("insertText", false, targetText)) {
          el.setRangeText(
            targetText,
            replaceStart,
            replaceStart + res.fixed.length,
            "end",
          );
        }
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
  }

  function handleContentEditableFix(el) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const selectedText = range.toString();

    let textToFix = selectedText;
    let wholeNode = false;

    if (!textToFix) {
      // Fix entire innerText of the editable block
      textToFix = el.innerText || el.textContent || "";
      wholeNode = true;
    }

    if (!textToFix.trim()) return;

    const res = window.TypoFixerEngine.fixText(textToFix, currentSettings);
    if (res.isChanged) {
      const originalText = textToFix;

      if (!wholeNode) {
        document.execCommand("insertText", false, res.fixed);
      } else {
        el.innerText = res.fixed;
      }

      el.dispatchEvent(
        new InputEvent("input", { bubbles: true, cancelable: true }),
      );

      if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          action: "RECORD_FIX",
          layoutSwapped: res.layoutSwapped,
        });
      }

      showToast(originalText, res.fixed, res.layoutDirection, () => {
        if (!wholeNode) {
          document.execCommand("insertText", false, originalText);
        } else {
          el.innerText = originalText;
        }
        el.dispatchEvent(
          new InputEvent("input", { bubbles: true, cancelable: true }),
        );
      });
    }
  }

  function handleSelectionFix() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const selectedText = sel.toString();
    if (!selectedText.trim()) return;

    const res = window.TypoFixerEngine.fixText(selectedText, currentSettings);
    if (res.isChanged) {
      document.execCommand("insertText", false, res.fixed);
      showToast(selectedText, res.fixed, res.layoutDirection);
    }
  }

  // --- EVENT LISTENERS ---
  // Listen for Alt+Q
  window.addEventListener(
    "keydown",
    (e) => {
      // Check for Alt+Q or Option+Q (Mac)
      if (e.altKey && (e.key === "q" || e.key === "Q" || e.code === "KeyQ")) {
        const activeEl = document.activeElement;
        if (activeEl) {
          e.preventDefault();
          e.stopPropagation();
          executeFixOnTarget(activeEl);
        }
      }
    },
    true,
  );

  // Monitor typing for the floating wand helper
  document.addEventListener(
    "input",
    (e) => {
      const target = e.target;
      if (!(
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      )) {
        return;
      }

      clearTimeout(typingTimer);
      hideWand();

      if (!currentSettings.showFloatingWand) return;

      typingTimer = setTimeout(() => {
        const text = target.value || target.innerText || "";
        if (text.length >= 3 && window.TypoFixerEngine) {
          const check = window.TypoFixerEngine.fixText(text, currentSettings);
          if (check.isChanged) {
            positionWand(target);
          }
        }
      }, 700);
    },
    true,
  );

  document.addEventListener(
    "blur",
    (e) => {
      setTimeout(hideWand, 200);
    },
    true,
  );

  // Listen for messages from background (Context Menu or Command)
  if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === "TRIGGER_FIX") {
        const active = document.activeElement || document.body;
        executeFixOnTarget(active);
      }
    });
  }
})();
