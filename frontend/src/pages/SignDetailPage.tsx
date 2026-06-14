import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Building2, MapPin, Store, FileText } from "lucide-react";
import { fetchSign } from "@/api/neonSigns";
import { Button } from "@/components/ui/button";
import { SignStatusBadge } from "@/components/SignStatusBadge";

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
          <Button variant="ghost" size="icon" asChild>
            <Link to="/signs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">招牌详情</h1>
        </div>
        <div className="text-center py-16 space-y-4 border border-border rounded-lg">
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

  const fields: { label: string; icon: React.ReactNode; value: React.ReactNode }[] = [
    {
      label: "关联店名",
      icon: <Store className="h-4 w-4 text-muted-foreground" />,
      value: <span className="text-foreground font-medium">{sign.shop_name}</span>,
    },
    {
      label: "所在城市",
      icon: <Building2 className="h-4 w-4 text-muted-foreground" />,
      value: <span className="text-foreground">{sign.city}</span>,
    },
    {
      label: "具体位置",
      icon: <MapPin className="h-4 w-4 text-muted-foreground" />,
      value: <span className="text-foreground">{sign.location}</span>,
    },
    {
      label: "招牌状态",
      icon: null,
      value: <SignStatusBadge status={sign.status} />,
    },
  ];

  if (sign.remark) {
    fields.push({
      label: "备注",
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      value: <span className="text-foreground whitespace-pre-wrap">{sign.remark}</span>,
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/signs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">招牌详情</h1>
      </div>

      <div className="border border-border rounded-lg divide-y divide-border">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex items-start gap-3 px-4 py-3"
          >
            <div className="flex items-center gap-2 min-w-[80px] shrink-0">
              {field.icon}
              <span className="text-sm text-muted-foreground">
                {field.label}
              </span>
            </div>
            <div className="flex-1 text-sm">{field.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button asChild>
          <Link to={`/signs/edit/${sign.id}`}>
            <Pencil className="h-4 w-4" />
            编辑
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/signs">返回列表</Link>
        </Button>
      </div>
    </div>
  );
}
