import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  createOrder,
  deleteOrder,
  fetchOrder,
  updateOrder,
} from "@/api/workOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workOrderSchema, type WorkOrderSchema } from "@/lib/schemas";
import type { RepairStatus } from "@/types/workOrder";

const STATUS_OPTIONS: RepairStatus[] = ["待处理", "进行中", "已完成"];

/** 获取今天日期字符串作为默认值 */
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * 工单表单页：新建或编辑。
 */
export function WorkOrderFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const orderId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WorkOrderSchema>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      shop_name: "",
      fault_description: "",
      status: "待处理",
      registration_date: todayStr(),
    },
  });

  const statusValue = watch("status");

  useEffect(() => {
    if (order) {
      setValue("shop_name", order.shop_name);
      setValue("fault_description", order.fault_description);
      setValue("status", order.status);
      setValue("registration_date", order.registration_date);
    }
  }, [order, setValue]);

  const saveMutation = useMutation({
    mutationFn: (data: WorkOrderSchema) =>
      isEdit ? updateOrder(orderId, data) : createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      }
      navigate("/");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      navigate("/");
    },
  });

  const onSubmit = handleSubmit((data) => saveMutation.mutate(data));

  if (isEdit && isLoadingOrder) {
    return (
      <p className="text-muted-foreground text-center py-12">加载中…</p>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "编辑工单" : "新增工单"}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="shop_name">关联店名</Label>
          <Input
            id="shop_name"
            {...register("shop_name")}
            placeholder="例如：红星电影院"
          />
          {errors.shop_name && (
            <p className="text-sm text-destructive">
              {errors.shop_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fault_description">故障描述</Label>
          <textarea
            id="fault_description"
            {...register("fault_description")}
            rows={4}
            placeholder="详细描述霓虹灯故障情况，例如：灯管不亮、闪烁、变压器异响等"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
          />
          {errors.fault_description && (
            <p className="text-sm text-destructive">
              {errors.fault_description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>维修状态</Label>
          <Select
            value={statusValue}
            onValueChange={(v) => setValue("status", v as RepairStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择维修状态" />
            </SelectTrigger>
            <SelectContent className="bg-card text-card-foreground">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">
              {errors.status.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="registration_date">登记日期</Label>
          <Input
            id="registration_date"
            type="date"
            {...register("registration_date")}
          />
          {errors.registration_date && (
            <p className="text-sm text-destructive">
              {errors.registration_date.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "保存中…" : "保存"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/">取消</Link>
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              className="ml-auto"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm("确定删除这条工单记录？")) {
                  deleteMutation.mutate();
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              删除
            </Button>
          )}
        </div>

        {saveMutation.isError && (
          <p className="text-sm text-destructive">
            保存失败：{(saveMutation.error as Error).message}
          </p>
        )}
      </form>
    </div>
  );
}
