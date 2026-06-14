/** 招牌状态 */
export type SignStatus = "亮" | "灭" | "拆";

/** 招牌完整记录 */
export interface NeonSign {
  id: number;
  city: string;
  shop_name: string;
  status: SignStatus;
  location: string;
  era_estimate?: string;
  remark?: string;
}

/** 招牌状态计数统计 */
export interface SignStatusCounts {
  total: number;
  on_count: number;
  off_count: number;
  removed_count: number;
}

/** 招牌列表响应（含状态统计） */
export interface SignListResponse {
  items: NeonSign[];
  stats: SignStatusCounts;
}
