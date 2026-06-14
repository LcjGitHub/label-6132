import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2, Palette, Clock, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { deleteMaterial, fetchMaterials } from "@/api/neonMaterials";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const NEON_COLORS = [
  "from-pink-500/20 to-rose-500/20 border-pink-500/40",
  "from-cyan-500/20 to-blue-500/20 border-cyan-500/40",
  "from-violet-500/20 to-purple-500/20 border-violet-500/40",
  "from-amber-500/20 to-yellow-500/20 border-amber-500/40",
  "from-emerald-500/20 to-green-500/20 border-emerald-500/40",
];

export function MaterialListPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "霓虹材质登记";
  }, []);

  const { data: materials, isLoading, isError } = useQuery({
    queryKey: ["materials"],
    queryFn: fetchMaterials,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            霓虹材质登记
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理霓虹灯材质档案，记录材质特性与适用年代
          </p>
        </div>
        <Button asChild>
          <Link to="/materials/new">
            <Plus className="h-4 w-4" />
            新增材质
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

      {materials && materials.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          暂无材质记录
        </p>
      )}

      {materials && materials.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material, index) => (
            <Card
              key={material.id}
              className={`overflow-hidden transition-shadow hover:shadow-lg bg-gradient-to-br ${NEON_COLORS[index % NEON_COLORS.length]}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{material.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        编号 #{material.id}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Palette className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{material.common_colors}</span>
                  <Badge variant="secondary" className="ml-auto">
                    常见颜色
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{material.applicable_era}</span>
                  <Badge variant="secondary" className="ml-auto">
                    适用年代
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="gap-1"
                  >
                    <Link to={`/materials/edit/${material.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                      编辑
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive gap-1"
                    disabled={deletingId === material.id}
                    onClick={() => handleDeleteClick(material.id)}
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
