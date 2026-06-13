/** 故事记录 */
export interface Story {
  id: number;
  title: string;
  content: string;
  shop_name: string;
  publish_date: string;
}

/** 创建/更新故事表单数据 */
export interface StoryFormData {
  title: string;
  content: string;
  shop_name: string;
  publish_date: string;
}
