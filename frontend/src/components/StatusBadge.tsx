import { Badge } from "@/components/ui/badge";
import type { RepairStatus } from "@/types/workOrder";

const STATUS_VARIANT: Record<
  RepairStatus,
  "pending" | "processing" | "done"
> = {
  待处理: "pending",
  进行中: "processing",
  已完成: "done",
};

/**
 * 根据维修状态显示对应颜色的 Badge。
 */
export function StatusBadge({ status }: { status: RepairStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}
