/** 招牌状态 */
export type SignStatus = "亮" | "灭" | "拆";

/** 招牌完整记录 */
export interface NeonSign {
  id: number;
  city: string;
  shop_name: string;
  status: SignStatus;
  location: string;
}
