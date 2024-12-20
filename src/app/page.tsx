"use client"

import { useState } from "react";
import NewsList from "./components/NewsList";
import PressRoom from "./components/PressRoom";
import { Article } from "../types/news"; // Assume the Article type is defined

export default function Home() {
  const [showPressRoom, setShowPressRoom] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);

  const handlePressRoom = (articles: Article[]) => {
    // Called from NewsList when "Press Room" is clicked in phase 3
    setSelectedArticles(articles);
    setShowPressRoom(true);
  };

  return (
    <div>
      {!showPressRoom && (
        <NewsList onPressRoom={handlePressRoom} />
      )}
      {showPressRoom && (
        <PressRoom initialArticles={selectedArticles} />
      )}
    </div>
  );
}
