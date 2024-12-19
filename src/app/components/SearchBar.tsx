"use client";

import { FormEvent } from "react";

interface SearchBarProps {
  onSearch: (keywords: string) => Promise<void>;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;
    
    const form = e.target as HTMLFormElement;
    const input = form.querySelector("textarea") as HTMLTextAreaElement;

    const keywords = input.value.trim();
    if (keywords) {
      onSearch(keywords); // Pass the comma-separated keywords to the parent
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ marginBottom: "20px" }} className="flex flex-col-2">
      <textarea
        placeholder='Enter keywords separated by commas... use AND and OR and " " for exact matches, i.e. bitcoin AND "ethereum"'
        rows={1}
        disabled={disabled}
        style={{
          padding: "10px",
          width: "75vw",
          height: "4rem",
          resize: "vertical",
          marginRight: "10px",
          color: "#000",
          border: "1px solid #ccc",
          borderRadius: "5px",
          overflow: "auto",
        }}
      />
      <button
        type="submit"
        disabled={disabled}
        style={{
          padding: "10px 20px",
          marginBottom: "auto",
          backgroundColor: disabled ? "#aaa" : "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        Search
      </button>
    </form>
  );
}
