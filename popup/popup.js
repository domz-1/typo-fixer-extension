/**
 * TypoFixer Popup Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const testInput = document.getElementById("test-input");
  const btnTestFix = document.getElementById("btn-test-fix");
  const btnTestClear = document.getElementById("btn-test-clear");
  const testResult = document.getElementById("test-result");
  const resultBadge = document.getElementById("result-badge");
  const resultContent = document.getElementById("result-content");

  const statFixes = document.getElementById("stat-fixes");
  const statLayouts = document.getElementById("stat-layouts");
  const statTime = document.getElementById("stat-time");

  const toggleLayout = document.getElementById("toggle-layout");
  const toggleWand = document.getElementById("toggle-wand");
  const toggleFormat = document.getElementById("toggle-format");
  const toggleToast = document.getElementById("toggle-toast");

  const snippetKey = document.getElementById("snippet-key");
  const snippetVal = document.getElementById("snippet-val");
  const btnAddSnippet = document.getElementById("btn-add-snippet");
  const snippetList = document.getElementById("snippet-list");

  let currentSettings = {
    autoLayout: true,
    autoFormat: true,
    showFloatingWand: true,
    showToast: true,
    customSnippets: {},
    stats: { totalFixes: 0, layoutSwaps: 0 },
  };

  // Load state from Chrome Storage
  function loadState() {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(null, (data) => {
        if (data) {
          currentSettings = { ...currentSettings, ...data };
          updateUI();
        }
      });
    } else {
      updateUI();
    }
  }

  function updateUI() {
    // Toggles
    toggleLayout.checked = currentSettings.autoLayout !== false;
    toggleWand.checked = currentSettings.showFloatingWand !== false;
    toggleFormat.checked = currentSettings.autoFormat !== false;
    toggleToast.checked = currentSettings.showToast !== false;

    // Stats
    const stats = currentSettings.stats || { totalFixes: 0, layoutSwaps: 0 };
    statFixes.textContent = stats.totalFixes || 0;
    statLayouts.textContent = stats.layoutSwaps || 0;

    // Estimate ~2.5s saved per typo/layout recovery
    const secondsSaved = Math.round(
      (stats.totalFixes || 0) * 2.5 + (stats.layoutSwaps || 0) * 3,
    );
    if (secondsSaved >= 60) {
      statTime.textContent = `${(secondsSaved / 60).toFixed(1)}m`;
    } else {
      statTime.textContent = `${secondsSaved}s`;
    }

    // Render snippets
    renderSnippets();
  }

  function saveSetting(key, val) {
    currentSettings[key] = val;
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ [key]: val });
    }
  }

  // Toggle events
  toggleLayout.addEventListener("change", () =>
    saveSetting("autoLayout", toggleLayout.checked),
  );
  toggleWand.addEventListener("change", () =>
    saveSetting("showFloatingWand", toggleWand.checked),
  );
  toggleFormat.addEventListener("change", () =>
    saveSetting("autoFormat", toggleFormat.checked),
  );
  toggleToast.addEventListener("change", () =>
    saveSetting("showToast", toggleToast.checked),
  );

  // Playground Test Fix
  function runPlaygroundFix() {
    const text = testInput.value;
    if (!text || !text.trim() || !window.TypoFixerEngine) {
      testResult.classList.add("hidden");
      return;
    }

    const res = window.TypoFixerEngine.fixText(text, currentSettings);
    testInput.value = res.fixed;

    testResult.classList.remove("hidden");
    resultContent.textContent = res.fixed;

    if (res.layoutSwapped) {
      resultBadge.textContent =
        res.layoutDirection === "en-to-ar" ? "🔀 EN ➔ AR" : "🔀 AR ➔ EN";
      resultBadge.style.background = "rgba(56, 189, 248, 0.2)";
      resultBadge.style.color = "#38bdf8";
    } else if (res.isChanged) {
      resultBadge.textContent = "✨ Fixed";
      resultBadge.style.background = "rgba(34, 197, 94, 0.2)";
      resultBadge.style.color = "#4ade80";
    } else {
      resultBadge.textContent = "✓ Correct";
      resultBadge.style.background = "rgba(148, 163, 184, 0.2)";
      resultBadge.style.color = "#94a3b8";
    }
  }

  btnTestFix.addEventListener("click", runPlaygroundFix);
  btnTestClear.addEventListener("click", () => {
    testInput.value = "";
    testResult.classList.add("hidden");
    testInput.focus();
  });

  // Support Alt+Q in popup textarea
  testInput.addEventListener("keydown", (e) => {
    if (e.altKey && (e.key === "q" || e.key === "Q" || e.code === "KeyQ")) {
      e.preventDefault();
      runPlaygroundFix();
    }
  });

  // Snippets management
  function renderSnippets() {
    snippetList.innerHTML = "";
    const map = currentSettings.customSnippets || {};
    const keys = Object.keys(map);

    if (keys.length === 0) {
      snippetList.innerHTML =
        '<span style="color:#64748b;font-size:11px;">No custom snippets yet. Add one above!</span>';
      return;
    }

    keys.forEach((k) => {
      const v = map[k];
      const tag = document.createElement("div");
      tag.className = "snippet-tag";
      tag.innerHTML = `
        <strong>${k}</strong>
        <span>➔ ${v}</span>
        <span class="snippet-del" data-key="${k}">&times;</span>
      `;
      snippetList.appendChild(tag);
    });

    snippetList.querySelectorAll(".snippet-del").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const key = e.target.getAttribute("data-key");
        delete currentSettings.customSnippets[key];
        saveSetting("customSnippets", currentSettings.customSnippets);
        renderSnippets();
      });
    });
  }

  btnAddSnippet.addEventListener("click", () => {
    const k = snippetKey.value.trim().toLowerCase();
    const v = snippetVal.value.trim();
    if (k && v) {
      if (!currentSettings.customSnippets) currentSettings.customSnippets = {};
      currentSettings.customSnippets[k] = v;
      saveSetting("customSnippets", currentSettings.customSnippets);
      snippetKey.value = "";
      snippetVal.value = "";
      renderSnippets();
    }
  });

  loadState();
});
