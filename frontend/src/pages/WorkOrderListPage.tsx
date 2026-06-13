import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteOrder, fetchOrders } from "@/api/workOrders";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RepairStatus } from "@/types/workOrder";

const FILTER_OPTIONS: { label: string; value: RepairStatus | null }[] = [
  { label: "全部", value: null },
  { label: "待处理", value: "待处理" },
  { label: "进行中", value: "进行中" },
  { label: "已完成", value: "已完成" },
];

/**
 * 工单列表页：表格展示 + 维修状态筛选。
 */
export function WorkOrderListPage({
  statusFilter,
  onStatusFilterChange,
}: {
  statusFilter: RepairStatus | null;
  onStatusFilterChange: (status: RepairStatus | null) => void;
}) {
  const queryClient = useQueryClient();
  const { data: orders, isLoading, isError, error } = useQuery({
    queryKey: ["orders", statusFilter],
    queryFn: () => fetchOrders(statusFilter ?? undefined),
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "霓虹灯维修工单管理";
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setDeletingId(null);
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("确定删除这条工单记录？")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            霓虹灯维修工单管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理各店铺霓虹灯故障维修进度
          </p>
        </div>
        <Button asChild>
          <Link to="/new">
            <Plus className="h-4 w-4" />
            新增工单
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

      {orders && orders.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          暂无工单记录
        </p>
      )}

      {orders && orders.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30">
                <tr className="text-left align-top">
                  <th className="px-4 py-3 font-semibold w-16">ID</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">关联店名</th>
                  <th className="px-4 py-3 font-semibold">故障描述</th>
                  <th className="px-4 py-3 font-semibold w-28 whitespace-nowrap">维修状态</th>
                  <th className="px-4 py-3 font-semibold w-32 whitespace-nowrap">登记日期</th>
                  <th className="px-4 py-3 font-semibold w-36 text-right whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-secondary/20 align-top"
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      #{order.id}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{order.shop_name}</td>
                    <td className="px-4 py-3 text-muted-foreground break-words leading-relaxed">
                      {order.fault_description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {order.registration_date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="编辑"
                        >
                          <Link to={`/edit/${order.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="删除"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingId === order.id}
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
