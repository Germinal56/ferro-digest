export interface Article {
    source: { name: string };
    author?: string;
    title: string;
    description?: string;
    url: string;
    urlToImage?: string;
    publishedAt: string;
    content?: string;
    label: number;
}

export interface NewsAPIResponse {
    status: string;
    totalResults: number;
    articles: Article[];
}
  