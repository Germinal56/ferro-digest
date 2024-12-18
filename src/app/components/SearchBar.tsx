"use client";

import { FormEvent } from "react";

interface SearchBarProps {
  onSearch: (keywords: string) => Promise<void>;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector("textarea") as HTMLTextAreaElement;

    const keywords = input.value.trim();
    if (keywords) {
      onSearch(keywords); // Pass the comma-separated keywords to the parent
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
      <textarea
        placeholder="Enter keywords separated by commas..."
        rows={1}
        style={{
          padding: "10px",
          width: "75vw",
          height: "2rem",
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
        style={{
          padding: "10px 20px",
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
