import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

export async function POST(request) {
  const { articles, customInstruction } = await request.json();

  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: 'new' });
  const finalData = [];

  for (const article of articles) {
    const page = await browser.newPage();
    await page.goto(article.url, { waitUntil: "domcontentloaded" });

    // Remove scripts and styles for cleaner text
    await page.evaluate(() => {
      const scripts = document.querySelectorAll("script, style");
      scripts.forEach(s => s.remove());
    });

    // Extract main text from <p>, <h1>-<h6>
    const content = await page.evaluate(() => {
      const allowedTags = ["P", "H1", "H2", "H3", "H4", "H5", "H6"];
      let texts = [];
      function getTextFrom(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = (node.textContent || "").trim();
          if (text) texts.push(text);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          if (allowedTags.includes(el.tagName)) {
            texts.push(el.innerText.trim());
          } else {
            el.childNodes.forEach(getTextFrom);
          }
        }
      }
      getTextFrom(document.body);
      return texts.filter(t => t.length > 30).join(" ");
    });

    finalData.push({
      ...article,
      full_content: content
    });
    await page.close();
  }

  await browser.close();

  // Save extracted data to /files
  const dir = path.join(process.cwd(), "files");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const filePath = path.join(dir, `extracted-${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(finalData, null, 2));

  // OpenAI configuration
  const openai = new OpenAI({
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPENAI_PROJECT_ID,
  });

  let allExtractedStrings = [];

  for (const item of finalData) {
    // Skip if content < 300 chars
    if (!item.full_content || item.full_content.length < 300) {
      continue; // Skip this article entirely
    }

    // Append custom instruction to the prompt and avoid product promotion
    const prompt = `You are a helpful assistant.\n${customInstruction}\n. Avoid texts that may promote specific products with a specific brand.\n Extract interesting quotes, facts, novel ideas, and statistics from the given article content and return them as a strictly valid JSON array of strings. \nMake sure every item always explain a specific word that is being used or explains from which survey or source, this information comes from so every list item can stand on its own.\n Return no other text.\n\nArticle content:\n${item.full_content}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "user", content: prompt }],
    });

    let responseText = completion.choices[0]?.message?.content?.trim() || "[]";

    // If the response is wrapped in ```json ``` fences, remove them
    if (responseText.startsWith("```json")) {
      // Remove the first line ```json and the ending ```
      responseText = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    }

    let extractedPoints = [];
    try {
      extractedPoints = JSON.parse(responseText);
      if (!Array.isArray(extractedPoints)) {
        extractedPoints = [];
      }
    } catch {
      extractedPoints = [];
    }

    allExtractedStrings.push(...extractedPoints);
  }

  return NextResponse.json({ list: allExtractedStrings });
}
