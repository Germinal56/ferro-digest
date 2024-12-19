"use client";

import { useState } from "react";
import { Article } from "../../types/news";

interface PressRoomProps {
  initialArticles: Article[];
}

export default function PressRoom({ initialArticles }: PressRoomProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [extractionDone, setExtractionDone] = useState(false);
  const [extractedList, setExtractedList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const extractInfo = async () => {
    setLoading(true);
    try {
      // Call extract-info API
      const response = await fetch("/api/extract-info", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ articles })
      });
      const data = await response.json();
      // data.listOfStrings - assume endpoint returns { list: string[] }
      setExtractedList(data.list || []);
      setExtractionDone(true);
      setArticles([]); // clear articles
    } catch (error) {
      console.error("Extraction error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Move item up or down in extractedList
  const moveItem = (index: number, direction: -1 | 1) => {
    const newList = [...extractedList];
    const [item] = newList.splice(index, 1);
    newList.splice(index + direction, 0, item);
    setExtractedList(newList);
  };

  const removeItem = (index: number) => {
    const newList = extractedList.filter((_, i) => i !== index);
    setExtractedList(newList);
  };

  return (
    <div style={{ padding: "36px", fontFamily: "Open Sans, sans-serif", fontWeight:"600"}}>
      <h1 className="mb-2 font-black text-4xl">4. ESTRAPOLA INFORMAZIONI</h1>

      {loading && <p>Loading...</p>}

      {!extractionDone && articles.length > 0 && (
        <div>
          <p>{articles.length} articles selected:</p>
          <ul className="list-none p-0">
            {articles.map((article, index) => (
              <li key={index} className="py-4 border-b last:border-none">
                <h3 className="font-medium text-lg">{article.title}</h3>
                <p className="text-sm text-gray-600">
                  <strong>Source:</strong> {article.source?.name} |{" "}
                  <strong>Published:</strong> {new Date(article.publishedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {extractionDone && (
        <div>
          <ul className="list-disc pl-5">
            {extractedList.map((item, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span>{item}</span>
                <button
                  onClick={() => index > 0 && moveItem(index, -1)}
                  disabled={index === 0}
                  style={{ backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "3px", padding: "5px"}}
                >
                  ↑
                </button>
                <button
                  onClick={() => index < extractedList.length - 1 && moveItem(index, 1)}
                  disabled={index === extractedList.length - 1}
                  style={{ backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "3px", padding: "5px"}}
                >
                  ↓
                </button>
                <button
                  onClick={() => removeItem(index)}
                  style={{ backgroundColor: "red", color: "#fff", border: "none", borderRadius: "3px", padding: "5px"}}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
        {!extractionDone && articles.length > 0 && (
          <button
            onClick={extractInfo}
            disabled={loading}
            style={{
              marginRight: "10px",
              padding: "10px 20px",
              backgroundColor: loading ? "#aaa" : "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Extract
          </button>
        )}

        {/* Crea Post button enabled only after extraction */}
        <button
          disabled={!extractionDone || extractedList.length === 0}
          style={{
            padding: "10px 20px",
            backgroundColor: (!extractionDone || extractedList.length === 0) ? "#aaa" : "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: (!extractionDone || extractedList.length === 0) ? "not-allowed" : "pointer",
          }}
        >
          Crea Post
        </button>
      </div>
    </div>
  );
}
