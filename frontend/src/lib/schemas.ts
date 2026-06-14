import { z } from "zod";

/** 工单表单 Zod 校验 schema */
export const workOrderSchema = z.object({
  shop_name: z.string().min(1, "请输入关联店名"),
  fault_description: z.string().min(1, "请输入故障描述"),
  status: z.enum(["待处理", "进行中", "已完成"], {
    required_error: "请选择维修状态",
  }),
  registration_date: z.string().min(1, "请选择登记日期"),
});

export type WorkOrderSchema = z.infer<typeof workOrderSchema>;

/** 拍摄者表单 Zod 校验 schema */
export const photographerSchema = z.object({
  name: z.string().min(1, "请输入姓名"),
  phone: z
    .string()
    .trim()
    .min(1, "请输入联系电话")
    .regex(/^\d+$/, "联系电话必须为纯数字")
    .length(11, "联系电话必须为11位数字"),
  city: z.string().min(1, "请输入常用拍摄城市"),
});

export type PhotographerSchema = z.infer<typeof photographerSchema>;

/** 故事表单 Zod 校验 schema */
export const storySchema = z.object({
  title: z.string().min(1, "请输入标题"),
  content: z.string().min(1, "请输入正文"),
  shop_name: z.string().min(1, "请输入关联店名"),
  publish_date: z.string().min(1, "请选择发布日期"),
});

export type StorySchema = z.infer<typeof storySchema>;

export const neonMaterialSchema = z.object({
  name: z.string().min(1, "请输入材质名称"),
  common_colors: z.string().min(1, "请输入常见颜色"),
  applicable_era: z.string().min(1, "请输入适用年代"),
});

export type NeonMaterialSchema = z.infer<typeof neonMaterialSchema>;

export const neonSignSchema = z.object({
  city: z.string().min(1, "请输入所在城市"),
  shop_name: z.string().min(1, "请输入关联店名"),
  status: z.enum(["亮", "灭", "拆"], {
    required_error: "请选择招牌状态",
  }),
  location: z.string().min(1, "请输入具体位置"),
  remark: z.string().optional(),
});

export type NeonSignSchema = z.infer<typeof neonSignSchema>;
