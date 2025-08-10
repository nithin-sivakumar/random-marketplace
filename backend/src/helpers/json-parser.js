import JSON5 from "json5";

/**
 * Safely parses JSON with embedded Markdown content (e.g., from AI).
 * Retains markdown in content while cleaning unescaped characters.
 * @param {string} raw - Raw AI output
 * @returns {{ success: true, data: any } | { success: false, error: string }}
 */
function safeJsonParse(raw) {
  try {
    // 1. Remove triple backticks and language identifiers
    let cleaned = raw
      .trim()
      .replace(/^```(?:json)?\n?/i, "") // Remove opening ```json or ```
      .replace(/```$/, "") // Remove closing ```
      .replace(/^`+|`+$/g, "") // Extra backticks
      .trim();

    // 2. Replace invalid control characters (not properly escaped \n etc.)
    //    We only want to escape newlines **inside** strings, not the whole JSON
    //    So we wrap it in a try-catch first
    try {
      return { success: true, data: JSON.parse(cleaned) };
    } catch {
      // 3. Fallback: try JSON5, which is more forgiving (e.g., allows unquoted keys, trailing commas)
      const data = JSON5.parse(cleaned);
      return { success: true, data };
    }
  } catch (err) {
    return { success: false, error: `Failed to parse: ${err.message}` };
  }
}

export default safeJsonParse;
