"use client";

import { useState } from "react";
import { Article } from "../../types/news";
import SearchBar from "./SearchBar";

export default function NewsList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const fetchArticles = async (keywordsString: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fetch-news?keyword=${encodeURIComponent(keywordsString)}`);
      if (!res.ok) throw new Error("Failed to fetch news");
      const data = await res.json();
      setArticles(data.articles || []);
      setKeywords(
        keywordsString
          .split(",")
          .map((keyword) => keyword.trim().toLowerCase())
          .filter(Boolean)
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLabel = (index: number) => {
    setArticles((prevArticles) =>
      prevArticles.map((article, i) =>
        i === index ? { ...article, label: article.label === 0 ? 1 : 0 } : article
      )
    );
  };

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const highlightKeywords = (text: string) => {
    if (!text || keywords.length === 0) return text;

    const regex = new RegExp(`(${keywords.join("|")})`, "gi");
    return text.replace(regex, (match) => `<mark>${match}</mark>`);
  };

  return (
    <div>
      <SearchBar onSearch={fetchArticles} />

      {/* Counter */}
      <p className="font-bold mb-4">{articles.length} relevant articles found</p>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul className="list-none p-0">
        {articles.map((article, index) => (
          <li key={index} className="py-4 border-b last:border-none">
            {/* Container */}
            <div className="flex items-center space-x-2">
              {/* Dropdown toggle */}
              <button
                onClick={() => toggleExpand(index)}
                aria-label="Toggle details"
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <span
                  className={`transition-transform ${
                    expandedIndices.has(index) ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
              </button>

              {/* Title, Source, and PublishedAt */}
              <div className="flex-grow">
                <h3 className="font-medium text-lg">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(article.title),
                    }}
                  ></a>
                </h3>
                <p className="text-sm text-gray-600">
                  <strong>Source:</strong> {article.source.name} |{" "}
                  <strong>Published:</strong> {new Date(article.publishedAt).toLocaleString()}
                </p>
              </div>

              {/* Checkbox */}
              <input
                type="checkbox"
                checked={article.label === 1}
                onChange={() => toggleLabel(index)}
                className="ml-2"
              />
            </div>

            {/* Expanded Content */}
            <div
              className={`transition-all duration-300 ${
                expandedIndices.has(index) ? "block mt-4" : "hidden"
              }`}
            >
              {article.description && (
                <p className="text-gray-800">
                  <strong>Description:</strong>{" "}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(article.description),
                    }}
                  ></span>
                </p>
              )}
              {article.content && (
                <p className="text-gray-800 mt-2">
                  <strong>Content:</strong>{" "}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(article.content),
                    }}
                  ></span>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
