/**
 * TypoFixer Core Engine
 * Bilingual layout correction (Arabic <-> English), spell checking, and auto-formatting.
 */

(function (root, factory) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.TypoFixerEngine = factory();
  }
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof self !== "undefined"
      ? self
      : this,
  function () {
    "use strict";

    const EN_CHARS =
      "qwertyuiop[]asdfghjkl;'zxcvbnm,./`QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>?~";
    const AR_CHARS =
      'ضصثقفغعهخحجدشسيبلاتنمكطئءؤرىةوزظذًٌَُلإإ‘÷×؛<>ٍِ][لأأـ،/:"~ْ}{لآآ’،.؟ّ';

    const EN_TO_AR = {};
    const AR_TO_EN = {};

    for (let i = 0; i < EN_CHARS.length; i++) {
      const e = EN_CHARS[i];
      const a = AR_CHARS[i];
      EN_TO_AR[e] = a;
      AR_TO_EN[a] = e;
    }

    // Ligatures handling
    EN_TO_AR["b"] = "لا";
    AR_TO_EN["لا"] = "b";
    AR_TO_EN["لأ"] = "G";
    AR_TO_EN["لإ"] = "T";
    AR_TO_EN["لآ"] = "B";

    const COMMON_TYPOS = {
      // Common English typos
      teh: "the",
      wnat: "want",
      amke: "make",
      waht: "what",
      taht: "that",
      thsi: "this",
      thse: "these",
      wiht: "with",
      fro: "for",
      ot: "to",
      adn: "and",
      nad: "and",
      shcool: "school",
      becuase: "because",
      cuz: "because",
      bc: "because",
      bcoz: "because",
      definately: "definitely",
      definetly: "definitely",
      seperate: "separate",
      seperated: "separated",
      occured: "occurred",
      untill: "until",
      recieve: "receive",
      recieved: "received",
      recieving: "receiving",
      wierd: "weird",
      alot: "a lot",
      accommodate: "accommodate",
      accomodate: "accommodate",
      embarass: "embarrass",
      embarassed: "embarrassed",
      tommorrow: "tomorrow",
      tomorow: "tomorrow",
      neccessary: "necessary",
      necesary: "necessary",
      exiosn: "extension",
      exiossn: "extension",
      exison: "extension",
      exiosns: "extensions",
      shorcir: "shortcut",
      pelae: "please",
      pelase: "please",
      pleae: "please",
      pls: "please",
      plz: "please",
      speieng: "spelling",
      meistck: "mistake",
      mistakc: "mistake",
      etx: "text",
      past: "paste",
      kb: "keyboard",
      woneely: "wrongly",
      mistyeneg: "mistyping",
      punktuaion: "punctuation",
      arbci: "Arabic",
      wheil: "while",
      wokrirng: "working",
      woudl: "would",
      coudl: "could",
      shoudl: "should",
      idk: "I don't know",
      imo: "in my opinion",
      thx: "thanks",
      ty: "thank you",
      u: "you",
      ur: "your",
      r: "are",
      hes: "he's",
      shes: "she's",
      cant: "can't",
      wont: "won't",
      dont: "don't",
      didnt: "didn't",
      isnt: "isn't",
      arent: "aren't",
      couldnt: "couldn't",
      wouldnt: "wouldn't",
      shouldnt: "shouldn't",
      thats: "that's",
      whats: "what's",
      wheres: "where's",
      hows: "how's",
      whens: "when's",
      theres: "there's",
      theyre: "they're",
      youre: "you're",
      weve: "we've",
      im: "I'm",
      ive: "I've",
      ill: "I'll",

      // Arabic common misspellings & fixes
      انشاءالله: "إن شاء الله",
      انشالله: "إن شاء الله",
      "انشاء الله": "إن شاء الله",
      لاكن: "لكن",
      هاذا: "هذا",
      هاذه: "هذه",
      اللذي: "الذي",
      التي: "التي",
      شكراا: "شكراً",
      شكرا: "شكراً",
      جدا: "جداً",
      ايضا: "أيضاً",
      دائما: "دائماً",
      مبروك: "مبارك",
    };

    const COMMON_ARABIC_WORDS = new Set([
      "سلام",
      "عليكم",
      "مرحبا",
      "اهلا",
      "أهلا",
      "الان",
      "الآن",
      "كيف",
      "حالك",
      "شكرا",
      "شكراً",
      "نعم",
      "لا",
      "صباح",
      "مساء",
      "الخير",
      "النور",
      "الله",
      "إن",
      "شاء",
      "في",
      "من",
      "على",
      "عن",
      "مع",
      "الى",
      "إلى",
      "هذا",
      "هذه",
      "ذلك",
      "تلك",
      "هو",
      "هي",
      "هم",
      "نحن",
      "أنا",
      "انا",
      "انت",
      "أنت",
      "انتم",
      "أنتم",
      "كان",
      "يكون",
      "تكون",
      "تم",
      "تطبيق",
      "نظام",
      "برنامج",
      "ملف",
      "كتابة",
      "عايز",
      "محتاج",
      "ممكن",
      "فين",
      "ليه",
      "ازاي",
      "إزاي",
      "شغال",
      "مش",
      "كله",
      "تمام",
      "يا",
      "اخي",
      "أخي",
      "جميل",
      "حلو",
      "كويس",
      "شكر",
      "معك",
      "معي",
      "عندي",
      "عندك",
      "فيه",
      "فيها",
      "منك",
      "مني",
      "جوجل",
      "يوتيوب",
      "فيسبوك",
      "تويتر",
      "واتساب",
      "انستغرام",
      "موقع",
      "صفحة",
      "رابط",
      "كود",
      "مشروع",
      "تطوير",
      "بيانات",
      "تصميم",
    ]);

    const COMMON_ENGLISH_WORDS = new Set([
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "i",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
      "this",
      "but",
      "his",
      "by",
      "from",
      "they",
      "we",
      "say",
      "her",
      "she",
      "or",
      "an",
      "will",
      "my",
      "one",
      "all",
      "would",
      "there",
      "their",
      "what",
      "so",
      "up",
      "out",
      "if",
      "about",
      "who",
      "get",
      "which",
      "go",
      "me",
      "when",
      "make",
      "can",
      "like",
      "time",
      "no",
      "just",
      "him",
      "know",
      "take",
      "people",
      "into",
      "year",
      "your",
      "good",
      "some",
      "could",
      "them",
      "see",
      "other",
      "than",
      "then",
      "now",
      "look",
      "only",
      "come",
      "its",
      "over",
      "think",
      "also",
      "back",
      "after",
      "use",
      "two",
      "how",
      "our",
      "work",
      "first",
      "well",
      "way",
      "even",
      "new",
      "want",
      "because",
      "any",
      "these",
      "give",
      "day",
      "most",
      "us",
      "is",
      "are",
      "was",
      "were",
      "been",
      "has",
      "had",
      "google",
      "youtube",
      "github",
      "git",
      "docker",
      "node",
      "python",
      "react",
      "next",
      "vue",
      "code",
      "project",
      "test",
      "build",
      "run",
      "dev",
      "terminal",
      "extension",
      "file",
      "folder",
      "install",
      "setup",
      "server",
      "port",
      "host",
      "api",
      "url",
      "link",
      "data",
      "database",
      "user",
      "admin",
      "password",
      "email",
      "name",
      "search",
      "page",
      "website",
      "app",
      "error",
      "fix",
      "update",
      "remove",
      "delete",
      "create",
      "add",
      "edit",
      "view",
      "click",
      "press",
      "shortcut",
      "key",
      "value",
      "type",
      "number",
      "string",
      "function",
      "class",
    ]);

    function enToAr(text) {
      let result = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        result += EN_TO_AR[c] || c;
      }
      return result;
    }

    function arToEn(text) {
      let t = text
        .replace(/لا/g, "b")
        .replace(/لأ/g, "G")
        .replace(/لإ/g, "T")
        .replace(/لآ/g, "B");
      let result = "";
      for (let i = 0; i < t.length; i++) {
        const c = t[i];
        result += AR_TO_EN[c] || c;
      }
      return result;
    }

    function detectAccidentalLayout(text) {
      if (!text) return { text: "", swapped: false, direction: "none" };

      const hasAr = /[\u0600-\u06FF]/.test(text);
      const hasEn = /[a-zA-Z]/.test(text);

      // 1. Text contains Arabic characters, no English
      if (hasAr && !hasEn) {
        const arWords = text
          .split(/\s+/)
          .map((w) => w.replace(/[^\u0600-\u06FF]/g, ""))
          .filter(Boolean);
        const validArCount = arWords.filter((w) =>
          COMMON_ARABIC_WORDS.has(w),
        ).length;

        const converted = arToEn(text);
        const enWords = converted
          .toLowerCase()
          .split(/\s+/)
          .map((w) => w.replace(/[^a-z]/g, ""))
          .filter(Boolean);
        const validEnCount = enWords.filter(
          (w) => COMMON_ENGLISH_WORDS.has(w) || COMMON_TYPOS[w],
        ).length;

        if (
          validEnCount > 0 &&
          (validEnCount >= enWords.length * 0.4 || validEnCount > validArCount)
        ) {
          return { text: converted, swapped: true, direction: "ar-to-en" };
        }
        return { text, swapped: false, direction: "ar" };
      }

      // 2. Text contains English characters, no Arabic
      if (hasEn && !hasAr) {
        const enWords = text
          .toLowerCase()
          .split(/\s+/)
          .map((w) => w.replace(/[^a-z]/g, ""))
          .filter(Boolean);
        const validEnCount = enWords.filter(
          (w) =>
            COMMON_ENGLISH_WORDS.has(w) || COMMON_TYPOS[w] || w.length <= 2,
        ).length;

        if (validEnCount >= enWords.length * 0.4) {
          return { text, swapped: false, direction: "en" };
        }

        const converted = enToAr(text);
        const arWords = converted
          .split(/\s+/)
          .map((w) => w.replace(/[^\u0600-\u06FF]/g, ""))
          .filter(Boolean);
        const validArCount = arWords.filter((w) =>
          COMMON_ARABIC_WORDS.has(w),
        ).length;

        if (validArCount > 0 && validArCount >= arWords.length * 0.35) {
          return { text: converted, swapped: true, direction: "en-to-ar" };
        }
        return { text, swapped: false, direction: "en" };
      }

      return { text, swapped: false, direction: "mixed" };
    }

    function correctWord(w, customMap = {}) {
      const matchPunct = w.match(
        /^([^a-zA-Z0-9\u0600-\u06FF]*)(.*?)([^a-zA-Z0-9\u0600-\u06FF]*)$/,
      );
      if (!matchPunct) return w;

      const prefix = matchPunct[1];
      const core = matchPunct[2];
      const suffix = matchPunct[3];

      if (!core) return w;

      const lowerCore = core.toLowerCase();

      // User custom snippet map
      if (customMap && customMap[lowerCore]) {
        return prefix + customMap[lowerCore] + suffix;
      }

      // Typo map
      if (COMMON_TYPOS[lowerCore]) {
        let rep = COMMON_TYPOS[lowerCore];
        if (core === core.toUpperCase() && core.length > 1) {
          rep = rep.toUpperCase();
        } else if (core[0] === core[0].toUpperCase()) {
          rep = rep.charAt(0).toUpperCase() + rep.slice(1);
        }
        return prefix + rep + suffix;
      }

      return w;
    }

    function formatPunctuationAndCaps(text) {
      if (!text) return "";
      let t = text.trim();

      if (/^[a-z]/.test(t)) {
        t = t.charAt(0).toUpperCase() + t.slice(1);
      }

      const questionWords = [
        "what",
        "who",
        "where",
        "when",
        "why",
        "how",
        "is",
        "are",
        "can",
        "could",
        "would",
        "do",
        "does",
        "did",
        "should",
        "will",
      ];
      const firstWord = t
        .split(/\s+/)[0]
        .toLowerCase()
        .replace(/[^a-z]/g, "");
      if (questionWords.includes(firstWord) && !/[?.!]$/.test(t)) {
        t += "?";
      }

      return t;
    }

    function fixText(inputText, options = {}) {
      if (!inputText || !inputText.trim())
        return { original: inputText, fixed: inputText, isChanged: false };

      let text = inputText;
      let layoutSwapped = false;
      let layoutDirection = "none";

      // 1. Accidental keyboard layout recovery
      if (options.autoLayout !== false) {
        const layoutRes = detectAccidentalLayout(text);
        if (layoutRes.swapped) {
          text = layoutRes.text;
          layoutSwapped = true;
          layoutDirection = layoutRes.direction;
        }
      }

      // 2. Dictionary & Typo Correction
      const customMap = options.customSnippets || {};
      const words = text.split(/(\s+)/);
      text = words
        .map((chunk) => {
          if (/\s+/.test(chunk)) return chunk;
          return correctWord(chunk, customMap);
        })
        .join("");

      // 3. Punctuation & Capitalization
      if (options.autoFormat !== false) {
        text = formatPunctuationAndCaps(text);
      }

      return {
        original: inputText,
        fixed: text,
        isChanged: text !== inputText,
        layoutSwapped,
        layoutDirection,
      };
    }

    return {
      EN_TO_AR,
      AR_TO_EN,
      COMMON_TYPOS,
      COMMON_ARABIC_WORDS,
      COMMON_ENGLISH_WORDS,
      enToAr,
      arToEn,
      detectAccidentalLayout,
      correctWord,
      formatPunctuationAndCaps,
      fixText,
    };
  },
);
