import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2, Calendar, Store, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStory, fetchStories } from "@/api/stories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";

/**
 * 故事列表页：卡片展示，按发布日期倒序。
 */
export function StoryListPage() {
  const queryClient = useQueryClient();

  const { data: stories, isLoading, isError } = useQuery({
    queryKey: ["stories"],
    queryFn: () => fetchStories(),
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "霓虹招牌故事专栏";
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteStory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setDeletingId(null);
    },
  });

  const handleDeleteClick = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId !== null) {
      setDeletingId(pendingDeleteId);
      deleteMutation.mutate(pendingDeleteId);
    }
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const getContentSummary = (content: string, maxLen = 80): string => {
    if (content.length <= maxLen) return content;
    return content.slice(0, maxLen) + "…";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            霓虹招牌故事专栏
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            记录霓虹招牌背后的城市记忆与人文故事
          </p>
        </div>
        <Button asChild>
          <Link to="/stories/new">
            <Plus className="h-4 w-4" />
            撰写故事
          </Link>
        </Button>
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-center py-12">加载中…</p>
      )}

      {isError && (
        <p className="text-destructive text-center py-12">
          无法连接服务，请确认后端已启动
        </p>
      )}

      {stories && stories.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          暂无故事记录
        </p>
      )}

      {stories && stories.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {stories.map((story) => (
            <Card
              key={story.id}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {story.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="gap-1">
                          <Store className="h-3 w-3" />
                          {story.shop_name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="line-clamp-3 leading-relaxed">
                  {getContentSummary(story.content)}
                </CardDescription>
                <div className="flex items-center justify-between pt-2 border-t border-border mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {story.publish_date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="gap-1"
                    >
                      <Link to={`/stories/edit/${story.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                        编辑
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive gap-1"
                      disabled={deletingId === story.id}
                      onClick={() => handleDeleteClick(story.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
