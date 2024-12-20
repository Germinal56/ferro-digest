export interface Article {
    source: {
      id: string | null;
      name: string | null;
    };
    author?: string | null;
    title: string;
    description?: string;
    url: string;
    urlToImage?: string | null;
    publishedAt: string;
    content?: string;
    label: number; // 0 or 1
}

export interface NewsAPIResponse {
    status: string;
    totalResults: number;
    articles: Article[];
}
  