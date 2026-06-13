import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  createPhotographer,
  deletePhotographer,
  fetchPhotographer,
  updatePhotographer,
} from "@/api/photographers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { photographerSchema, type PhotographerSchema } from "@/lib/schemas";
import { ConfirmDialog } from "@/components/ConfirmDialog";

/**
 * 拍摄者表单页：新建或编辑。
 */
export function PhotographerFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const photographerId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: photographer, isLoading: isLoadingPhotographer } = useQuery({
    queryKey: ["photographer", photographerId],
    queryFn: () => fetchPhotographer(photographerId),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PhotographerSchema>({
    resolver: zodResolver(photographerSchema),
    defaultValues: {
      name: "",
      phone: "",
      city: "",
    },
  });

  useEffect(() => {
    if (photographer) {
      setValue("name", photographer.name);
      setValue("phone", photographer.phone);
      setValue("city", photographer.city);
    }
  }, [photographer, setValue]);

  useEffect(() => {
    document.title = isEdit ? "编辑拍摄者" : "新增拍摄者";
  }, [isEdit]);

  const saveMutation = useMutation({
    mutationFn: (data: PhotographerSchema) =>
      isEdit ? updatePhotographer(photographerId, data) : createPhotographer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photographers"] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["photographer", photographerId] });
      }
      navigate("/photographers");
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deletePhotographer(photographerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photographers"] });
      navigate("/photographers");
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

  if (isEdit && isLoadingPhotographer) {
    return (
      <p className="text-muted-foreground text-center py-12">加载中…</p>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/photographers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "编辑拍摄者" : "新增拍摄者"}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="请输入拍摄者姓名"
          />
          {errors.name && (
            <p className="text-sm text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">联系电话</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="请输入联系电话"
          />
          {errors.phone && (
            <p className="text-sm text-destructive">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">常用拍摄城市</Label>
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

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "保存中…" : "保存"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/photographers">取消</Link>
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
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="删除拍摄者"
        description="确定删除这位拍摄者？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
