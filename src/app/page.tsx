import NewsList from "./components/NewsList";

export default function Home() {
  return (
    <div style={{ padding: "36px", fontFamily: "Open Sans, sans-serif", fontWeight:"600"}}>
      <h1 className="mb-2">1. SELEZIONE PAROLE CHIAVE</h1>
      <NewsList />
    </div>
  );
}
