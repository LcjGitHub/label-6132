import type { NeonSign, NeonSignFormData } from "@/types/neon";
import { apiClient } from "./client";

/**
 * 获取招牌列表，可选状态筛选。
 */
export async function fetchSigns(status?: string): Promise<NeonSign[]> {
  const params = status ? { status } : {};
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
 * 新建招牌。
 */
export async function createSign(body: NeonSignFormData): Promise<NeonSign> {
  const { data } = await apiClient.post<NeonSign>("/signs", body);
  return data;
}

/**
 * 更新招牌。
 */
export async function updateSign(
  id: number,
  body: NeonSignFormData
): Promise<NeonSign> {
  const { data } = await apiClient.put<NeonSign>(`/signs/${id}`, body);
  return data;
}

/**
 * 删除招牌。
 */
export async function deleteSign(id: number): Promise<void> {
  await apiClient.delete(`/signs/${id}`);
}
