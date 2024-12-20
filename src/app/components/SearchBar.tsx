"use client";

import { FormEvent } from "react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (keywords: string) => Promise<void>;
  disabledTextarea?: boolean;
}

export default function SearchBar({ onSearch, disabledTextarea }: SearchBarProps) {
  const defaultKeywords = `("children" OR "childhood" OR "kid" OR "youth" OR "teen" OR "brain") AND ("mental health" OR "effect" OR "consequence" OR "impact" OR "danger" OR "development" OR "isolation" OR "isolated" OR "lonel" OR "suicide" OR "risk" OR "abuse" OR "aggress" OR "depress" OR "ADHD" OR "focus") AND ("social media" OR "media" OR "apps" OR "app" OR "application" OR "videogame" OR "television" OR "ai" OR "artificial intelligence" OR "technology" OR "internet" OR "screen time")`

  const [customKw, setCustomKw] = useState(defaultKeywords);
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    const form = e.target as HTMLFormElement;
    const input = form.querySelector("textarea") as HTMLTextAreaElement;

    const keywords = input.value.trim();
    if (keywords) {
      onSearch(keywords);
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ marginBottom: "20px" }} className="flex flex-col-2">
      <textarea
        placeholder='Enter keywords separated by commas... use AND and OR and " " for exact matches, i.e. bitcoin AND "ethereum"'
        rows={6}
        disabled={disabledTextarea}
        value={customKw}
        onChange={(e) => setCustomKw(e.target.value)}
        style={{
          padding: "10px",
          width: "75vw",
          height: "6rem",
          resize: "vertical",
          marginRight: "10px",
          color: disabledTextarea ? "#999" : "#000",
          border: "1px solid #ccc",
          borderRadius: "5px",
          overflow: "auto",
          backgroundColor: disabledTextarea ? "#f0f0f0" : "#fff",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "10px 20px",
          marginBottom: "auto",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </form>
  );
}
