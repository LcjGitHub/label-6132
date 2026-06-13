import axios from "axios";

/** API 基础地址（开发环境走 vite 代理，避免跨域问题） */
export const API_BASE = import.meta.env.DEV ? "/api" : "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});
