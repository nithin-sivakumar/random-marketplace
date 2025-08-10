import Groq from "groq-sdk";
import fetch from "node-fetch";
import cron from "node-cron";
import variables from "../global/variables.js";
import { randomCategoryFetcher } from "../templates/data.js";
import safeJsonParse from "../helpers/json-parser.js";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({ apiKey: variables.GROQ_API_KEY });

const autopostFrequency = variables.AUTO_POST_FREQUENCY;

async function generateContent() {
  const category = randomCategoryFetcher();

  console.log(
    variables.ENVIRONMENT === "dev" &&
      `[DEV] Fetched random category for generation: ${category}`
  );

  const randomBooleanValue = Math.random() < 0.5;

  const prompt = `Write a very long, deeply thoughtful, markdown-formatted article (approx. 3000 words) on ${category}. 
It should keep the user engaged on the article. Make it as interesting, engaging and factual as possible. 
Use sections, examples, frameworks, and a strong conclusion.
Do not make any assumptions, this is a blog post, so data must be factual.

Instructions: Never return summaries, captions, any additional information. Stick to the output format strictly.
Return the response as valid JSON.

NOTE:
Never use things like ** for responses. Prioritize inline css instead for formatting.
Keep style descriptive, and never generate any images/illustrations/tables, etc.
Don't generate random titles, use meaningful, human-like titles.
Content should never include the title
Keep all headings in bold
Use inline css to style the context (font size, font weight, color, etc.)

Output format: JSON
{
  "title": "post-title-here",
  "content": "post-content-here-in-html-and-ensure-proper-closing-tags-don't-render-title-here",
  "category": "category-here-in-title-case-mandatorily",
  "isPremium": ${randomBooleanValue}
}
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-20b",
    });

    const content = completion.choices[0].message.content;
    console.log(
      variables.ENVIRONMENT === "dev" && `[DEV] AI generated content start`
    );
    console.log(variables.ENVIRONMENT === "dev" && `${content}`);
    console.log(
      variables.ENVIRONMENT === "dev" && `[DEV] AI generated content end`
    );

    const parsedResult = safeJsonParse(content);

    console.log(variables.ENVIRONMENT === "dev" && `[DEV] Parsed result start`);
    console.log(variables.ENVIRONMENT === "dev" && `${parsedResult}`);
    console.log(variables.ENVIRONMENT === "dev" && `[DEV] Parsed result end`);

    if (parsedResult.success) {
      console.log("✅ Clean JSON found!");
      return parsedResult.data;
    } else {
      console.error("❌ Error parsing JSON from LLM response!");
      return null;
    }
  } catch (error) {
    console.error("❌ Error generating content with Groq:", error.message);
    return null;
  }
}

async function generateContentWithGemini() {
  const category = randomCategoryFetcher();

  console.log(
    variables.ENVIRONMENT === "dev" &&
      `[DEV] Fetched random category for generation: ${category}`
  );

  const randomBooleanValue = Math.random() < 0.5;

  const old_prompt = `Write a long, deeply thoughtful, markdown-formatted article (max. 1500-2000 words) on ${category}. 
It should keep the user engaged on the article. Make it as interesting, engaging and factual as possible. 
Use sections, examples, frameworks, and a strong conclusion.
Do not make any assumptions, this is a blog post, so data must be factual.

Instructions: Never return summaries, captions, any additional information. Stick to the output format strictly.
Return the response as valid JSON.

NOTE:
Don't include any special characters in the title
Never use things like ** for responses. Prioritize inline css instead for formatting.
Keep style descriptive, and never generate any images/illustrations/tables, etc.
Don't generate random titles, use meaningful, human-like titles.
Content should never include the title
Keep all headings in bold
Use inline css to style the context (Use only font weight and color CSS properties. Use only vertical spacing, no horizontal spacing).

Output format: JSON
{
  "title": "post-title-here-wihtout-special-characters",
  "content": "post-content-here-in-html-and-ensure-proper-closing-tags-don't-render-title-here",
  "category": "category-here-in-title-case-mandatorily",
  "caption": "clickbait-one-line-summary-of-this-entire-document",
  "isPremium": ${randomBooleanValue},
}
`;

  const prompt = `Write a long, deeply thoughtful, HTML-formatted article (1500–2000 words) on ${category}.
It should keep the reader engaged. Make it interesting, insightful and factual.
Use clear sections, examples, small frameworks/steps, and end with a strong conclusion.

IMPORTANT: The final output MUST be a single, valid JSON object (no extra text before/after, no explanations).
Return JSON exactly in this shape and key order:
{
  "title": "post-title-here-without-special-characters",
  "content": "post-content-here-in-html-and-ensure-proper-closing-tags-don't-render-title-here",
  "category": "Category-Here-In-Title-Case",
  "caption": "clickbait-one-line-summary-of-this-entire-document",
  "isPremium": ${randomBooleanValue}
}

STRICT HTML & STYLE RULES (must follow exactly):
1. The **content** value must be valid HTML (not Markdown). Do NOT include the title in the content.
2. Allowed tags only: <div>, <p>, <strong>, <span>, <em>, <ul>, <ol>, <li>. Do NOT use <h1>-<h6>, <img>, <br>, <table>, or other tags.
3. **All headings must be bold.** Represent them using <strong> and a block container:
   Example: <div style='font-weight:700;margin-top:20px'><strong>Section Heading</strong></div>
4. Paragraphs must be wrapped in <p> and use vertical spacing via margin-top:
   Example: <p style='margin-top:12px'>Your paragraph text here.</p>
5. Inline CSS allowed **only** for these properties: font-weight, color, margin-top (for vertical spacing).
   - Use CSS exactly in the style attribute and use single quotes for attribute values.
   - Example attribute usage: style='font-weight:700;color:#222;margin-top:18px'
6. Always use single quotes for HTML attribute values (to avoid breaking JSON double quotes).
7. Every opening tag must have a matching closing tag. No self-closing tags. No overlapping/mismatched tags.
8. Do not include HTML comments or scripts. Do not include raw JSON inside the content.
9. Do NOT use Markdown syntaxes (no '##', no '**', no backticks) anywhere in content.
10. Keep the article factual — where claims need verification, prefer conservative phrasing (e.g., "studies show", "according to X") — but DO NOT add citations or external links in the JSON.

FIELD RULES:
- title: short, human-like, no special characters (use dashes or letters only). Do NOT include the title inside content.
- category: Title Case (e.g., "Artificial Intelligence").
- caption: one-line clickbait-style summary of the whole post (single sentence).
- isPremium: preserve placeholder interpolation ${randomBooleanValue} (do not change its syntax).

VALIDATION NOTE FOR THE MODEL:
- Before emitting the JSON, ensure the content string uses only the allowed tags, all tags are balanced, and single quotes are used for attribute values.
- The assistant must output **only** the JSON object (no surrounding text, no explanation, no extra fields).

Remember: No images, no tables, no external links, no additional fields. Output must parse with JSON.parse(...) without errors.`;

  try {
    const genAI = new GoogleGenerativeAI(variables.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    console.log(
      variables.ENVIRONMENT === "dev" && `[DEV] AI generated content start`
    );
    console.log(variables.ENVIRONMENT === "dev" && `${content}`);
    console.log(
      variables.ENVIRONMENT === "dev" && `[DEV] AI generated content end`
    );

    const parsedResult = safeJsonParse(content);

    console.log(variables.ENVIRONMENT === "dev" && `[DEV] Parsed result start`);
    console.log(variables.ENVIRONMENT === "dev" && `${parsedResult}`);
    console.log(variables.ENVIRONMENT === "dev" && `[DEV] Parsed result end`);

    if (parsedResult.success) {
      console.log("✅ Clean JSON found!");
      return parsedResult.data;
    } else {
      console.error("❌ Error parsing JSON from LLM response!");
      return null;
    }
  } catch (error) {
    console.error("❌ Error generating content with Gemini:", error.message);
    return null;
  }
}

async function postContentToLocalServer(contentObj) {
  try {
    const response = await axios.post(
      `http://localhost:8000/api/content/add`,
      contentObj
    );

    const result = response.data;
    console.log(
      `[${new Date().toLocaleString()}] ✅ POST Success:`,
      result.message
    );
  } catch (error) {
    console.error("❌ Failed to POST content to local server:", error.message);
  }
}

async function generateAndPost() {
  console.log(`[${new Date().toLocaleString()}] ⏳ Generating new content...`);
  const contentObj = await generateContentWithGemini();

  if (contentObj) {
    await postContentToLocalServer(contentObj);
  }
}

// 🕒 Schedule
if (variables.AUTO_POST === "true") {
  generateAndPost();

  setInterval(() => {
    generateAndPost();
  }, autopostFrequency * 1000);
}
// cron.schedule(`*/${autopostFrequency} * * * *`, () => {
//   generateAndPost();
// });

console.log(
  variables.AUTO_POST === "true"
    ? `🚀 Auto-poster is running with node-cron every ${autopostFrequency} second(s).`
    : `🚀 Auto-poster has been disabled 🚀`
);
