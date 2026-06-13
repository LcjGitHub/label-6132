import type { Story, StoryFormData } from "@/types/story";
import { apiClient } from "./client";

/**
 * 获取故事列表，按发布日期倒序。
 */
export async function fetchStories(): Promise<Story[]> {
  const { data } = await apiClient.get<Story[]>("/stories");
  return data;
}

/**
 * 获取单条故事。
 */
export async function fetchStory(id: number): Promise<Story> {
  const { data } = await apiClient.get<Story>(`/stories/${id}`);
  return data;
}

/**
 * 新建故事。
 */
export async function createStory(body: StoryFormData): Promise<Story> {
  const { data } = await apiClient.post<Story>("/stories", body);
  return data;
}

/**
 * 更新故事。
 */
export async function updateStory(
  id: number,
  body: StoryFormData
): Promise<Story> {
  const { data } = await apiClient.put<Story>(`/stories/${id}`, body);
  return data;
}

/**
 * 删除故事。
 */
export async function deleteStory(id: number): Promise<void> {
  await apiClient.delete(`/stories/${id}`);
}
