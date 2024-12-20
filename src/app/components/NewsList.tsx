"use client";

import { useState } from "react";
import { Article } from "../../types/news";
import SearchBar from "./SearchBar";
import { trainClassifier, classifyArticles } from "src/lib/ext-api";

interface NewsListProps {
  onPressRoom: (articles: Article[]) => void;
}

export default function NewsList({ onPressRoom }: NewsListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainError, setTrainError] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<number>(1);
  const [classificationReady, setClassificationReady] = useState(false);
  const [smartFilterLoading, setSmartFilterLoading] = useState(false); // Indicates Smart Filter request in progress

  const fetchArticles = async (keywordsString: string) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        phase === 3
          ? `/api/fetch-news-2-classify?keyword=${encodeURIComponent(keywordsString)}`
          : `/api/fetch-news?keyword=${encodeURIComponent(keywordsString)}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch news");
      const data = await res.json();
      const newArticles = data.articles || [];
      setArticles(newArticles);

      const kwArray = keywordsString
        .split(",")
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean);
      setKeywords(kwArray);

      if (phase !== 3) {
        if (newArticles.length >= 200) {
          setPhase(2);
        } else {
          setPhase(1);
        }
      } else {
        // In phase 3, we just fetched classification articles
        setClassificationReady(true);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const runSmartFilter = async () => {
    setSmartFilterLoading(true);
    setError(null);
    try {
      const classifyRes = await classifyArticles(articles, 0.30);
      const newClassifiedArticles = classifyRes.classified_articles || [];
      if (newClassifiedArticles.length > 0) {
        setArticles(newClassifiedArticles);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSmartFilterLoading(false);
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

  const removeArticle = (index: number) => {
    setArticles((prevArticles) => prevArticles.filter((_, i) => i !== index));
  };

  const exportDataset = () => {
    const dataset = JSON.stringify(articles, null, 2);
    const blob = new Blob([dataset], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dataset.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const trainModel = async () => {
    if (articles.length < 200) {
      setTrainError("Not enough articles to train. At least 200 articles are required.");
      return;
    }

    setTrainError(null);
    setIsTraining(true);

    try {
      const data = await trainClassifier(articles);
      alert(data.message || "Model trained successfully!");
      setPhase(3);
      setClassificationReady(false);
    } catch (err) {
      setTrainError((err as Error).message);
    } finally {
      setIsTraining(false);
    }
  };

  const highlightKeywords = (text: string) => {
    if (!text || keywords.length === 0) return text;
    const regex = new RegExp(`(${keywords.join("|")})`, "gi");
    return text.replace(regex, (match) => `<mark>${match}</mark>`);
  };

  let headingText = "1. INSERISCI PAROLE CHIAVE";
  if (phase === 2) headingText = "2. SELEZIONA ARTICOLI RILEVANTI";
  else if (phase === 3) headingText = "3. VALUTA ARTICOLI RECENTI";

  let instructionText = `${articles.length} articles found, MARK what you find RELEVANT ticking on the right`;
  if (phase === 3) {
    instructionText = `${articles.length} articles found, DESELECT those that you DISLIKE`;
  }

  const selectedArticles = articles.filter((a) => a.label === 1);

  const toggleTrainingClassification = () => {
    if (phase === 3) {
      setPhase(1);
      setArticles([]);
      setKeywords([]);
      setTrainError(null);
      setError(null);
      setClassificationReady(false);
    } else {
      setPhase(3);
      setClassificationReady(false);
    }
  };

  return (
    <div style={{ padding: "36px", fontFamily: "Open Sans, sans-serif", fontWeight: "600" }}>
      <h1 className="mb-2 font-black text-4xl">{headingText}</h1>
      <SearchBar onSearch={fetchArticles} disabledTextarea={isTraining || phase === 3} />

      <p className="font-bold mb-4 text-green-700 text-2xl">{instructionText}</p>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul className="list-none p-0">
        {articles.map((article, index) => (
          <li key={index} className="py-4 border-b last:border-none">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleExpand(index)}
                aria-label="Toggle details"
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <span
                  className={`transition-transform ${
                    expandedIndices.has(index) ? "rotate-90 text-yellow-600" : ""
                  }`}
                >
                  ▶
                </span>
              </button>

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
                {article.source && article.source.name && (
                  <p className="text-sm text-gray-600">
                    <strong>Source:</strong> {article.source.name} | <strong>Published:</strong> {new Date(article.publishedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={article.label === 1}
                  onChange={() => toggleLabel(index)}
                  style={{ transform: "scale(1.5)" }}
                />

                <button
                  onClick={() => removeArticle(index)}
                  aria-label="Remove article"
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                >
                  ✖
                </button>
              </div>
            </div>

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

      {trainError && <p className="text-red-500 mt-2">{trainError}</p>}

      <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
        <button
          onClick={toggleTrainingClassification}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: "#FF5722",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {phase === 3 ? "Back to Trainer" : "Go to Classifier"}
        </button>

        {phase === 3 ? (
          <>
            {classificationReady && (
              <button
                onClick={runSmartFilter}
                disabled={smartFilterLoading}
                style={{
                  marginRight: "10px",
                  padding: "10px 20px",
                  backgroundColor: smartFilterLoading ? "#ccc" : "#FFA500",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: smartFilterLoading ? "not-allowed" : "pointer",
                }}
              >
                Smart Filter
              </button>
            )}

            <button
              onClick={() => onPressRoom(selectedArticles)}
              disabled={selectedArticles.length < 1 || selectedArticles.length > 15}
              style={{
                padding: "10px 20px",
                backgroundColor: selectedArticles.length > 0 && selectedArticles.length <= 15 ? "#0070f3" : "#aaa",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: selectedArticles.length > 0 && selectedArticles.length <= 15 ? "pointer" : "not-allowed",
              }}
            >
              Press Room
            </button>
          </>
        ) : (
          <>
            <button
              onClick={exportDataset}
              disabled={articles.length < 1}
              style={{
                marginRight: "10px",
                padding: "10px 20px",
                backgroundColor: articles.length < 1 ? "#aaa" : "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: articles.length < 1 ? "not-allowed" : "pointer",
              }}
            >
              Export Dataset
            </button>

            <button
              onClick={trainModel}
              disabled={isTraining || articles.length < 200 || phase === 3}
              style={{
                padding: "10px 20px",
                backgroundColor: (isTraining || articles.length < 200 || phase === 3) ? "#aaa" : "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: (isTraining || articles.length < 200 || phase === 3) ? "not-allowed" : "pointer",
              }}
            >
              {isTraining ? "Training..." : "Train ML"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
