import axios from "axios";

/** API 基础地址 */
export const API_BASE = "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});
