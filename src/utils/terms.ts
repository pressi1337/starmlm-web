/**
 * The Terms & Conditions are stored as ONE HTML field, edited in the admin
 * panel, holding the Tamil clauses followed by the English ones. The app shows
 * a language toggle, so the single field has to be cut in two at read time —
 * that way the terms stay editable in exactly one place.
 *
 * The cut is made on a paragraph whose entire text is just the language name
 * ("தமிழ்" / "ENGLISH"). Anything before the first marker is treated as a
 * shared header (the company name and title) and shown under both languages.
 *
 * If either marker is missing — an admin pasted a document without them — the
 * whole content is returned for both languages and `hasBoth` is false, so the
 * caller can hide the toggle instead of showing a blank panel.
 */

export type SplitTerms = {
  header: string;
  tamil: string;
  english: string;
  hasBoth: boolean;
};

/** Locate a <p> whose text content is exactly one of `words`. */
function findMarker(html: string, words: string[]) {
  const block = /<(p|h[1-6]|div)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const wanted = words.map((w) => w.toLowerCase());
  let match: RegExpExecArray | null;

  while ((match = block.exec(html)) !== null) {
    const text = match[2]
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/[\s:：.-]+$/g, "")
      .trim()
      .toLowerCase();

    if (wanted.indexOf(text) !== -1) {
      return { start: match.index, end: block.lastIndex };
    }
  }
  return null;
}

export function splitTermsByLanguage(html?: string | null): SplitTerms {
  const content = (html || "").trim();
  if (!content) {
    return { header: "", tamil: "", english: "", hasBoth: false };
  }

  const ta = findMarker(content, ["தமிழ்", "tamil"]);
  const en = findMarker(content, ["english", "ஆங்கிலம்"]);

  // Both markers must be present, and Tamil must come first.
  if (!ta || !en || en.start <= ta.start) {
    return { header: "", tamil: content, english: content, hasBoth: false };
  }

  return {
    header: content.slice(0, ta.start),
    tamil: content.slice(ta.end, en.start),
    english: content.slice(en.end),
    hasBoth: true,
  };
}
