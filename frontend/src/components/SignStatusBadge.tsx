import { Badge } from "@/components/ui/badge";
import type { SignStatus } from "@/types/neonSign";

const STATUS_VARIANT: Record<
  SignStatus,
  "on" | "off" | "demolished"
> = {
  亮: "on",
  灭: "off",
  拆: "demolished",
};

/**
 * 根据招牌状态显示对应颜色的 Badge。
 */
export function SignStatusBadge({ status }: { status: SignStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}
