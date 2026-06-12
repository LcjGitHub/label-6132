/** 霓虹灯招牌状态 */
export type NeonStatus = "亮" | "灭" | "拆";

/** 霓虹灯招牌记录 */
export interface NeonSign {
  id: number;
  shop_name: string;
  city: string;
  address: string;
  status: NeonStatus;
  estimated_era: string;
}

/** 创建/更新招牌表单数据 */
export interface NeonSignFormData {
  shop_name: string;
  city: string;
  address: string;
  status: NeonStatus;
  estimated_era: string;
}
