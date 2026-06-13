import type { SignStatsResponse } from "@/types/signStats";
import { apiClient } from "./client";

/**
 * 获取招牌统计数据，可选城市筛选。
 */
export async function fetchSignStats(
  city?: string
): Promise<SignStatsResponse> {
  const params = city ? { city } : {};
  const { data } = await apiClient.get<SignStatsResponse>("/signs/stats", {
    params,
  });
  return data;
}
