import type { NeonSign, SignStatus } from "@/types/neonSign";
import { apiClient } from "./client";

/**
 * 获取招牌列表，可选按状态和城市筛选。
 */
export async function fetchSigns(
  status?: SignStatus,
  city?: string
): Promise<NeonSign[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (city) params.city = city;
  const { data } = await apiClient.get<NeonSign[]>("/signs", { params });
  return data;
}
