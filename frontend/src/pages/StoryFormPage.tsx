import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  createStory,
  deleteStory,
  fetchStory,
  updateStory,
} from "@/api/stories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { storySchema, type StorySchema } from "@/lib/schemas";
import { ConfirmDialog } from "@/components/ConfirmDialog";

/**
 * 故事表单页：新建或编辑。
 */
export function StoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const storyId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: story, isLoading: isLoadingStory } = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => fetchStory(storyId),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StorySchema>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: "",
      content: "",
      shop_name: "",
      publish_date: "",
    },
  });

  useEffect(() => {
    if (story) {
      setValue("title", story.title);
      setValue("content", story.content);
      setValue("shop_name", story.shop_name);
      setValue("publish_date", story.publish_date);
    }
  }, [story, setValue]);

  useEffect(() => {
    document.title = isEdit ? "编辑故事" : "撰写故事";
  }, [isEdit]);

  const saveMutation = useMutation({
    mutationFn: (data: StorySchema) =>
      isEdit ? updateStory(storyId, data) : createStory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      }
      navigate("/stories");
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      navigate("/stories");
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

  if (isEdit && isLoadingStory) {
    return (
      <p className="text-muted-foreground text-center py-12">加载中…</p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/stories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "编辑故事" : "撰写故事"}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">标题</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="请输入故事标题"
          />
          {errors.title && (
            <p className="text-sm text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shop_name">关联店名</Label>
          <Input
            id="shop_name"
            {...register("shop_name")}
            placeholder="例如：和平饭店、红星电影院"
          />
          {errors.shop_name && (
            <p className="text-sm text-destructive">
              {errors.shop_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="publish_date">发布日期</Label>
          <Input
            id="publish_date"
            type="date"
            {...register("publish_date")}
          />
          {errors.publish_date && (
            <p className="text-sm text-destructive">
              {errors.publish_date.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">正文</Label>
          <Textarea
            id="content"
            {...register("content")}
            placeholder="请输入故事正文内容，讲述霓虹招牌背后的城市记忆与人文故事……"
            className="min-h-[240px]"
          />
          {errors.content && (
            <p className="text-sm text-destructive">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "保存中…" : "保存"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/stories">取消</Link>
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
        title="删除故事"
        description="确定删除这篇故事？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
