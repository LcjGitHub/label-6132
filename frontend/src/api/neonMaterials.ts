import type { NeonMaterial, NeonMaterialFormData } from "@/types/neonMaterial";
import { apiClient } from "./client";

export async function fetchMaterials(): Promise<NeonMaterial[]> {
  const { data } = await apiClient.get<NeonMaterial[]>("/materials");
  return data;
}

export async function fetchMaterial(id: number): Promise<NeonMaterial> {
  const { data } = await apiClient.get<NeonMaterial>(`/materials/${id}`);
  return data;
}

export async function createMaterial(body: NeonMaterialFormData): Promise<NeonMaterial> {
  const { data } = await apiClient.post<NeonMaterial>("/materials", body);
  return data;
}

export async function updateMaterial(
  id: number,
  body: NeonMaterialFormData
): Promise<NeonMaterial> {
  const { data } = await apiClient.put<NeonMaterial>(`/materials/${id}`, body);
  return data;
}

export async function deleteMaterial(id: number): Promise<void> {
  await apiClient.delete(`/materials/${id}`);
}
