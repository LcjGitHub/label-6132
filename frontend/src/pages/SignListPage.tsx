import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { fetchSigns } from "@/api/signs";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NeonStatus } from "@/types/neon";

const FILTER_OPTIONS: { label: string; value: NeonStatus | null }[] = [
  { label: "全部", value: null },
  { label: "亮", value: "亮" },
  { label: "灭", value: "灭" },
  { label: "拆", value: "拆" },
];

/**
 * 招牌列表页：Card 网格 + 状态 Badge 筛选。
 */
export function SignListPage({
  statusFilter,
  onStatusFilterChange,
}: {
  statusFilter: NeonStatus | null;
  onStatusFilterChange: (status: NeonStatus | null) => void;
}) {
  const { data: signs, isLoading, isError, error } = useQuery({
    queryKey: ["signs", statusFilter],
    queryFn: () => fetchSigns(statusFilter ?? undefined),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            老式霓虹灯招牌存档
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            记录城市中仍在发光或已消逝的霓虹记忆
          </p>
        </div>
        <Button asChild>
          <Link to="/new">
            <Plus className="h-4 w-4" />
            新增招牌
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <Badge
            key={opt.label}
            variant={
              statusFilter === opt.value ? "default" : "outline"
            }
            className="cursor-pointer px-3 py-1"
            onClick={() => onStatusFilterChange(opt.value)}
          >
            {opt.label}
          </Badge>
        ))}
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-center py-12">加载中…</p>
      )}

      {isError && (
        <p className="text-destructive text-center py-12">
          加载失败：{(error as Error).message}
        </p>
      )}

      {signs && signs.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          暂无招牌记录
        </p>
      )}

      {signs && signs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {signs.map((sign) => (
            <Link key={sign.id} to={`/edit/${sign.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{sign.shop_name}</CardTitle>
                    <StatusBadge status={sign.status} />
                  </div>
                  <CardDescription>{sign.city}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="text-muted-foreground">{sign.address}</p>
                  <p>
                    <span className="text-muted-foreground">年代：</span>
                    {sign.estimated_era}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
