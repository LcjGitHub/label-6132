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
  phone: z.string().min(1, "请输入联系电话"),
  city: z.string().min(1, "请输入常用拍摄城市"),
});

export type PhotographerSchema = z.infer<typeof photographerSchema>;
