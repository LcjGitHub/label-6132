import { useEffect, useState } from "react";
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
} from "@/api/neonSigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { neonSignSchema, type NeonSignSchema } from "@/lib/schemas";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function SignFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const signId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: sign, isLoading: isLoadingSign, isError: isSignError } = useQuery({
    queryKey: ["sign", signId],
    queryFn: () => fetchSign(signId),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NeonSignSchema>({
    resolver: zodResolver(neonSignSchema),
    defaultValues: {
      city: "",
      shop_name: "",
      status: "亮",
      location: "",
      remark: "",
    },
  });

  useEffect(() => {
    if (sign) {
      setValue("city", sign.city);
      setValue("shop_name", sign.shop_name);
      setValue("status", sign.status);
      setValue("location", sign.location);
      setValue("remark", sign.remark ?? "");
    }
  }, [sign, setValue]);

  useEffect(() => {
    document.title = isEdit ? "编辑招牌" : "新增招牌";
  }, [isEdit]);

  const saveMutation = useMutation({
    mutationFn: (data: NeonSignSchema) =>
      isEdit ? updateSign(signId, data) : createSign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signs"] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["sign", signId] });
      }
      navigate("/signs");
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteSign(signId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signs"] });
      navigate("/signs");
    },
  });

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    deleteMutation.mutate();
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  const onSubmit = handleSubmit((data) => saveMutation.mutate(data));

  if (isEdit && isLoadingSign) {
    return (
      <p className="text-muted-foreground text-center py-12">加载中…</p>
    );
  }

  if (isEdit && isSignError) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/signs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">编辑招牌</h1>
        </div>
        <div className="text-center py-16 space-y-4 border border-border rounded-lg">
          <p className="text-destructive text-lg font-medium">招牌不存在</p>
          <p className="text-muted-foreground text-sm">
            该招牌记录可能已被删除或编号无效
          </p>
          <Button asChild>
            <Link to="/signs">返回招牌列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/signs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "编辑招牌" : "新增招牌"}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="city">所在城市</Label>
          <Input
            id="city"
            {...register("city")}
            placeholder="例如：上海、北京"
          />
          {errors.city && (
            <p className="text-sm text-destructive">
              {errors.city.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shop_name">关联店名</Label>
          <Input
            id="shop_name"
            {...register("shop_name")}
            placeholder="例如：和平饭店"
          />
          {errors.shop_name && (
            <p className="text-sm text-destructive">
              {errors.shop_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">招牌状态</Label>
          <Select
            defaultValue="亮"
            onValueChange={(val) => setValue("status", val as "亮" | "灭" | "拆")}
            {...(sign ? { value: sign.status } : {})}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="请选择招牌状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="亮">亮</SelectItem>
              <SelectItem value="灭">灭</SelectItem>
              <SelectItem value="拆">拆</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">
              {errors.status.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">具体位置</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="例如：南京东路"
          />
          {errors.location && (
            <p className="text-sm text-destructive">
              {errors.location.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="remark">备注（选填）</Label>
          <Textarea
            id="remark"
            {...register("remark")}
            placeholder="记录招牌外观细节或走访见闻…"
          />
          {errors.remark && (
            <p className="text-sm text-destructive">
              {errors.remark.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "保存中…" : "保存"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/signs">取消</Link>
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              className="ml-auto"
              disabled={deleteMutation.isPending}
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
              删除
            </Button>
          )}
        </div>

        {saveMutation.isError && (
          <p className="text-sm text-destructive">
            保存失败，请检查输入内容后重试
          </p>
        )}

        {deleteMutation.isError && (
          <p className="text-sm text-destructive">
            删除失败，请稍后重试
          </p>
        )}
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="删除招牌"
        description="确定删除该招牌记录？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
