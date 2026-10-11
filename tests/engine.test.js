import { describe, expect, test } from "bun:test";
const engine = require("../core/engine.js");

describe("TypoFixer Engine Tests", () => {
  test("fixes common English typos", () => {
    const res = engine.fixText("teh wnat to amke pelase");
    expect(res.fixed).toBe("The want to make please");
    expect(res.isChanged).toBe(true);
  });

  test("recovers accidental English-to-Arabic keyboard layout", () => {
    const res = engine.fixText("sghl ugd;l");
    expect(res.fixed).toBe("سلام عليكم");
    expect(res.layoutSwapped).toBe(true);
    expect(res.layoutDirection).toBe("en-to-ar");
  });

  test("recovers accidental Arabic-to-English keyboard layout", () => {
    const res = engine.fixText("غخعفعلاث");
    expect(res.fixed).toBe("Youtube");
    expect(res.layoutSwapped).toBe(true);
    expect(res.layoutDirection).toBe("ar-to-en");

    const fullSentence = engine.fixText("ِةثثى 'خاشةثي ÷س فاث لاثسف غخعفعلاثق");
    expect(fullSentence.fixed).toBe("Ameen Mohamed Is the best youtuber");
    expect(fullSentence.layoutSwapped).toBe(true);
  });

  test("formats capitalization and question mark", () => {
    const res = engine.fixText("what are you doing thsi day");
    expect(res.fixed).toBe("What are you doing this day?");
  });

  test("expands custom user snippets", () => {
    const res = engine.fixText("ty and brb", {
      customSnippets: {
        ty: "thank you",
        brb: "be right back",
      },
    });
    expect(res.fixed).toBe("Thank you and be right back");
  });

  test("fixes Arabic common spelling errors", () => {
    const res = engine.fixText("انشاءالله شكراا جدا");
    expect(res.fixed).toBe("إن شاء الله شكراً جداً");
  });
});
