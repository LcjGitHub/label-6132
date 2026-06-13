import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Building2, Lightbulb, LightbulbOff, Trash2 } from "lucide-react";
import { fetchSignStats } from "@/api/signStats";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

function calculatePercentages(
  total: number,
  onCount: number,
  offCount: number,
  removedCount: number
): { on: number; off: number; removed: number } {
  if (total === 0) {
    return { on: 0, off: 0, removed: 0 };
  }

  const exactOn = (onCount / total) * 100;
  const exactOff = (offCount / total) * 100;
  const exactRemoved = (removedCount / total) * 100;

  const floorOn = Math.floor(exactOn);
  const floorOff = Math.floor(exactOff);
  const floorRemoved = Math.floor(exactRemoved);

  const remainderOn = exactOn - floorOn;
  const remainderOff = exactOff - floorOff;
  const remainderRemoved = exactRemoved - floorRemoved;

  let sum = floorOn + floorOff + floorRemoved;
  const deficit = 100 - sum;

  let on = floorOn;
  let off = floorOff;
  let removed = floorRemoved;

  const remainders = [
    { key: "on", value: remainderOn },
    { key: "off", value: remainderOff },
    { key: "removed", value: remainderRemoved },
  ].sort((a, b) => b.value - a.value);

  for (let i = 0; i < deficit; i++) {
    const key = remainders[i % remainders.length].key as "on" | "off" | "removed";
    if (key === "on") on++;
    else if (key === "off") off++;
    else removed++;
  }

  return { on, off, removed };
}

/**
 * 城市霓虹招牌统计看板页面
 */
export function CityDashboardPage() {
  const [selectedCity, setSelectedCity] = useState<string>("全部");

  useEffect(() => {
    document.title = "城市霓虹招牌统计看板";
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["signStats", selectedCity],
    queryFn: () =>
      fetchSignStats(selectedCity === "全部" ? undefined : selectedCity),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            城市霓虹招牌统计看板
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            查看各城市霓虹招牌的亮、灭、拆状态分布统计
          </p>
        </div>
        <div className="w-full sm:w-48">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger>
              <SelectValue placeholder="选择城市" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部城市</SelectItem>
              {data?.cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-center py-12">加载中…</p>
      )}

      {isError && (
        <p className="text-destructive text-center py-12">
          加载失败：{(error as Error).message}
        </p>
      )}

      {data && data.stats.length === 0 && (
        <p className="text-muted-foreground text-center py-12">暂无统计数据</p>
      )}

      {data && data.stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.stats.map((stat) => {
            const pct = calculatePercentages(
              stat.total,
              stat.on_count,
              stat.off_count,
              stat.removed_count
            );
            return (
              <Card key={stat.city} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Building2 className="h-5 w-5 text-primary" />
                      {stat.city}
                    </CardTitle>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      共 {stat.total} 个
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-500 rounded-full">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">亮灯</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stat.on_count}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-green-600">
                      {pct.on}%
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gray-500 rounded-full">
                        <LightbulbOff className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">灭灯</p>
                        <p className="text-2xl font-bold text-gray-600">
                          {stat.off_count}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-600">
                      {pct.off}%
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-500 rounded-full">
                        <Trash2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">已拆除</p>
                        <p className="text-2xl font-bold text-red-600">
                          {stat.removed_count}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-red-600">
                      {pct.removed}%
                    </p>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-green-500 transition-all duration-500"
                      style={{
                        width: `${pct.on}%`,
                      }}
                    />
                    <div
                      className="bg-gray-500 transition-all duration-500"
                      style={{
                        width: `${pct.off}%`,
                      }}
                    />
                    <div
                      className="bg-red-500 transition-all duration-500"
                      style={{
                        width: `${pct.removed}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
