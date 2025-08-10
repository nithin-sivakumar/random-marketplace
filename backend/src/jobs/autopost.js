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

  const prompt = `Write a long, deeply thoughtful, markdown-formatted article (max. 1500-2000 words) on ${category}. 
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
Use inline css to style the context (font size, font weight, color, etc.)

Output format: JSON
{
  "title": "post-title-here-wihtout-special-characters",
  "content": "post-content-here-in-html-and-ensure-proper-closing-tags-don't-render-title-here",
  "category": "category-here-in-title-case-mandatorily",
  "caption": "clickbait-one-line-summary-of-this-entire-document",
  "isPremium": ${randomBooleanValue},
}
`;

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
