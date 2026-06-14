import type { NeonSign, SignStatus } from "@/types/neonSign";
import { apiClient } from "./client";

/**
 * 获取招牌列表，可选按状态、城市和店名关键词筛选。
 */
export async function fetchSigns(
  status?: SignStatus,
  city?: string,
  keyword?: string
): Promise<NeonSign[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (city) params.city = city;
  if (keyword) params.keyword = keyword;
  const { data } = await apiClient.get<NeonSign[]>("/signs", { params });
  return data;
}
