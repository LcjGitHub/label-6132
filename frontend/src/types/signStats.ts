/** 招牌状态 */
export type SignStatus = "亮" | "灭" | "拆";

/** 城市招牌统计数据 */
export interface CitySignStats {
  city: string;
  total: number;
  on_count: number;
  off_count: number;
  removed_count: number;
}

/** 招牌统计响应 */
export interface SignStatsResponse {
  cities: string[];
  stats: CitySignStats[];
}
