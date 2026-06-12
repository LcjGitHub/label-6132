import { z } from "zod";

/** 招牌表单 Zod 校验 schema */
export const neonSignSchema = z.object({
  shop_name: z.string().min(1, "请输入店名"),
  city: z.string().min(1, "请输入城市"),
  address: z.string().min(1, "请输入地址"),
  status: z.enum(["亮", "灭", "拆"], {
    required_error: "请选择状态",
  }),
  estimated_era: z.string().min(1, "请输入年代估计"),
});

export type NeonSignSchema = z.infer<typeof neonSignSchema>;
