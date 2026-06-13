/** 维修状态 */
export type RepairStatus = "待处理" | "进行中" | "已完成";

/** 维修工单记录 */
export interface WorkOrder {
  id: number;
  shop_name: string;
  fault_description: string;
  status: RepairStatus;
  registration_date: string;
}

/** 创建/更新工单表单数据 */
export interface WorkOrderFormData {
  shop_name: string;
  fault_description: string;
  status: RepairStatus;
  registration_date: string;
}
