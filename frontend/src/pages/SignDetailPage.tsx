import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pencil,
  Building2,
  MapPin,
  Store,
  FileText,
  Hash,
  Clock,
} from "lucide-react";
import { fetchSign } from "@/api/neonSigns";
import { Button } from "@/components/ui/button";
import { SignStatusBadge } from "@/components/SignStatusBadge";

/**
 * 招牌详情页：只读展示招牌全部字段，底部提供编辑与返回列表入口。
 */
export function SignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const signId = Number(id);

  useEffect(() => {
    document.title = "招牌详情";
  }, []);

  const {
    data: sign,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sign", signId],
    queryFn: () => fetchSign(signId),
    enabled: !isNaN(signId),
  });

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-center py-12">加载中…</p>
    );
  }

  if (isError || !sign) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild aria-label="返回招牌列表">
            <Link to="/signs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">招牌详情</h1>
        </div>
        <div
          role="region"
          aria-label="错误提示"
          className="text-center py-16 space-y-4 border border-border rounded-lg"
        >
          <p className="text-destructive text-lg font-medium">招牌不存在</p>
          <p className="text-muted-foreground text-sm">
            该招牌记录可能已被删除或编号无效
          </p>
          <Button asChild>
            <Link to="/signs">返回招牌列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  const fields: {
    key: string;
    label: string;
    icon: React.ReactNode;
    value: React.ReactNode;
    ariaLabel: string;
  }[] = [
    {
      key: "id",
      label: "招牌编号",
      icon: <Hash className="h-4 w-4 text-muted-foreground" aria-hidden="true" />,
      value: <span className="text-foreground tabular-nums">#{sign.id}</span>,
      ariaLabel: `招牌编号 ${sign.id}`,
    },
    {
      key: "shop_name",
      label: "关联店名",
      icon: <Store className="h-4 w-4 text-muted-foreground" aria-hidden="true" />,
      value: <span className="text-foreground font-medium">{sign.shop_name}</span>,
      ariaLabel: `关联店名 ${sign.shop_name}`,
    },
    {
      key: "city",
      label: "所在城市",
      icon: <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />,
      value: <span className="text-foreground">{sign.city}</span>,
      ariaLabel: `所在城市 ${sign.city}`,
    },
    {
      key: "location",
      label: "具体位置",
      icon: <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />,
      value: <span className="text-foreground">{sign.location}</span>,
      ariaLabel: `具体位置 ${sign.location}`,
    },
    {
      key: "status",
      label: "招牌状态",
      icon: null,
      value: <SignStatusBadge status={sign.status} />,
      ariaLabel: `招牌状态 ${sign.status}`,
    },
    {
      key: "era_estimate",
      label: "年代估计",
      icon: <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />,
      value: sign.era_estimate ? (
        <span className="text-foreground">{sign.era_estimate}</span>
      ) : (
        <span className="text-muted-foreground italic">暂无</span>
      ),
      ariaLabel: sign.era_estimate ? `年代估计 ${sign.era_estimate}` : "年代估计 暂无",
    },
    {
      key: "remark",
      label: "备注",
      icon: <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />,
      value: sign.remark ? (
        <span className="text-foreground whitespace-pre-wrap">{sign.remark}</span>
      ) : (
        <span className="text-muted-foreground italic">暂无</span>
      ),
      ariaLabel: sign.remark ? `备注 ${sign.remark}` : "备注 暂无",
    },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild aria-label="返回招牌列表">
          <Link to="/signs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">招牌详情</h1>
      </div>

      <dl
        role="region"
        aria-label={`${sign.shop_name} 招牌详细信息`}
        className="border border-border rounded-lg divide-y divide-border"
      >
        {fields.map((field) => (
          <div
            key={field.key}
            className="flex items-start gap-3 px-4 py-3"
            aria-label={field.ariaLabel}
          >
            <dt className="flex items-center gap-2 min-w-[80px] shrink-0">
              {field.icon}
              <span className="text-sm text-muted-foreground">
                {field.label}
              </span>
            </dt>
            <dd className="flex-1 text-sm">{field.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex gap-3 pt-2" role="group" aria-label="详情页操作按钮">
        <Button asChild aria-label={`编辑 ${sign.shop_name} 招牌信息`}>
          <Link to={`/signs/edit/${sign.id}`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            编辑
          </Link>
        </Button>
        <Button variant="outline" asChild aria-label="返回招牌列表">
          <Link to="/signs">返回列表</Link>
        </Button>
      </div>
    </div>
  );
}
