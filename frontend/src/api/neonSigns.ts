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

/**
 * 获取单条招牌。
 */
export async function fetchSign(id: number): Promise<NeonSign> {
  const { data } = await apiClient.get<NeonSign>(`/signs/${id}`);
  return data;
}

/**
 * 创建招牌表单数据。
 */
export interface NeonSignFormData {
  city: string;
  shop_name: string;
  status: SignStatus;
  location: string;
  remark?: string;
}

/**
 * 新建招牌。
 */
export async function createSign(payload: NeonSignFormData): Promise<NeonSign> {
  const { data } = await apiClient.post<NeonSign>("/signs", payload);
  return data;
}

/**
 * 更新招牌。
 */
export async function updateSign(
  id: number,
  payload: NeonSignFormData
): Promise<NeonSign> {
  const { data } = await apiClient.put<NeonSign>(`/signs/${id}`, payload);
  return data;
}

/**
 * 删除招牌。
 */
export async function deleteSign(id: number): Promise<void> {
  await apiClient.delete(`/signs/${id}`);
}
