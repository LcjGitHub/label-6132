import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2, MapPin, Phone, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePhotographer, fetchPhotographers } from "@/api/photographers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

/**
 * 拍摄者列表页：卡片展示 + 城市筛选。
 */
export function PhotographerListPage() {
  const queryClient = useQueryClient();
  const [cityFilter, setCityFilter] = useState<string | null>(null);

  const { data: photographers, isLoading, isError, error } = useQuery({
    queryKey: ["photographers", cityFilter],
    queryFn: () => fetchPhotographers(cityFilter ?? undefined),
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "招牌拍摄者档案管理";
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePhotographer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photographers"] });
      setDeletingId(null);
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("确定删除这位拍摄者？")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  const cities = [...new Set((photographers ?? []).map((p) => p.city))].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            招牌拍摄者档案
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理招牌拍摄人员信息及常用城市
          </p>
        </div>
        <Button asChild>
          <Link to="/photographers/new">
            <Plus className="h-4 w-4" />
            新增拍摄者
          </Link>
        </Button>
      </div>

      {cities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={cityFilter === null ? "default" : "outline"}
            className="cursor-pointer px-3 py-1"
            onClick={() => setCityFilter(null)}
          >
            全部
          </Badge>
          {cities.map((city) => (
            <Badge
              key={city}
              variant={cityFilter === city ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => setCityFilter(city)}
            >
              {city}
            </Badge>
          ))}
        </div>
      )}

      {isLoading && (
        <p className="text-muted-foreground text-center py-12">加载中…</p>
      )}

      {isError && (
        <p className="text-destructive text-center py-12">
          加载失败：{(error as Error).message}
        </p>
      )}

      {photographers && photographers.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          暂无拍摄者记录
        </p>
      )}

      {photographers && photographers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photographers.map((photographer) => (
            <Card key={photographer.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{photographer.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        编号 #{photographer.id}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{photographer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{photographer.city}</span>
                  <Badge variant="secondary" className="ml-auto">
                    常驻
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="gap-1"
                  >
                    <Link to={`/photographers/edit/${photographer.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                      编辑
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive gap-1"
                    disabled={deletingId === photographer.id}
                    onClick={() => handleDelete(photographer.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    删除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
