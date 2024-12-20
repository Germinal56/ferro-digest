"use client";

import { useState } from "react";
import { Article } from "../../types/news";

interface PressRoomProps {
  initialArticles: Article[];
}

// Default LinkedIn post prompt
const defaultSummaryPrompt = `You are a news outlet that has to select and filter information based on these topics: "Effects of Technology on Children", "Effects of Usage of Technology in People". The texts selected should be relevant for an outlet that wants to promote the aware usage of technology and protect the people and most of all the children from misuse. Present only information that can be interesting for conscious parents that want to educate their children in the best way possible and want to get informed about the risks and opportunities of technology.`
const defaultPrompt = `Write a post that encourages thoughtful engagement and reflection on how we consciously interact with technology, do it in Italian using the style of Francesco Costa`

export default function PressRoom({ initialArticles }: PressRoomProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [extractionDone, setExtractionDone] = useState(false);
  const [extractedList, setExtractedList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [customInstruction, setCustomInstruction] = useState(defaultSummaryPrompt);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // New states for the post creation phase
  const [postPrompt, setPostPrompt] = useState(defaultPrompt);
  const [posts, setPosts] = useState<string[]>([]); // Two generated posts
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);

  const extractInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/extract-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles, customInstruction })
      });
      const data = await response.json();
      setExtractedList(data.list || []);
      if (data.list && data.list.length > 0) {
        setExtractionDone(true);
        setArticles([]);
      } else {
        // If empty, show message but do not set extractionDone
        // Just leave articles as is and show a message
        alert("Current articles don't have interesting facts. Go back to article selection.");
      }
    } catch (error) {
      console.error("Extraction error:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    setDraggedItemIndex(index);
  };

  const onDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null) return;
    // Reorder the list
    const newList = [...extractedList];
    const [draggedItem] = newList.splice(draggedItemIndex, 1);
    newList.splice(dropIndex, 0, draggedItem);
    setExtractedList(newList);
    setDraggedItemIndex(null);
  };

  const showExtractionUI = !extractionDone && articles.length > 0;

  // New function to create posts
  const createPost = async () => {
    if (extractedList.length === 0 || !extractionDone) return;
    // Send postPrompt and excerpts to new endpoint
    const body = {
      prompt: postPrompt,
      excerpts: extractedList
    };
    setLoading(true);
    try {
      const response = await fetch("/api/create-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      // data.posts = [post1, post2]
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setLoading(false);
    }
  };

  const choosePost = (index: number) => {
    // Choose one post, remove the other
    setSelectedPostIndex(index);
    setPosts([posts[index]]); // Keep only the chosen one
  };

  const copyToClipboard = () => {
    if (selectedPostIndex === null) return;
    const text = posts[selectedPostIndex];
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  // Once we have posts generated, we go to step 5
  const inChoosePostPhase = posts.length > 0;

  return (
    <div style={{ padding: "36px", fontFamily: "Open Sans, sans-serif", fontWeight:"600"}}>
      <h1 className="mb-2 font-black text-4xl">
        {!inChoosePostPhase ? (extractionDone ? "5. CREA POST" : "4. ESTRAPOLA INFORMAZIONI") : "5. SCEGLI E MODIFICA POST"}
      </h1>

      {/* Custom Instruction Textarea for Extraction Phase */}
      {showExtractionUI && (
        <div style={{ marginBottom: "20px" }}>
          <textarea
            placeholder="Add custom instructions for GPT here..."
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            style={{
              width: "75vw",
              height: "4rem",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              resize: "vertical",
              overflow: "auto",
              marginBottom: "10px"
            }}
          />
        </div>
      )}

      {loading && <p>Loading...</p>}

      {showExtractionUI && !loading && (
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

      {extractionDone && !inChoosePostPhase && (
        <div style={{ marginTop: "20px" }}>
          {/* Once extractedList is available, show LinkedIn prompt textarea */}
          <textarea
            value={postPrompt}
            onChange={(e) => setPostPrompt(e.target.value)}
            style={{
              width: "75vw",
              height: "10rem",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              resize: "vertical",
              overflow: "auto",
              marginBottom: "10px"
            }}
          />

          <p>{extractedList.length} excerpts extracted:</p>
          <ul className="list-disc pl-5">
            {extractedList.map((item, index) => (
              <li
                key={index}
                className="flex items-center space-x-2"
                draggable={true}
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index)}
                style={{ cursor: "move" }}
              >
                <button
                  onClick={() => removeItem(index)}
                  style={{ backgroundColor: "red", color: "#fff", border: "none", borderRadius: "3px", padding: "5px"}}
                >
                  ✕
                </button>
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

                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Button to create post */}
          <button
            onClick={createPost}
            disabled={loading || extractedList.length === 0}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: (loading || extractedList.length === 0) ? "#aaa" : "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: (loading || extractedList.length === 0) ? "not-allowed" : "pointer",
            }}
          >
            Crea Post
          </button>
        </div>
      )}

      {inChoosePostPhase && selectedPostIndex === null && (
        <div style={{ marginTop: "20px" }}>
          <p>Scegli un post:</p>
          <div style={{ display: "flex", gap: "20px" }}>
            {posts.map((post, i) => (
              <div key={i} style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "10px", width: "45vw" }}>
                <p>{post}</p>
                <button
                  onClick={() => choosePost(i)}
                  style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    backgroundColor: "#0070f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Scegli Questo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {inChoosePostPhase && selectedPostIndex !== null && (
        <div style={{ marginTop: "20px" }}>
          <p>Modifica il post scelto:</p>
          <textarea
            value={posts[0]}
            onChange={(e) => {
              const newPosts = [...posts];
              newPosts[0] = e.target.value;
              setPosts(newPosts);
            }}
            style={{
              width: "75vw",
              height: "80vh",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              resize: "vertical",
              overflow: "auto",
              marginBottom: "10px"
            }}
          />
          <button
            onClick={copyToClipboard}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Copia negli appunti
          </button>
        </div>
      )}

      <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
        {showExtractionUI && (
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

        {/* The "Crea Post" button for extracted items is now inside the extractionDone && !inChoosePostPhase section above */}
      </div>
    </div>
  );
}
