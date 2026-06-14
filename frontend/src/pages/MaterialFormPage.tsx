import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  createMaterial,
  deleteMaterial,
  fetchMaterial,
  updateMaterial,
} from "@/api/neonMaterials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { neonMaterialSchema, type NeonMaterialSchema } from "@/lib/schemas";
import { ConfirmDialog } from "@/components/ConfirmDialog";

/**
 * 材质表单页：新建或编辑。
 */
export function MaterialFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const materialId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: material, isLoading: isLoadingMaterial, isError: isMaterialError } = useQuery({
    queryKey: ["material", materialId],
    queryFn: () => fetchMaterial(materialId),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NeonMaterialSchema>({
    resolver: zodResolver(neonMaterialSchema),
    defaultValues: {
      name: "",
      common_colors: "",
      applicable_era: "",
    },
  });

  useEffect(() => {
    if (material) {
      setValue("name", material.name);
      setValue("common_colors", material.common_colors);
      setValue("applicable_era", material.applicable_era);
    }
  }, [material, setValue]);

  useEffect(() => {
    document.title = isEdit ? "编辑材质" : "新增材质";
  }, [isEdit]);

  const saveMutation = useMutation({
    mutationFn: (data: NeonMaterialSchema) =>
      isEdit ? updateMaterial(materialId, data) : createMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["material", materialId] });
      }
      navigate("/materials");
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteMaterial(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      navigate("/materials");
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

  if (isEdit && isLoadingMaterial) {
    return (
      <p className="text-muted-foreground text-center py-12">加载中…</p>
    );
  }

  if (isEdit && isMaterialError) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/materials">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">编辑材质</h1>
        </div>
        <div className="text-center py-16 space-y-4 border border-border rounded-lg">
          <p className="text-destructive text-lg font-medium">材质不存在</p>
          <p className="text-muted-foreground text-sm">
            该材质记录可能已被删除或编号无效
          </p>
          <Button asChild>
            <Link to="/materials">返回材质列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/materials">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "编辑材质" : "新增材质"}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">材质名称</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="例如：氖气直管、钠灯玻璃管"
          />
          {errors.name && (
            <p className="text-sm text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="common_colors">常见颜色</Label>
          <Input
            id="common_colors"
            {...register("common_colors")}
            placeholder="例如：红、橙红"
          />
          {errors.common_colors && (
            <p className="text-sm text-destructive">
              {errors.common_colors.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="applicable_era">适用年代</Label>
          <Input
            id="applicable_era"
            {...register("applicable_era")}
            placeholder="例如：1920s-1970s"
          />
          {errors.applicable_era && (
            <p className="text-sm text-destructive">
              {errors.applicable_era.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "保存中…" : "保存"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/materials">取消</Link>
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
        title="删除材质"
        description="确定删除该材质记录？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
