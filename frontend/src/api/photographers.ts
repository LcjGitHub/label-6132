import type { Photographer, PhotographerFormData } from "@/types/photographer";
import { apiClient } from "./client";

/**
 * 获取拍摄者列表，可选城市筛选。
 */
export async function fetchPhotographers(city?: string): Promise<Photographer[]> {
  const params = city ? { city } : {};
  const { data } = await apiClient.get<Photographer[]>("/photographers", { params });
  return data;
}

/**
 * 获取单条拍摄者。
 */
export async function fetchPhotographer(id: number): Promise<Photographer> {
  const { data } = await apiClient.get<Photographer>(`/photographers/${id}`);
  return data;
}

/**
 * 新建拍摄者。
 */
export async function createPhotographer(body: PhotographerFormData): Promise<Photographer> {
  const { data } = await apiClient.post<Photographer>("/photographers", body);
  return data;
}

/**
 * 更新拍摄者。
 */
export async function updatePhotographer(
  id: number,
  body: PhotographerFormData
): Promise<Photographer> {
  const { data } = await apiClient.put<Photographer>(`/photographers/${id}`, body);
  return data;
}

/**
 * 删除拍摄者。
 */
export async function deletePhotographer(id: number): Promise<void> {
  await apiClient.delete(`/photographers/${id}`);
}
