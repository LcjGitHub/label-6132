import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Search, X, Store } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { fetchSigns } from "@/api/neonSigns";
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
import type { SignStatus } from "@/types/neonSign";
import type { NeonSign } from "@/types/neonSign";

const STATUS_FILTER_OPTIONS: { label: string; value: SignStatus | null }[] = [
  { label: "全部", value: null },
  { label: "亮", value: "亮" },
  { label: "灭", value: "灭" },
  { label: "拆", value: "拆" },
];

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
 * 招牌列表页：卡片展示 + 店名搜索 + 状态筛选 + 城市筛选。
 */
export function SignListPage() {
  const [statusFilter, setStatusFilter] = useState<SignStatus | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState<string | null>(null);

  useEffect(() => {
    document.title = "招牌档案管理";
  }, []);

  const { data: signs, isLoading, isError, error } = useQuery({
    queryKey: ["signs", statusFilter, cityFilter, searchKeyword],
    queryFn: () => fetchSigns(statusFilter ?? undefined, cityFilter ?? undefined, searchKeyword ?? undefined),
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

  const { data: statsData } = useQuery({
    queryKey: ["signStats"],
    queryFn: () => fetchSignStats(),
  });

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

      {signs && signs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {signs.map((sign) => (
            <Card key={sign.id} className="overflow-hidden transition-shadow hover:shadow-md">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
