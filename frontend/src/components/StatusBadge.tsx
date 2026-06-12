import { Badge } from "@/components/ui/badge";
import type { NeonStatus } from "@/types/neon";

const STATUS_VARIANT: Record<
  NeonStatus,
  "on" | "off" | "demolished"
> = {
  亮: "on",
  灭: "off",
  拆: "demolished",
};

/**
 * 根据招牌状态显示对应颜色的 Badge。
 */
export function StatusBadge({ status }: { status: NeonStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}
