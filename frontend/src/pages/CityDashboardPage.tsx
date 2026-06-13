import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

/**
 * 城市霓虹招牌统计看板页面
 */
export function CityDashboardPage() {
  const [selectedCity, setSelectedCity] = useState<string>("全部");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["signStats", selectedCity],
    queryFn: () =>
      fetchSignStats(selectedCity === "全部" ? undefined : selectedCity),
  });

  const getOnPercentage = (total: number, onCount: number) => {
    return total > 0 ? Math.round((onCount / total) * 100) : 0;
  };

  const getOffPercentage = (total: number, offCount: number) => {
    return total > 0 ? Math.round((offCount / total) * 100) : 0;
  };

  const getRemovedPercentage = (total: number, removedCount: number) => {
    return total > 0 ? Math.round((removedCount / total) * 100) : 0;
  };

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
          {data.stats.map((stat) => (
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
                    {getOnPercentage(stat.total, stat.on_count)}%
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
                    {getOffPercentage(stat.total, stat.off_count)}%
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
                    {getRemovedPercentage(stat.total, stat.removed_count)}%
                  </p>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-500 transition-all duration-500"
                    style={{
                      width: `${getOnPercentage(stat.total, stat.on_count)}%`,
                    }}
                  />
                  <div
                    className="bg-gray-500 transition-all duration-500"
                    style={{
                      width: `${getOffPercentage(stat.total, stat.off_count)}%`,
                    }}
                  />
                  <div
                    className="bg-red-500 transition-all duration-500"
                    style={{
                      width: `${getRemovedPercentage(
                        stat.total,
                        stat.removed_count
                      )}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
