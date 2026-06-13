import type { WorkOrder, WorkOrderFormData } from "@/types/workOrder";
import { apiClient } from "./client";

/**
 * 获取工单列表，可选状态筛选。
 */
export async function fetchOrders(status?: string): Promise<WorkOrder[]> {
  const params = status ? { status } : {};
  const { data } = await apiClient.get<WorkOrder[]>("/orders", { params });
  return data;
}

/**
 * 获取单条工单。
 */
export async function fetchOrder(id: number): Promise<WorkOrder> {
  const { data } = await apiClient.get<WorkOrder>(`/orders/${id}`);
  return data;
}

/**
 * 新建工单。
 */
export async function createOrder(body: WorkOrderFormData): Promise<WorkOrder> {
  const { data } = await apiClient.post<WorkOrder>("/orders", body);
  return data;
}

/**
 * 更新工单。
 */
export async function updateOrder(
  id: number,
  body: WorkOrderFormData
): Promise<WorkOrder> {
  const { data } = await apiClient.put<WorkOrder>(`/orders/${id}`, body);
  return data;
}

/**
 * 删除工单。
 */
export async function deleteOrder(id: number): Promise<void> {
  await apiClient.delete(`/orders/${id}`);
}
