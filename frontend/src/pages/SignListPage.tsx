import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Building2, MapPin, Search, X, Store, Pencil, Plus, Trash2, FileText } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { fetchSigns, deleteSign } from "@/api/neonSigns";
import { fetchSignStats } from "@/api/signStats";
import { SignStatusBadge } from "@/components/SignStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";
import type { SignStatus } from "@/types/neonSign";
import type { NeonSign } from "@/types/neonSign";

const STATUS_FILTER_OPTIONS: { label: string; value: SignStatus | null }[] = [
  { label: "全部", value: null },
  { label: "亮", value: "亮" },
  { label: "灭", value: "灭" },
  { label: "拆", value: "拆" },
];

/**
 * 截断备注字符串，超过指定长度（默认 30 字）时以省略号结尾。
 */
function truncateRemark(text: string | undefined | null, max: number = 30): string | null {
  if (!text) return null;
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function buildCityOptions(signs: NeonSign[] | undefined, statsCities: string[] | undefined): string[] {
  if (statsCities && statsCities.length > 0) {
    return statsCities;
  }
  if (signs) {
    const unique = Array.from(new Set(signs.map((s) => s.city)));
    unique.sort();
    return unique;
  }
  return [];
}

/**
 * 招牌列表页：卡片展示 + 店名搜索 + 状态筛选 + 城市筛选，含备注摘要与增删改入口。
 */
export function SignListPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<SignStatus | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "招牌档案管理";
  }, []);

  const { data: signResponse, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["signs", statusFilter, cityFilter, searchKeyword],
    queryFn: () => fetchSigns(statusFilter ?? undefined, cityFilter ?? undefined, searchKeyword ?? undefined),
    placeholderData: (previousData) => previousData,
  });

  const signs = signResponse?.items;
  const signStats = signResponse?.stats;

  const { data: statsData } = useQuery({
    queryKey: ["signStats"],
    queryFn: () => fetchSignStats(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signs"] });
      setDeletingId(null);
    },
  });

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim() === "" && searchKeyword !== null) {
      setSearchKeyword(null);
    }
  };

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    if (trimmed) {
      setSearchKeyword(trimmed);
    } else {
      setSearchKeyword(null);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearchBlur = () => {
    handleSearch();
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchKeyword(null);
  };

  const cities = useMemo(
    () => buildCityOptions(signs, statsData?.cities),
    [signs, statsData?.cities]
  );

  const handleStatusSelect = (value: SignStatus | null) => {
    setStatusFilter(value);
  };

  const handleCitySelect = (value: string | null) => {
    setCityFilter(value);
  };

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
            招牌档案管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            查看各城市霓虹招牌的状态和位置信息
          </p>
        </div>
        <Button asChild>
          <Link to="/signs/new">
            <Plus className="h-4 w-4" />
            新增招牌
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="输入店名关键词搜索"
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              onBlur={handleSearchBlur}
              className="pl-9 pr-9"
              aria-label="店名搜索"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                aria-label="清空搜索"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button onClick={handleSearch} size="sm">
            搜索
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">状态：</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="状态筛选">
            {STATUS_FILTER_OPTIONS.map((opt) => {
              const isSelected = statusFilter === opt.value;
              return (
                <Badge
                  key={opt.label}
                  variant={isSelected ? "default" : "outline"}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`筛选状态：${opt.label}`}
                  className="cursor-pointer px-3 py-1 select-none"
                  onClick={() => handleStatusSelect(opt.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStatusSelect(opt.value);
                    }
                  }}
                >
                  {opt.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {cities.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">城市：</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="城市筛选">
              {(() => {
                const isAllSelected = cityFilter === null;
                return (
                  <Badge
                    key="全部"
                    variant={isAllSelected ? "default" : "outline"}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isAllSelected}
                    aria-label="显示全部城市"
                    className="cursor-pointer px-3 py-1 select-none"
                    onClick={() => handleCitySelect(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCitySelect(null);
                      }
                    }}
                  >
                    全部
                  </Badge>
                );
              })()}
              {cities.map((city) => {
                const isSelected = cityFilter === city;
                return (
                  <Badge
                    key={city}
                    variant={isSelected ? "default" : "outline"}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`筛选城市：${city}`}
                    className="cursor-pointer px-3 py-1 select-none"
                    onClick={() => handleCitySelect(city)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCitySelect(city);
                      }
                    }}
                  >
                    {city}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {signStats && (
        <div
          role="region"
          aria-label="当前筛选条件下的招牌状态统计"
          className={cn(
            "grid gap-3 sm:grid-cols-[auto,1fr] sm:items-center",
            "bg-muted/30 rounded-lg border border-border",
            "px-3 py-2.5 sm:px-4 sm:py-3",
            isPlaceholderData && "opacity-60 transition-opacity"
          )}
        >
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            当前筛选统计：
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Badge
              variant="secondary"
              className="justify-center gap-1.5 text-xs px-2 py-1.5 min-w-0"
              aria-label={`总计 ${signStats.total} 条招牌`}
            >
              <span className="font-semibold shrink-0">总计</span>
              <span className="tabular-nums font-bold text-foreground">
                {signStats.total}
              </span>
            </Badge>
            <Badge
              variant="outline"
              className="justify-center gap-1.5 text-xs px-2 py-1.5 min-w-0 border-emerald-400/50 bg-emerald-50 text-emerald-700"
              aria-label={`亮灯状态 ${signStats.on_count} 条`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                aria-hidden="true"
              />
              <span className="font-semibold shrink-0">亮</span>
              <span className="tabular-nums font-bold">{signStats.on_count}</span>
            </Badge>
            <Badge
              variant="outline"
              className="justify-center gap-1.5 text-xs px-2 py-1.5 min-w-0 border-slate-400/50 bg-slate-50 text-slate-700"
              aria-label={`灭灯状态 ${signStats.off_count} 条`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full bg-slate-500 shrink-0"
                aria-hidden="true"
              />
              <span className="font-semibold shrink-0">灭</span>
              <span className="tabular-nums font-bold">{signStats.off_count}</span>
            </Badge>
            <Badge
              variant="outline"
              className="justify-center gap-1.5 text-xs px-2 py-1.5 min-w-0 border-amber-400/50 bg-amber-50 text-amber-700"
              aria-label={`已拆除状态 ${signStats.removed_count} 条`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full bg-amber-500 shrink-0"
                aria-hidden="true"
              />
              <span className="font-semibold shrink-0">拆</span>
              <span className="tabular-nums font-bold">{signStats.removed_count}</span>
            </Badge>
          </div>
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

      {signs && signs.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          暂无符合条件的招牌记录
        </p>
      )}

      {deleteMutation.isError && (
        <p className="text-destructive text-center py-3 bg-destructive/10 rounded-md">
          删除失败，请稍后重试
        </p>
      )}

      {signs && signs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {signs.map((sign) => {
            const remarkSummary = truncateRemark(sign.remark);
            return (
              <Card key={sign.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <Link to={`/signs/${sign.id}`} className="block">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Store className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{sign.shop_name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            编号 #{sign.id}
                          </p>
                        </div>
                      </div>
                      <SignStatusBadge status={sign.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{sign.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{sign.location}</span>
                    </div>
                    {remarkSummary && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{remarkSummary}</span>
                      </div>
                    )}
                  </CardContent>
                </Link>
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="gap-1"
                    >
                      <Link to={`/signs/edit/${sign.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                        编辑
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive gap-1"
                      disabled={deletingId === sign.id}
                      onClick={() => handleDeleteClick(sign.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      删除
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
