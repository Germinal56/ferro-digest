import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// NewsAPI base URL and API key
const NEWS_API_BASE_URL = "https://newsapi.org/v2";
const NEWS_API_KEY = process.env.NEWS_API_KEY;

/**
 * Handles GET requests to fetch news articles based on given keywords.
 */
export async function GET(request) {
  // Extract query parameters from the request URL
  const { searchParams } = new URL(request.url);
  const keywords = searchParams.get("keyword");

  // If no keywords are provided, return a 400 Bad Request response
  if (!keywords) {
    console.error("Keywords are required but not provided");
    return NextResponse.json({ error: "Keywords are required" }, { status: 400 });
  }

  const keywordList = keywords.split(",").map((k) => k.trim()).filter(Boolean); // Split by comma and trim whitespace
  if (keywordList.length === 0) {
    return NextResponse.json({ error: "No valid keywords provided" }, { status: 400 });
  }

  // Get the ISO 8601 date for 20 days ago and 48 hours ago
  const fromDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  try {
    const articlesSet = new Set(); // To track unique article URLs
    const combinedArticles = []; // To store unique articles

    // Fetch news for each keyword
    for (const keyword of keywordList) {
      for (let page = 1; page <= 4; page++) {
        const params = {
          q: keyword, // Search query
          sortBy: "popularity", // Sort articles by relevancy
          apiKey: NEWS_API_KEY, // API key
          from: fromDate, // Articles not older than 48 hours
          page: page.toString(), // Current page
          language: "en",
        };

        try {
          const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, { params });

          if (response.data.status === "ok") {
            const articles = response.data.articles;

            for (const article of articles) {
              // Use article's URL as a unique identifier
              if (!articlesSet.has(article.url)) {
                articlesSet.add(article.url);
                combinedArticles.push({ ...article, label: 1 }); // Add label: 0
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching page ${page} for keyword '${keyword}':`, error.message);
          // Continue to the next page/keyword even if this one fails
        }
      }
    }

    // Return the combined and deduplicated articles
    return NextResponse.json({ articles: combinedArticles });
  } catch (error) {
    console.error("Error fetching news:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch news", details: error.message },
      { status: 500 }
    );
  }
}
