/** 拍摄者记录 */
export interface Photographer {
  id: number;
  name: string;
  phone: string;
  city: string;
}

/** 创建/更新拍摄者表单数据 */
export interface PhotographerFormData {
  name: string;
  phone: string;
  city: string;
}
