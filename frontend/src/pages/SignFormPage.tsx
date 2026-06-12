import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  createSign,
  deleteSign,
  fetchSign,
  updateSign,
} from "@/api/signs";
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
import { neonSignSchema, type NeonSignSchema } from "@/lib/schemas";
import type { NeonStatus } from "@/types/neon";

const STATUS_OPTIONS: NeonStatus[] = ["亮", "灭", "拆"];

/**
 * 招牌表单页：新建或编辑。
 */
export function SignFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const signId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: sign, isLoading: isLoadingSign } = useQuery({
    queryKey: ["sign", signId],
    queryFn: () => fetchSign(signId),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NeonSignSchema>({
    resolver: zodResolver(neonSignSchema),
    defaultValues: {
      shop_name: "",
      city: "",
      address: "",
      status: "亮",
      estimated_era: "",
    },
  });

  const statusValue = watch("status");

  useEffect(() => {
    if (sign) {
      setValue("shop_name", sign.shop_name);
      setValue("city", sign.city);
      setValue("address", sign.address);
      setValue("status", sign.status);
      setValue("estimated_era", sign.estimated_era);
    }
  }, [sign, setValue]);

  const saveMutation = useMutation({
    mutationFn: (data: NeonSignSchema) =>
      isEdit ? updateSign(signId, data) : createSign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signs"] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["sign", signId] });
      }
      navigate("/");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSign(signId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signs"] });
      navigate("/");
    },
  });

  const onSubmit = handleSubmit((data) => saveMutation.mutate(data));

  if (isEdit && isLoadingSign) {
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
          {isEdit ? "编辑招牌" : "新增招牌"}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="shop_name">店名</Label>
          <Input id="shop_name" {...register("shop_name")} placeholder="例如：红星电影院" />
          {errors.shop_name && (
            <p className="text-sm text-destructive">{errors.shop_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">城市</Label>
          <Input id="city" {...register("city")} placeholder="例如：上海" />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">地址</Label>
          <Input id="address" {...register("address")} placeholder="详细地址" />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>状态</Label>
          <Select
            value={statusValue}
            onValueChange={(v) => setValue("status", v as NeonStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent className="bg-card text-card-foreground">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_era">年代估计</Label>
          <Input
            id="estimated_era"
            {...register("estimated_era")}
            placeholder="例如：1980年代"
          />
          {errors.estimated_era && (
            <p className="text-sm text-destructive">
              {errors.estimated_era.message}
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
                if (window.confirm("确定删除这条招牌记录？")) {
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
