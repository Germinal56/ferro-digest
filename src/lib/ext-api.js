import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const trainClassifier = async (articles) => {
  const response = await api.post("/train-classifier", { articles });
  return response.data;
};

export const classifyArticles = async (articles, threshold = 0.7) => {
  const response = await api.post("/classify-articles", { articles, threshold });
  return response.data;
};
