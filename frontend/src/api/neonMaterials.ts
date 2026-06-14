import type { NeonMaterial, NeonMaterialFormData } from "@/types/neonMaterial";
import { apiClient } from "./client";

/**
 * 获取材质列表，按编号排序。
 */
export async function fetchMaterials(): Promise<NeonMaterial[]> {
  const { data } = await apiClient.get<NeonMaterial[]>("/materials");
  return data;
}

/**
 * 获取单条材质。
 */
export async function fetchMaterial(id: number): Promise<NeonMaterial> {
  const { data } = await apiClient.get<NeonMaterial>(`/materials/${id}`);
  return data;
}

/**
 * 新建材质。
 */
export async function createMaterial(body: NeonMaterialFormData): Promise<NeonMaterial> {
  const { data } = await apiClient.post<NeonMaterial>("/materials", body);
  return data;
}

/**
 * 更新材质。
 */
export async function updateMaterial(
  id: number,
  body: NeonMaterialFormData
): Promise<NeonMaterial> {
  const { data } = await apiClient.put<NeonMaterial>(`/materials/${id}`, body);
  return data;
}

/**
 * 删除材质。
 */
export async function deleteMaterial(id: number): Promise<void> {
  await apiClient.delete(`/materials/${id}`);
}
